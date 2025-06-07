import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css';

// --- IMPORTACIONES DE PAYPAL ---
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

// --- URL del Backend ---
const API_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app";

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { viajeId: viajeIdFromParams, asientoNumero: asientoNumeroFromParams } = useParams();

    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [numeroAsientoSeleccionado, setNumeroAsientoSeleccionado] = useState(
        location.state?.asientoNumero || asientoNumeroFromParams
    );

    const [isLoadingViaje, setIsLoadingViaje] = useState(true);
    const [errorCarga, setErrorCarga] = useState(null);
    const [isLoadingCompra, setIsLoadingCompra] = useState(false);
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    const [{ isPending }] = usePayPalScriptReducer();

    const parsedViajeId = parseInt(viajeIdFromParams, 10);
    const parsedAsientoNumero = parseInt(numeroAsientoSeleccionado, 10);

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            if (authLoading) return;
            setIsLoadingViaje(true);
            setErrorCarga(null);
            if (isNaN(parsedViajeId) || isNaN(parsedAsientoNumero)) {
                setErrorCarga("Información del viaje o asiento inválida.");
                setIsLoadingViaje(false);
                return;
            }
            if (!isAuthenticated || !user?.id) {
                // No establecemos un error aquí, simplemente el botón de pago estará deshabilitado.
                // Podrías redirigir si prefieres: navigate('/login');
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
    }, [viajeData, parsedViajeId, parsedAsientoNumero, authLoading, isAuthenticated, user?.id, navigate]);


    // --- LÓGICA DE PAYPAL ---

    /**
     * Esta función se comunica con el backend para crear una orden en PayPal.
     * Es llamada cuando el usuario hace clic en el botón de PayPal.
     */
    const createOrder = async (data, actions) => { // <-- CORRECCIÓN: Se añaden (data, actions)
        console.log("--- INICIANDO createOrder ---");
        setIsLoadingCompra(true);
        setErrorCompra(null);

        if (!viajeData || typeof viajeData.precio !== 'number' || viajeData.precio <= 0) {
            const errorMsg = "Precio del viaje inválido o no disponible.";
            console.error(errorMsg, viajeData);
            setErrorCompra(errorMsg);
            setIsLoadingCompra(false);
            return Promise.reject(new Error(errorMsg));
        }

        const precioDelViaje = viajeData.precio;
        console.log("Intentando crear orden para el monto:", precioDelViaje);

        try {
            const response = await fetch(`${API_URL}/api/paypal/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: precioDelViaje.toFixed(2) }) // Es bueno enviar el precio como string con 2 decimales
            });

            console.log("Respuesta del backend recibida. Status:", response.status);
            const order = await response.json();

            if (response.ok) {
                console.log("¡Éxito! Orden de PayPal creada. ID:", order.id);
                // No es necesario cambiar el estado isLoadingCompra a false aquí, PayPal maneja el flujo.
                return order.id; // DEVOLVEMOS EL ID A PAYPAL
            } else {
                const errorMsg = `El backend respondió con error ${response.status}: ${order.message || 'Error desconocido'}`;
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("--- ERROR CAPTURADO en createOrder ---", error);
            setErrorCompra(error.message || "Error al iniciar el pago. Revise la consola.");
            setIsLoadingCompra(false);
            return Promise.reject(error);
        }
    };

    /**
     * Esta función se ejecuta DESPUÉS de que el usuario aprueba el pago en la ventana de PayPal.
     * Captura el pago y registra la compra en nuestro sistema.
     */
    const onApprove = async (data, actions) => { // <-- CORRECCIÓN: Se añaden (data, actions)
        setIsLoadingCompra(true);
        try {
            // Paso A: Capturamos el pago en PayPal a través de nuestro backend.
            const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, {
                method: 'POST',
            });
            const details = await captureResponse.json();

            if (!captureResponse.ok || details.status !== 'COMPLETED') {
                throw new Error(details.message || "El pago no pudo ser completado en PayPal.");
            }

            console.log("Pago capturado con éxito:", details);

            // Paso B: ¡PAGO EXITOSO! Ahora registramos la compra en NUESTRO sistema.
            const datosCompraDTO = {
                viajeId: parsedViajeId,
                clienteId: user.id,
                numeroAsiento: parsedAsientoNumero,
                paypalTransactionId: details.id // Guardamos el ID de la transacción de PayPal
            };

            const responsePasaje = await comprarPasaje(datosCompraDTO);
            setMensajeExitoCompra(responsePasaje.data);
            setErrorCompra(null); // Limpiamos cualquier error previo

        } catch (error) {
            console.error("Error al finalizar la compra:", error);
            setErrorCompra(error.message || "Hubo un error al confirmar su pago. Por favor, contacte a soporte.");
        } finally {
            setIsLoadingCompra(false);
        }
    };

    /**
     * Maneja errores que ocurran en el flujo de PayPal (ej. cierre de ventana, fallo de la tarjeta).
     */
    const onError = (err) => {
        console.error("Error de PayPal:", err);
        setErrorCompra("Ocurrió un error con el pago o la operación fue cancelada. Por favor, intente de nuevo.");
        setIsLoadingCompra(false);
    };

    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || isLoadingViaje || !isAuthenticated || !user?.id || !viajeData;

    if (authLoading || isLoadingViaje) { return <div className="checkout-page-container"><p>Cargando información...</p></div>; }
    if (errorCarga) { return <div className="checkout-page-container"><p className="error-mensaje">Error: {errorCarga}</p></div>; }
    if (!viajeData || isNaN(parsedAsientoNumero)) { return <div className="checkout-page-container"><p>No se encontró la información del viaje.</p></div>; }

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isLoadingCompra || !!mensajeExitoCompra}>
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago</h2>

            <div className="checkout-resumen-viaje">
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date(viajeData.fechaSalida).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(parsedAsientoNumero).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</span></p>
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
                            forceReRender={[viajeData.precio]}
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                        />
                    )}
                    {isLoadingCompra && !isPending && <p>Procesando pago, por favor espere...</p>}
                </div>
            ) : (
                <div className="checkout-confirmacion-exitosa">
                    <h4>¡Compra Realizada con Éxito!</h4>
                    <p><strong>ID del Pasaje:</strong> {mensajeExitoCompra.id}</p>
                    <p><strong>Cliente:</strong> {mensajeExitoCompra.clienteNombre}</p>
                    <p>Recibirás una confirmación por correo electrónico en breve.</p>
                    <button onClick={() => navigate('/mis-viajes')}>Ver Mis Viajes</button>
                </div>
            )}
        </div>
    );
};

export default ClienteCheckoutPage;
