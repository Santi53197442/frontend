// src/pages/cliente/ClienteCheckoutPage.js - MODIFICADO CON PAYPAL

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api'; // Seguimos usando comprarPasaje
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css';

// 1. --- IMPORTACIONES DE PAYPAL ---
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

// --- URL del Backend (leída desde variables de entorno) ---
// Asegúrate de que tu .env tenga REACT_APP_API_URL
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
    const [isLoadingCompra, setIsLoadingCompra] = useState(false); // Reutilizamos este estado
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    // 2. --- HOOK DE PAYPAL para saber si el script está cargando ---
    const [{ isPending }] = usePayPalScriptReducer();

    const parsedViajeId = parseInt(viajeIdFromParams, 10);
    const parsedAsientoNumero = parseInt(numeroAsientoSeleccionado, 10);

    // El useEffect para cargar datos no necesita cambios, está perfecto.
    useEffect(() => {
        // ... tu lógica de carga de datos existente ...
        // Esta parte está bien, no la pegamos aquí para no alargar el código.
        const cargarDatosIniciales = async () => {
            if (authLoading) return;
            setIsLoadingViaje(true);
            setErrorCarga(null);
            if (isNaN(parsedViajeId) || isNaN(parsedAsientoNumero)) {
                setErrorCarga("Información inválida.");
                setIsLoadingViaje(false);
                return;
            }
            if (!isAuthenticated || !user?.id) {
                setErrorCarga("Debe iniciar sesión para continuar.");
                setIsLoadingViaje(false);
                return;
            }
            try {
                if (!viajeData || viajeData.id !== parsedViajeId) {
                    const response = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    setViajeData(response.data);
                }
            } catch (err) {
                setErrorCarga(err.message || "Error al cargar datos.");
            } finally {
                setIsLoadingViaje(false);
            }
        };
        cargarDatosIniciales();
    }, [viajeData, parsedViajeId, parsedAsientoNumero, authLoading, isAuthenticated, user]);

    // 3. --- LÓGICA DE PAYPAL ---

    // Esta función llama a nuestro backend para crear una orden en PayPal
    const createOrder = async () => {
        setIsLoadingCompra(true); // Mostramos un spinner
        setErrorCompra(null);

        const precioDelViaje = viajeData.precio;

        try {
            const response = await fetch(`${API_URL}/api/paypal/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: precioDelViaje })
            });

            const order = await response.json();
            if (response.ok) {
                return order.id;
            } else {
                throw new Error(order.message || "El backend no pudo crear la orden.");
            }
        } catch (error) {
            console.error("Error al crear la orden de PayPal:", error);
            setErrorCompra("Error al iniciar el pago. Inténtelo de nuevo.");
            setIsLoadingCompra(false);
        }
    };

    // Esta función se ejecuta DESPUÉS de que el usuario aprueba el pago en la ventana de PayPal
    const onApprove = async (data) => {
        // 'data' contiene el orderID de PayPal
        try {
            // Paso A: Capturamos el pago en PayPal a través de nuestro backend.
            const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, {
                method: 'POST',
            });
            const details = await captureResponse.json();

            if (!captureResponse.ok || details.status !== 'COMPLETED') {
                throw new Error(details.message || "El pago no pudo ser completado en PayPal.");
            }

            // Paso B: ¡PAGO EXITOSO! Ahora registramos la compra en NUESTRO sistema.
            // Reutilizamos la lógica que ya tenías en handleConfirmarYComprar.
            const datosCompraDTO = {
                viajeId: parsedViajeId,
                clienteId: user.id, // ID numérico del cliente logueado
                numeroAsiento: parsedAsientoNumero,
                // Opcional pero recomendado: guardar el ID de la transacción de PayPal
                paypalTransactionId: details.id
            };

            // Llamamos a nuestro endpoint seguro para guardar el pasaje
            const responsePasaje = await comprarPasaje(datosCompraDTO);
            setMensajeExitoCompra(responsePasaje.data);

        } catch (error) {
            console.error("Error al finalizar la compra:", error);
            setErrorCompra(error.message || "Hubo un error al confirmar su pago. Por favor, contacte a soporte.");
        } finally {
            setIsLoadingCompra(false);
        }
    };

    // Maneja errores que ocurran en la ventana de PayPal
    const onError = (err) => {
        console.error("Error de PayPal:", err);
        setErrorCompra("Ocurrió un error con el pago. Por favor, verifique sus datos o intente más tarde.");
        setIsLoadingCompra(false);
    };

    // Condición para deshabilitar los botones (ahora de PayPal)
    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || isLoadingViaje || !isAuthenticated || !user?.id || !viajeData;

    // Renderizado de Carga y Errores (sin cambios)
    if (authLoading || isLoadingViaje) { return <p>Cargando información...</p>; }
    if (errorCarga) { return <p>Error: {errorCarga}</p>; }
    if (!viajeData || isNaN(parsedAsientoNumero)) { return <p>No se encontró la información del viaje.</p>; }

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isLoadingCompra || !!mensajeExitoCompra}>
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago</h2>

            <div className="checkout-resumen-viaje">
                {/* ... tu JSX de resumen de viaje no cambia ... */}
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date(viajeData.fechaSalida).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(parsedAsientoNumero).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</span></p>
            </div>

            {/* ... tu JSX de info de cliente no cambia ... */}
            {user && (
                <div className="checkout-info-cliente-logueado">
                    <h4>Comprando como:</h4>
                    <p>{user.nombre} {user.apellido} (CI: {user.ci})</p>
                </div>
            )}

            {errorCompra && <p className="error-mensaje checkout-error">{errorCompra}</p>}

            {!mensajeExitoCompra ? (
                <div className="checkout-acciones">
                    {/* 4. --- REEMPLAZO DEL BOTÓN ANTIGUO POR EL DE PAYPAL --- */}
                    {isPending || isLoadingCompra ? (
                        <p>Cargando opciones de pago...</p>
                    ) : (
                        <PayPalButtons
                            style={{ layout: "vertical", label: "pay" }}
                            disabled={isBotonPagarDisabled}
                            forceReRender={[viajeData.precio]} // Importante si el precio pudiera cambiar
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                        />
                    )}
                </div>
            ) : (
                <div className="checkout-confirmacion-exitosa">
                    {/* ... tu JSX de éxito de compra no cambia ... */}
                    <h4>¡Compra Realizada con Éxito!</h4>
                    <p><strong>ID del Pasaje:</strong> {mensajeExitoCompra.id}</p>
                    <p><strong>Cliente:</strong> {mensajeExitoCompra.clienteNombre}</p>
                    <p>Recibirás una confirmación por correo electrónico.</p>
                    <button onClick={() => navigate('/mis-viajes')}>Ver Mis Viajes</button>
                </div>
            )}
        </div>
    );
};

export default ClienteCheckoutPage;