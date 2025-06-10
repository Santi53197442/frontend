// src/components/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarMultiplesPasajes } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
const API_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app";

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // 'user' ahora tiene .tipoCliente
    const { viajeId: viajeIdFromParams, asientosString } = useParams();

    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [asientosSeleccionados, setAsientosSeleccionados] = useState(
        location.state?.asientosNumeros || (asientosString ? asientosString.split(',').map(s => parseInt(s, 10)) : [])
    );

    const reservaExpiraEn = location.state?.reservaExpiraEn;
    const [tiempoRestante, setTiempoRestante] = useState("10:00");
    const [reservaExpirada, setReservaExpirada] = useState(false);

    const [isLoadingCompra, setIsLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    const [{ isPending }] = usePayPalScriptReducer();
    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    // --- Lógica de Precios con Descuento ---
    const precioBasePorAsiento = viajeData?.precio || 0;
    // Leemos el tipo de cliente desde el contexto de autenticación
    const esElegibleParaDescuento = user?.tipoCliente === 'JUBILADO' || user?.tipoCliente === 'ESTUDIANTE';
    const TASA_DESCUENTO = 0.20;

    // useMemo para calcular los precios de forma eficiente
    const calculoPrecio = useMemo(() => {
        const totalBase = precioBasePorAsiento * asientosSeleccionados.length;
        if (esElegibleParaDescuento) {
            const montoDescuento = totalBase * TASA_DESCUENTO;
            const totalFinal = totalBase - montoDescuento;
            return { totalBase, montoDescuento, totalFinal };
        }
        // Si no hay descuento, el monto del descuento es 0 y el total es el base
        return { totalBase, montoDescuento: 0, totalFinal: totalBase };
    }, [precioBasePorAsiento, asientosSeleccionados.length, esElegibleParaDescuento]);

    // Este es el valor que se enviará a PayPal
    const precioTotalParaPayPal = calculoPrecio.totalFinal;

    // Hook de efecto para manejar la lógica del temporizador
    useEffect(() => {
        if (!reservaExpiraEn) {
            setReservaExpirada(true); return;
        }
        const interval = setInterval(() => {
            const segundosTotales = Math.round((new Date(reservaExpiraEn) - new Date()) / 1000);
            if (segundosTotales <= 0) {
                setTiempoRestante("00:00");
                setReservaExpirada(true);
                clearInterval(interval);
            } else {
                const minutos = Math.floor(segundosTotales / 60);
                const segundos = segundosTotales % 60;
                setTiempoRestante(`${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [reservaExpiraEn]);

    // Función para crear la orden en PayPal, usando el precio con descuento
    const createOrder = async () => {
        setIsLoadingCompra(true);
        setErrorCompra(null);

        if (precioTotalParaPayPal <= 0) {
            setErrorCompra("El precio total debe ser mayor que cero para proceder al pago.");
            setIsLoadingCompra(false);
            return Promise.reject(new Error("Precio inválido"));
        }
        try {
            const response = await fetch(`${API_URL}/api/paypal/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: precioTotalParaPayPal.toFixed(2) })
            });
            const order = await response.json();
            if (response.ok) {
                setIsLoadingCompra(false);
                return order.id;
            }
            throw new Error(order.message || 'Error al crear la orden en PayPal');
        } catch (error) {
            setErrorCompra(error.message);
            setIsLoadingCompra(false);
            return Promise.reject(error);
        }
    };

    // Función que se ejecuta tras la aprobación del pago
    const onApprove = async (data) => {
    // 1. Preparamos la UI para la carga
    setIsLoadingCompra(true);
    setErrorCompra(null);

    // 2. Un único bloque try...catch para toda la operación
    try {
        // 3. Capturamos el pago
        const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, { method: 'POST' });
        const details = await captureResponse.json();

        // Imprimimos la respuesta completa para depurar (¡muy útil!)
        console.log("Respuesta COMPLETA de la captura de PayPal:", JSON.stringify(details, null, 2));

        // 4. Validamos la respuesta de la captura
        if (!captureResponse.ok || details.status !== 'COMPLETED') {
            throw new Error(details.message || "El pago no pudo ser completado en PayPal.");
        }

        // 5. Extraemos el ID de la captura de forma segura
        let captureId = null;
        if (details.purchase_units && details.purchase_units[0]?.payments?.captures?.[0]?.id) {
            captureId = details.purchase_units[0].payments.captures[0].id;
        }

        if (!captureId) {
            console.error("¡ERROR CRÍTICO! No se pudo encontrar el 'capture_id' en la respuesta de PayPal.", details);
            throw new Error("No se pudo obtener el ID de la transacción para registrar la compra.");
        }
        
        console.log("ID de captura REAL que se enviará al backend:", captureId);

        // 6. Construimos el DTO con el ID correcto
        const datosCompraMultipleDTO = {
            viajeId: parsedViajeId,
            clienteId: user?.id,
            numerosAsiento: asientosSeleccionados,
            paypalTransactionId: captureId // Usamos el ID correcto
        };

        // 7. Llamamos a nuestro backend para registrar la compra
        const responsePasajes = await comprarMultiplesPasajes(datosCompraMultipleDTO);

        // 8. ¡ÉXITO! Actualizamos la UI con el mensaje de confirmación
        setMensajeExitoCompra({
            message: "¡Compra realizada con éxito!",
            count: responsePasajes.data.length,
            asientos: responsePasajes.data.map(p => p.numeroAsiento).join(', ')
        });

    } catch (error) {
        // Si cualquier paso anterior falla, se captura aquí
        console.error("ERROR CAPTURADO EN onApprove:", error);
        setErrorCompra(error.response?.data?.message || error.message || "Hubo un error al confirmar su pago.");
    } finally {
        // Este bloque se ejecuta siempre, tanto en caso de éxito como de error
        setIsLoadingCompra(false);
    }
};

    // Función para manejar errores de PayPal
    const onError = (err) => {
        console.error("Error de PayPal:", err);
        setErrorCompra("Ocurrió un error con el pago o la operación fue cancelada.");
        setIsLoadingCompra(false);
    };

    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || !isAuthenticated || !viajeData || reservaExpirada;

    if (authLoading) return <div className="checkout-page-container"><p>Cargando...</p></div>;
    if (!viajeData) return <div className="checkout-page-container"><p>Datos del viaje no disponibles.</p></div>;

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isLoadingCompra || !!mensajeExitoCompra}>
                ← Modificar Selección
            </button>
            <h2>Confirmación y Pago</h2>

            {!mensajeExitoCompra && (
                <div className={`checkout-timer ${reservaExpirada ? 'expirado' : ''}`}>
                    {reservaExpirada ? ( <p><strong>Tu reserva ha expirado.</strong> Por favor, vuelve a seleccionar tus asientos.</p> ) : ( <p>Tiempo restante: <strong>{tiempoRestante}</strong></p> )}
                </div>
            )}

            <div className="checkout-resumen-viaje">
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Asientos:</strong> <span className="checkout-asiento-num">{asientosSeleccionados.join(', ')}</span></p>
                <hr style={{margin: '15px 0'}}/>
                <div className="desglose-precios">
                    <p>Precio por asiento: <span>${precioBasePorAsiento.toFixed(2)}</span></p>
                    <p>Cantidad de pasajes: <span>{asientosSeleccionados.length}</span></p>
                    <p>Subtotal: <span>${calculoPrecio.totalBase.toFixed(2)}</span></p>

                    {esElegibleParaDescuento && (
                        <p className="descuento-aplicado">
                            Descuento ({user.tipoCliente} 20%): <span>-${calculoPrecio.montoDescuento.toFixed(2)}</span>
                        </p>
                    )}
                </div>
                <p className="precio-total">
                    <strong>Total a Pagar:</strong>
                    <span className="checkout-precio-val">${precioTotalParaPayPal.toFixed(2)}</span>
                </p>
            </div>

            {user && ( <div className="checkout-info-cliente-logueado"><h4>Comprando como:</h4><p>{user.nombre} {user.apellido} (CI: {user.ci})</p></div> )}
            {errorCompra && <p className="error-mensaje checkout-error">{errorCompra}</p>}

            {!mensajeExitoCompra ? (
                <div className="checkout-acciones">
                    {isPending && !reservaExpirada ? (<div className="spinner-paypal"></div>) : (
                        <PayPalButtons
                            style={{ layout: "vertical", label: "pay" }}
                            disabled={isBotonPagarDisabled}
                            forceReRender={[precioTotalParaPayPal, reservaExpirada]}
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                        />
                    )}
                    {isLoadingCompra && !isPending && <p>Procesando pago...</p>}
                    {reservaExpirada && !isLoadingCompra && <p>El pago ha sido deshabilitado porque tu tiempo ha expirado.</p>}
                </div>
            ) : (
                <div className="checkout-confirmacion-exitosa">
                    <h4>{mensajeExitoCompra.message}</h4>
                    <p>Se han comprado <strong>{mensajeExitoCompra.count}</strong> pasajes para los asientos: <strong>{mensajeExitoCompra.asientos}</strong>.</p>
                    <p>Recibirás una confirmación por correo electrónico en breve.</p>
                    <button onClick={() => navigate('/mis-viajes')}>Ver Mis Viajes</button>
                </div>
            )}
        </div>
    );
};

export default ClienteCheckoutPage;
