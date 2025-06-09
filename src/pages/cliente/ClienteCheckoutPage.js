// src/components/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarMultiplesPasajes } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
const API_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app";

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { viajeId: viajeIdFromParams, asientosString } = useParams();

    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [asientosSeleccionados, setAsientosSeleccionados] = useState(
        location.state?.asientosNumeros || (asientosString ? asientosString.split(',').map(s => parseInt(s, 10)) : [])
    );

    // Estados para el temporizador
    const reservaExpiraEn = location.state?.reservaExpiraEn;
    const [tiempoRestante, setTiempoRestante] = useState("10:00");
    const [reservaExpirada, setReservaExpirada] = useState(false);

    // Otros estados del componente
    const [isLoadingCompra, setIsLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    const [{ isPending }] = usePayPalScriptReducer();
    const parsedViajeId = parseInt(viajeIdFromParams, 10);
    const precioTotal = viajeData?.precio ? (viajeData.precio * asientosSeleccionados.length) : 0;

    // Hook de efecto para manejar la lógica del temporizador
    useEffect(() => {
        if (!reservaExpiraEn) {
            console.error("No se recibió fecha de expiración de la reserva. El pago será deshabilitado.");
            setReservaExpirada(true);
            return;
        }

        const interval = setInterval(() => {
            const ahora = new Date();
            const expiracion = new Date(reservaExpiraEn); // new Date() maneja correctamente la cadena UTC
            const segundosTotales = Math.round((expiracion - ahora) / 1000);

            if (segundosTotales <= 0) {
                setTiempoRestante("00:00");
                setReservaExpirada(true);
                clearInterval(interval);
            } else {
                const minutos = Math.floor(segundosTotales / 60);
                const segundos = segundosTotales % 60;
                setTiempoRestante(
                    `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
                );
            }
        }, 1000);

        // Función de limpieza que se ejecuta cuando el componente se desmonta
        return () => clearInterval(interval);
    }, [reservaExpiraEn]);

    // Función para crear la orden en PayPal (sin cambios)
    const createOrder = async (data, actions) => {
        setIsLoadingCompra(true);
        setErrorCompra(null);

        if (precioTotal <= 0) {
            const errorMsg = "Precio total inválido o no disponible.";
            setErrorCompra(errorMsg);
            setIsLoadingCompra(false);
            return Promise.reject(new Error(errorMsg));
        }

        try {
            const response = await fetch(`${API_URL}/api/paypal/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: precioTotal.toFixed(2) })
            });
            const order = await response.json();
            if (response.ok) {
                return order.id;
            } else {
                throw new Error(`El backend respondió con error ${response.status}: ${order.message || 'Error desconocido'}`);
            }
        } catch (error) {
            setErrorCompra(error.message || "Error al iniciar el pago.");
            setIsLoadingCompra(false);
            return Promise.reject(error);
        }
    };

    // Función que se ejecuta tras la aprobación del pago (sin cambios)
    const onApprove = async (data, actions) => {
        setIsLoadingCompra(true);
        setErrorCompra(null);

        try {
            const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, { method: 'POST' });
            const details = await captureResponse.json();

            if (!captureResponse.ok || details.status !== 'COMPLETED') {
                throw new Error(details.message || "El pago no pudo ser completado en PayPal.");
            }

            const datosCompraMultipleDTO = {
                viajeId: parsedViajeId,
                clienteId: user?.id,
                numerosAsiento: asientosSeleccionados,
                paypalTransactionId: details.id
            };

            const responsePasajes = await comprarMultiplesPasajes(datosCompraMultipleDTO);

            setMensajeExitoCompra({
                message: "¡Compra realizada con éxito!",
                count: responsePasajes.data.length,
                asientos: responsePasajes.data.map(p => p.numeroAsiento).join(', ')
            });
            setErrorCompra(null);

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Hubo un error al confirmar su pago. Por favor, contacte a soporte.";
            setErrorCompra(errorMessage);
        } finally {
            setIsLoadingCompra(false);
        }
    };

    // Función para manejar errores de PayPal (sin cambios)
    const onError = (err) => {
        console.error("Error de PayPal:", err);
        setErrorCompra("Ocurrió un error con el pago o la operación fue cancelada. Por favor, intente de nuevo.");
        setIsLoadingCompra(false);
    };

    // Condición para deshabilitar el botón de pago
    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || !isAuthenticated || !viajeData || reservaExpirada;

    if (authLoading) return <div className="checkout-page-container"><p>Cargando sesión...</p></div>;
    if (!viajeData || asientosSeleccionados.length === 0) return <div className="checkout-page-container"><p>No se encontró la información del viaje o los asientos.</p></div>;

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isLoadingCompra || !!mensajeExitoCompra}>
                ← Modificar Selección
            </button>
            <h2>Confirmación y Pago</h2>

            {!mensajeExitoCompra && (
                <div className={`checkout-timer ${reservaExpirada ? 'expirado' : ''}`}>
                    {reservaExpirada ? (
                        <p><strong>Tu reserva ha expirado.</strong> Por favor, vuelve a seleccionar tus asientos.</p>
                    ) : (
                        <p>Tu reserva expirará en: <strong>{tiempoRestante}</strong></p>
                    )}
                </div>
            )}

            <div className="checkout-resumen-viaje">
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date(viajeData.fechaSalida || (viajeData.fecha + 'T' + viajeData.horaSalida)).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Asientos:</strong> <span className="checkout-asiento-num">{asientosSeleccionados.join(', ')}</span></p>
                <p><strong>Cantidad:</strong> {asientosSeleccionados.length}</p>
                <p><strong>Precio Total:</strong> <span className="checkout-precio-val">${precioTotal.toFixed(2)}</span></p>
            </div>

            {user && (
                <div className="checkout-info-cliente-logueado">
                    <h4>Comprando como:</h4>
                    <p>{user.nombre} {user.apellido} (CI: {user.ci})</p>
                </div>
            )}

            {errorCompra && <p className="error-mensaje checkout-error">{errorCompra}</p>}

            {!mensajeExitoCompra ? (
                <div className="checkout-acciones">
                    {isPending && !reservaExpirada ? (
                        <div className="spinner-paypal"></div>
                    ) : (
                        <PayPalButtons
                            style={{ layout: "vertical", label: "pay" }}
                            disabled={isBotonPagarDisabled}
                            forceReRender={[precioTotal, reservaExpirada]}
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