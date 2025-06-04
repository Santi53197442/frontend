// src/pages/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './CheckoutPage.css'; // Reutilizando CSS del VENDEDOR (o tu CSS de cliente)

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // user DEBE tener la propiedad 'ci'
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
        // Loguear el estado del AuthContext cuando el componente se monta o cambian estos valores
        console.log("ClienteCheckoutPage - AuthContext al montar/actualizar:", { isAuthenticated, user, authLoading });

        const cargarDatosIniciales = async () => {
            if (authLoading) {
                console.log("ClienteCheckoutPage: AuthContext todavía cargando, esperando...");
                return; // Esperar a que AuthContext termine
            }

            setIsLoadingViaje(true);
            setErrorCarga(null);

            if (isNaN(parsedViajeId) || isNaN(parsedAsientoNumero)) {
                setErrorCarga("Información de viaje o asiento no válida en la URL.");
                setIsLoadingViaje(false);
                return;
            }

            // Verificar que el usuario esté autenticado y tenga CI ANTES de cargar más datos
            if (!isAuthenticated || !user || !user.ci) {
                setErrorCarga("Debe iniciar sesión y tener una CI válida para continuar. Por favor, verifique su perfil o inicie sesión.");
                setIsLoadingViaje(false);
                // Podrías redirigir a login aquí si es un error irrecuperable para esta página
                // setTimeout(() => navigate('/login', { state: { from: location } }), 3000);
                return;
            }

            let currentViajeData = viajeData;
            try {
                if (!currentViajeData || currentViajeData.id !== parsedViajeId) {
                    console.log("ClienteCheckoutPage: Cargando detalles del viaje ID:", parsedViajeId);
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    if (!responseDetalles.data || typeof responseDetalles.data.id === 'undefined') {
                        throw new Error("La API no devolvió información válida para el viaje.");
                    }
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData);
                }
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
        console.log("CI del usuario para la compra:", user?.ci);


        if (authLoading) {
            setErrorCompra("Verificando su sesión, por favor espere...");
            return;
        }

        // VERIFICACIÓN CRUCIAL - usando user.ci
        if (!isAuthenticated || !user || !user.ci) { // Asegúrate que user.ci exista y no sea vacío
            setErrorCompra("Debe iniciar sesión y tener una CI válida para comprar. Redirigiendo al login...");
            console.log("Redirección a login gatillada por: !isAuthenticated O !user O !user.ci es inválido. user.ci:", user?.ci);
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

        // ENVIANDO clienteCi
        const datosCompraDTO = {
            viajeId: parsedViajeId,
            clienteCi: user.ci, // <--- USA user.ci (la CI del cliente logueado)
            numeroAsiento: parsedAsientoNumero,
        };

        console.log("ClienteCheckoutPage: Enviando DTO de compra con clienteCi:", datosCompraDTO);

        try {
            const response = await comprarPasaje(datosCompraDTO); // Asumiendo que comprarPasaje espera este DTO
            setMensajeExitoCompra(response.data);
        } catch (err) {
            console.error("ClienteCheckoutPage - Error en API comprarPasaje:", err.response || err);
            setErrorCompra(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setIsLoadingCompra(false);
        }
    };

    // Condición para deshabilitar el botón de pagar
    const isBotonPagarDisabled =
        isLoadingCompra ||          // Si se está procesando la compra
        !!mensajeExitoCompra ||     // Si la compra ya fue exitosa
        authLoading ||              // Si el AuthContext está cargando
        isLoadingViaje ||           // Si los datos del viaje aún están cargando
        !isAuthenticated ||         // Si no está autenticado
        !user?.ci ||                // Si el usuario no existe o no tiene CI <<<--- IMPORTANTE
        !viajeData;                 // Si no hay datos del viaje


    // Estados de carga y error principales
    if (authLoading || isLoadingViaje) {
        return (
            <div className="checkout-page-container cliente-checkout-page">
                <p className="loading-mensaje">
                    {authLoading ? "Verificando sesión..." : "Cargando información del checkout..."}
                </p>
            </div>
        );
    }

    if (errorCarga) {
        return (
            <div className="checkout-page-container cliente-checkout-page error-container-checkout">
                <h2>Error al Cargar</h2>
                <p className="error-mensaje">{errorCarga}</p>
                <button onClick={() => navigate(-1)} className="btn-checkout-volver">Volver</button>
            </div>
        );
    }

    if (!viajeData || isNaN(parsedAsientoNumero)) {
        return (
            <div className="checkout-page-container cliente-checkout-page error-container-checkout">
                <h2>Información Incompleta</h2>
                <p className="error-mensaje">No se pudo cargar la información del viaje o el asiento no es válido.</p>
                <button onClick={() => navigate('/viajes')} className="btn-checkout-volver">Ir a Viajes</button>
            </div>
        );
    }

    // Renderizado principal
    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button
                onClick={() => navigate(-1)}
                className="btn-checkout-volver-atras"
                disabled={isLoadingCompra || !!mensajeExitoCompra}
            >
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
                    <p>CI: {user.ci}</p>
                    <p>Email: {user.email}</p>
                    {/* Si el ID numérico está disponible y quieres mostrarlo para depurar: */}
                    {/* <p>ID (sistema): {user.id}</p> */}
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
                    <p><strong>Viaje:</strong> {mensajeExitoCompra.origenViaje} → {mensajeExitoCompra.destinoViaje}</p>
                    <p><strong>Fecha:</strong> {new Date(mensajeExitoCompra.fechaViaje + 'T' + mensajeExitoCompra.horaSalidaViaje).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p><strong>Asiento:</strong> {String(mensajeExitoCompra.numeroAsiento).padStart(2, '0')}</p>
                    <p><strong>Monto Pagado:</strong> ${parseFloat(mensajeExitoCompra.precio).toFixed(2)}</p>
                    <div className="checkout-acciones-post">
                        <button onClick={() => navigate('/')}>Volver al Inicio</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteCheckoutPage;