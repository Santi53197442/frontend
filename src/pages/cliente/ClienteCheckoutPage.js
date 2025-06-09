// src/components/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// --- CAMBIO 1: Importar la nueva función de API ---
import { comprarMultiplesPasajes, obtenerDetallesViajeConAsientos } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
const API_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app";

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, authLoading } = useAuth();
    // --- CAMBIO 2: Leer el string de asientos de la URL ---
    const { viajeId: viajeIdFromParams, asientosString } = useParams();

    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);

    // --- CAMBIO 3: Convertir el string de asientos a un array numérico ---
    const [asientosSeleccionados, setAsientosSeleccionados] = useState(
        location.state?.asientosNumeros || asientosString.split(',').map(s => parseInt(s, 10)) || []
    );

    const [isLoadingViaje, setIsLoadingViaje] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [isLoadingCompra, setIsLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    const [{ isPending }] = usePayPalScriptReducer();

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    useEffect(() => {
        // ... (Lógica de carga inicial similar, adaptada para el array)
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
    }, [viajeData, parsedViajeId, asientosSeleccionados, authLoading, isAuthenticated, user?.id, navigate]);

    const precioTotal = viajeData?.precio ? (viajeData.precio * asientosSeleccionados.length) : 0;

    // --- CAMBIO 4: createOrder ahora usa el precio total ---
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

        console.log("Intentando crear orden para el monto TOTAL:", precioTotal);

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

    // --- CAMBIO 5: onApprove llama a la nueva función de compra múltiple ---
    const onApprove = async (data, actions) => {
        setIsLoadingCompra(true);
        try {
            const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, { method: 'POST' });
            const details = await captureResponse.json();

            if (!captureResponse.ok || details.status !== 'COMPLETED') {
                throw new Error(details.message || "El pago no pudo ser completado en PayPal.");
            }

            console.log("Pago capturado con éxito:", details);

            // ¡PAGO EXITOSO! Ahora registramos la compra MÚLTIPLE en NUESTRO sistema.
            const datosCompraMultipleDTO = {
                viajeId: parsedViajeId,
                clienteId: user.id,
                numerosAsiento: asientosSeleccionados // Enviamos el array de asientos
                // El paypalTransactionId podría asociarse a todos los pasajes, o solo al primero.
                // Lo gestionaremos en el backend.
            };

            // Llamamos a la nueva función del servicio API
            const responsePasajes = await comprarMultiplesPasajes(datosCompraMultipleDTO);

            // Adaptamos el mensaje de éxito
            setMensajeExitoCompra({
                message: "¡Compra realizada con éxito!",
                count: responsePasajes.data.length,
                asientos: responsePasajes.data.map(p => p.numeroAsiento).join(', ')
            });
            setErrorCompra(null);

        } catch (error) {
            console.error("Error al finalizar la compra:", error);
            const errorMessage = error.response?.data?.message || error.message || "Hubo un error al confirmar su pago. Por favor, contacte a soporte.";
            setErrorCompra(errorMessage);
        } finally {
            setIsLoadingCompra(false);
        }
    };

    const onError = (err) => { /* ... (sin cambios) */ };
    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || isLoadingViaje || !isAuthenticated || !user?.id || !viajeData;

    // ... (lógica de carga y error sin cambios)
    if (authLoading || isLoadingViaje) return <div className="checkout-page-container"><p>Cargando...</p></div>;
    if (errorCarga) return <div className="checkout-page-container"><p className="error-mensaje">{errorCarga}</p></div>;
    if (!viajeData || asientosSeleccionados.length === 0) return <div className="checkout-page-container"><p>No se encontró la información del viaje o los asientos.</p></div>;

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isBotonPagarDisabled}>
                ← Modificar Selección de Asientos
            </button>
            <h2>Confirmación y Pago</h2>

            {/* --- CAMBIO 6: Resumen de viaje adaptado --- */}
            <div className="checkout-resumen-viaje">
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date(viajeData.fechaSalida).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Asientos:</strong> <span className="checkout-asiento-num">{asientosSeleccionados.join(', ')}</span></p>
                <p><strong>Cantidad:</strong> {asientosSeleccionados.length}</p>
                <p><strong>Precio Total:</strong> <span className="checkout-precio-val">${precioTotal.toFixed(2)}</span></p>
            </div>

            {/* ... (Info de cliente y errores sin cambios) ... */}

            {!mensajeExitoCompra ? (
                <div className="checkout-acciones">
                    {isPending ? (
                        <div className="spinner-paypal"></div>
                    ) : (
                        <PayPalButtons
                            style={{ layout: "vertical", label: "pay" }}
                            disabled={isBotonPagarDisabled}
                            forceReRender={[precioTotal]} // Re-renderizar si el precio total cambia
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                        />
                    )}
                    {isLoadingCompra && !isPending && <p>Procesando pago...</p>}
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