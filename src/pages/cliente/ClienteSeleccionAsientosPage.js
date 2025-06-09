// src/components/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarMultiplesPasajes, obtenerDetallesViajeConAsientos } from '../../services/api';
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

    const [isLoadingViaje, setIsLoadingViaje] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [isLoadingCompra, setIsLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    const [{ isPending }] = usePayPalScriptReducer();

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            if (authLoading) return;
            setIsLoadingViaje(true);
            setErrorCarga(null);
            if (isNaN(parsedViajeId) || asientosSeleccionados.length === 0) {
                setErrorCarga("Información del viaje o asientos inválida.");
                setIsLoadingViaje(false);
                return;
            }
            if (!isAuthenticated || !user?.id) {
                setIsLoadingViaje(false);
                return;
            }
            try {
                if (!viajeData || viajeData.id !== parsedViajeId) {
                    const response = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    setViajeData(response.data);
                }
            } catch (err) {
                setErrorCarga(err.message || "Error al cargar los datos del viaje.");
            } finally {
                setIsLoadingViaje(false);
            }
        };
        cargarDatosIniciales();
    }, [viajeData, parsedViajeId, asientosSeleccionados.length, authLoading, isAuthenticated, user?.id, navigate]);

    const precioTotal = viajeData?.precio ? (viajeData.precio * asientosSeleccionados.length) : 0;

    const createOrder = async (data, actions) => {
        console.log("--- INICIANDO createOrder ---");
        setIsLoadingCompra(true);
        setErrorCompra(null);

        if (precioTotal <= 0) {
            const errorMsg = "Precio total inválido o no disponible.";
            setErrorCompra(errorMsg);
            setIsLoadingCompra(false);
            return Promise.reject(new Error(errorMsg));
        }

        console.log("Intentando crear orden de PayPal para el monto TOTAL:", precioTotal);

        try {
            const response = await fetch(`${API_URL}/api/paypal/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: precioTotal.toFixed(2) })
            });
            const order = await response.json();
            if (response.ok) {
                console.log("Orden de PayPal creada con éxito. ID:", order.id);
                return order.id;
            } else {
                throw new Error(`El backend respondió con error ${response.status}: ${order.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al crear orden de PayPal:", error);
            setErrorCompra(error.message || "Error al iniciar el pago.");
            setIsLoadingCompra(false);
            return Promise.reject(error);
        }
    };

    // ================== FUNCIÓN onApprove CON DEPURACIÓN AÑADIDA ==================
    const onApprove = async (data, actions) => {
        console.log("--- INICIANDO onApprove (confirmación de pago) ---");
        setIsLoadingCompra(true);
        setErrorCompra(null);

        try {
            // Paso 1: Capturar el pago en PayPal
            console.log("Paso 1: Capturando el pago en PayPal con OrderID:", data.orderID);
            const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, { method: 'POST' });
            const details = await captureResponse.json();

            if (!captureResponse.ok || details.status !== 'COMPLETED') {
                console.error("Error en la captura de PayPal:", details);
                throw new Error(details.message || "El pago no pudo ser completado en PayPal.");
            }
            console.log("¡Pago capturado con éxito en PayPal!", details);

            // Paso 2: Preparar los datos para registrar la compra en nuestro sistema
            console.log("Paso 2: Preparando datos para enviar a nuestro backend.");
            const datosCompraMultipleDTO = {
                viajeId: parsedViajeId,
                clienteId: user?.id, // Usamos optional chaining por seguridad
                numerosAsiento: asientosSeleccionados,
                paypalTransactionId: details.id
            };

            // ¡Este console.log es el más importante! Nos muestra qué se enviará.
            console.log(
                "Enviando este DTO al endpoint /comprar-multiple:",
                JSON.stringify(datosCompraMultipleDTO, null, 2)
            );

            // Validar que los datos no sean nulos antes de enviar
            if (!datosCompraMultipleDTO.viajeId || !datosCompraMultipleDTO.clienteId || !datosCompraMultipledDTO.numerosAsiento?.length) {
                throw new Error("Datos de compra incompletos. Faltan viajeId, clienteId o asientos.");
            }

            // Paso 3: Llamar a nuestro backend para crear los pasajes
            console.log("Paso 3: Llamando a la API comprarMultiplesPasajes...");
            const responsePasajes = await comprarMultiplesPasajes(datosCompraMultipleDTO);

            console.log("¡Éxito! El backend respondió con los pasajes creados:", responsePasajes.data);

            setMensajeExitoCompra({
                message: "¡Compra realizada con éxito!",
                count: responsePasajes.data.length,
                asientos: responsePasajes.data.map(p => p.numeroAsiento).join(', ')
            });
            setErrorCompra(null);

        } catch (error) {
            console.error("--- ERROR CAPTURADO EN onApprove ---", error);
            // Intentamos obtener un mensaje de error más específico si viene del backend
            const errorMessage = error.response?.data?.message || error.message || "Hubo un error al confirmar su pago. Por favor, contacte a soporte.";
            console.error("Mensaje de error final:", errorMessage);
            setErrorCompra(errorMessage);
        } finally {
            console.log("--- FINALIZANDO onApprove ---");
            setIsLoadingCompra(false);
        }
    };

    const onError = (err) => {
        console.error("Error de PayPal (onError):", err);
        setErrorCompra("Ocurrió un error con el pago o la operación fue cancelada. Por favor, intente de nuevo.");
        setIsLoadingCompra(false);
    };

    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || isLoadingViaje || !isAuthenticated || !user?.id || !viajeData;

    if (authLoading || isLoadingViaje) return <div className="checkout-page-container"><p>Cargando información...</p></div>;
    if (errorCarga) return <div className="checkout-page-container"><p className="error-mensaje">Error: {errorCarga}</p></div>;
    if (!viajeData || asientosSeleccionados.length === 0) return <div className="checkout-page-container"><p>No se encontró la información del viaje o los asientos.</p></div>;

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isBotonPagarDisabled}>
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago</h2>

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
                    {isPending ? (
                        <div className="spinner-paypal"></div>
                    ) : (
                        <PayPalButtons
                            style={{ layout: "vertical", label: "pay" }}
                            disabled={isBotonPagarDisabled}
                            forceReRender={[precioTotal]}
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                        />
                    )}
                    {isLoadingCompra && !isPending && <p>Procesando pago, por favor espere...</p>}
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