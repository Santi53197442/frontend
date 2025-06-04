// src/pages/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css'; // Reutilizando CSS del VENDEDOR

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // 'user' DEBE tener la propiedad 'id'
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

    const parsedViajeId = parseInt(viajeIdFromParams, 10);
    const parsedAsientoNumero = parseInt(numeroAsientoSeleccionado, 10);

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            if (authLoading) {
                console.log("ClienteCheckoutPage: AuthContext todavía cargando, esperando...");
                return;
            }
            console.log("ClienteCheckoutPage - AuthContext listo:", { isAuthenticated, user });

            setIsLoadingViaje(true);
            setErrorCarga(null);

            if (isNaN(parsedViajeId) || isNaN(parsedAsientoNumero)) {
                setErrorCarga("Información de viaje o asiento no válida en la URL.");
                setIsLoadingViaje(false);
                return;
            }

            // Verificar autenticación y datos del usuario ANTES de cargar el viaje
            if (!isAuthenticated || !user || typeof user.id === 'undefined' || user.id === null) {
                setErrorCarga("Debe iniciar sesión y tener un ID de usuario válido para continuar.");
                setIsLoadingViaje(false);
                // Podrías redirigir aquí si prefieres, o dejar que el botón de compra lo maneje
                return;
            }

            let currentViajeData = viajeData;
            try {
                if (!currentViajeData || currentViajeData.id !== parsedViajeId) {
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    if (!responseDetalles.data || typeof responseDetalles.data.id === 'undefined') {
                        throw new Error("La API no devolvió información válida para el viaje.");
                    }
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData);
                }
                // Puedes añadir validaciones de asiento aquí si es necesario
            } catch (err) {
                console.error("ClienteCheckoutPage - Error en cargarDatosIniciales:", err);
                setErrorCarga(err.message || "Error al preparar la información del checkout.");
                setViajeData(null);
            } finally {
                setIsLoadingViaje(false);
            }
        };
        cargarDatosIniciales();
    }, [viajeData, parsedViajeId, parsedAsientoNumero, authLoading, isAuthenticated, user]);


    const handleConfirmarYComprar = async () => {
        console.log("ClienteCheckoutPage - handleConfirmarYComprar - Verificando Auth y Datos:");
        console.log({ isAuthenticated, user, viajeData, parsedAsientoNumero });

        if (authLoading) {
            setErrorCompra("Verificando su sesión, por favor espere...");
            return;
        }

        // VERIFICACIÓN CRUCIAL - usando user.id
        if (!isAuthenticated || !user || typeof user.id === 'undefined' || user.id === null) {
            setErrorCompra("Debe iniciar sesión y tener un ID de usuario válido para comprar. Redirigiendo...");
            console.log("Redirección a login gatillada por: !isAuthenticated O !user O user.id es inválido. user.id:", user?.id);
            setTimeout(() => navigate('/login', { state: { from: location } }), 2000);
            return;
        }

        if (!viajeData || isNaN(parsedAsientoNumero) || isNaN(parsedViajeId)) {
            setErrorCompra("La información del viaje o del asiento no está completa o es inválida.");
            return;
        }

        setIsLoadingCompra(true);
        setErrorCompra(null);
        setMensajeExitoCompra(null);

        // ENVIANDO clienteId (numérico)
        const datosCompraDTO = {
            viajeId: parsedViajeId,
            clienteId: user.id, // <--- USA user.id (ID numérico)
            numeroAsiento: parsedAsientoNumero,
        };

        console.log("ClienteCheckoutPage: Enviando DTO de compra:", datosCompraDTO);

        try {
            const response = await comprarPasaje(datosCompraDTO);
            setMensajeExitoCompra(response.data);
            // setTimeout(() => { navigate('/'); }, 5000); // Comentado para probar sin redirección automática
        } catch (err) {
            console.error("ClienteCheckoutPage - Error en API comprarPasaje:", err.response || err);
            setErrorCompra(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setIsLoadingCompra(false);
        }
    };

    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || isLoadingViaje || !isAuthenticated || !user?.id || !viajeData;

    if (authLoading || isLoadingViaje) {
        return <div className="checkout-page-container cliente-checkout-page"><p className="loading-mensaje">{authLoading ? "Verificando sesión..." : "Cargando información del checkout..."}</p></div>;
    }
    if (errorCarga) { /* ... tu JSX de errorCarga ... */ }
    if (!viajeData || isNaN(parsedAsientoNumero)) { /* ... tu JSX si no hay viajeData ... */ }

    return (
        // ... (tu JSX principal se mantiene igual, solo asegúrate que use parsedAsientoNumero y viajeData.precio)
        <div className="checkout-page-container cliente-checkout-page">
            <button onClick={() => navigate(-1)} className="btn-checkout-volver-atras" disabled={isLoadingCompra || !!mensajeExitoCompra}>
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago (Cliente)</h2>
            <div className="checkout-resumen-viaje">
                <h3>Detalles de tu Selección</h3>
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date(viajeData.fechaSalida).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(parsedAsientoNumero).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</span></p>
            </div>
            {user && (
                <div className="checkout-info-cliente-logueado">
                    <h4>Comprando como:</h4>
                    <p>Nombre: {user.nombre} {user.apellido}</p>
                    <p>CI: {user.ci}</p> {/* Sigues mostrando la CI */}
                    <p>ID (para sistema): {user.id}</p> {/* Puedes mostrar el ID si quieres para depurar */}
                    <p>Email: {user.email}</p>
                </div>
            )}
            {errorCompra && <p className="error-mensaje checkout-error">{errorCompra}</p>}
            {!mensajeExitoCompra ? (
                <div className="checkout-acciones">
                    <p className="checkout-aviso-pago">Verifique los datos antes de confirmar.</p>
                    <button onClick={handleConfirmarYComprar} className="btn-checkout-pagar" disabled={isBotonPagarDisabled}>
                        {isLoadingCompra ? 'Procesando...' : `Confirmar y Pagar $${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}`}
                    </button>
                </div>
            ) : (
                <div className="checkout-confirmacion-exitosa">
                    <h4>¡Compra Realizada con Éxito!</h4>
                    <p><strong>ID del Pasaje:</strong> {mensajeExitoCompra.id}</p>
                    <p><strong>Cliente:</strong> {mensajeExitoCompra.clienteNombre} (CI: {user.ci})</p>
                    {/* ... resto de los detalles del pasaje comprado ... */}
                    <div className="checkout-acciones-post">
                        <button onClick={() => navigate('/')}>Volver al Inicio</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteCheckoutPage;