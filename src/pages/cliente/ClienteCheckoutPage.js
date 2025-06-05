// src/pages/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api';
import { useAuth } from '../../AuthContext';
import '../vendedor/CheckoutPage.css'; // Reutilizando CSS del VENDEDOR - Ajusta si es necesario

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // user DEBE tener la propiedad 'id' y 'ci'
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
        console.log("ClienteCheckoutPage - AuthContext al montar/actualizar:", { isAuthenticated, user, authLoading });

        const cargarDatosIniciales = async () => {
            if (authLoading) {
                console.log("ClienteCheckoutPage: AuthContext todavía cargando, esperando...");
                return;
            }
            setIsLoadingViaje(true);
            setErrorCarga(null);

            if (isNaN(parsedViajeId) || isNaN(parsedAsientoNumero)) {
                setErrorCarga("Información de viaje o asiento no válida en la URL.");
                setIsLoadingViaje(false);
                return;
            }

            // Verificar que el usuario esté autenticado y tenga ID numérico ANTES de cargar más datos
            if (!isAuthenticated || !user || typeof user.id === 'undefined' || user.id === null) {
                setErrorCarga("Debe iniciar sesión y tener un ID de usuario válido para continuar. Por favor, verifique su sesión.");
                setIsLoadingViaje(false);
                return;
            }

            let currentViajeData = viajeData;
            try {
                if (!currentViajeData || currentViajeData.id !== parsedViajeId) {
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData);
                }
                // Aquí podrías añadir validaciones de asiento si es necesario,
                // por ejemplo, si el asiento ya está ocupado (requeriría otra llamada API o que venga en viajeData)
            } catch (err) {
                setErrorCarga(err.message || "Error al preparar la información del checkout.");
                setViajeData(null);
            } finally {
                setIsLoadingViaje(false);
            }
        };
        cargarDatosIniciales();
    }, [viajeData, parsedViajeId, parsedAsientoNumero, authLoading, isAuthenticated, user]);


    const handleConfirmarYComprar = async () => {
        console.log("ClienteCheckoutPage - handleConfirmarYComprar - Auth y Datos:", { isAuthenticated, user, viajeData, parsedAsientoNumero });
        console.log("ID del usuario para la compra (user.id):", user?.id); // Log para el ID numérico

        if (authLoading) {
            setErrorCompra("Verificando su sesión, por favor espere...");
            return;
        }

        // VERIFICACIÓN CRUCIAL - usando user.id (el ID numérico)
        if (!isAuthenticated || !user || typeof user.id === 'undefined' || user.id === null) {
            setErrorCompra("Debe iniciar sesión y tener un ID de usuario válido para comprar. Redirigiendo al login...");
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

        const datosCompraDTO = {
            viajeId: parsedViajeId,
            clienteId: user.id, // <--- USA user.id (el ID NUMÉRICO del cliente logueado)
            numeroAsiento: parsedAsientoNumero,
        };

        console.log("ClienteCheckoutPage: Enviando DTO de compra con clienteId (numérico):", datosCompraDTO);

        try {
            const response = await comprarPasaje(datosCompraDTO); // Asumiendo que comprarPasaje espera clienteId numérico
            setMensajeExitoCompra(response.data);
        } catch (err) {
            setErrorCompra(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setIsLoadingCompra(false);
        }
    };

    // Condición para deshabilitar el botón de pagar
    const isBotonPagarDisabled =
        isLoadingCompra ||
        !!mensajeExitoCompra ||
        authLoading ||
        isLoadingViaje ||
        !isAuthenticated ||
        !user?.id || // <<<--- VERIFICA EL ID NUMÉRICO AQUÍ
        !viajeData;

    // Renderizado de Carga y Errores
    if (authLoading || isLoadingViaje) { /* ... tu JSX de carga ... */ }
    if (errorCarga) { /* ... tu JSX de errorCarga ... */ }
    if (!viajeData || isNaN(parsedAsientoNumero)) { /* ... tu JSX si no hay viajeData ... */ }

    return (
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

            {user && ( // Mostrar información del cliente logueado
                <div className="checkout-info-cliente-logueado">
                    <h4>Comprando como:</h4>
                    <p>Nombre: {user.nombre} {user.apellido}</p>
                    <p>CI: {user.ci}</p> {/* Puedes seguir mostrando la CI */}
                    <p>ID (para sistema): {user.id}</p> {/* Muestra el ID numérico */}
                    <p>Email: {user.email}</p>
                </div>
            )}

            {errorCompra && <p className="error-mensaje checkout-error">{errorCompra}</p>}

            {!mensajeExitoCompra ? (
                <div className="checkout-acciones">
                    <p className="checkout-aviso-pago">Verifique los datos antes de confirmar.</p>
                    <button
                        onClick={handleConfirmarYComprar}
                        className="btn-checkout-pagar"
                        disabled={isBotonPagarDisabled}
                    >
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