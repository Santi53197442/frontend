// src/pages/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api';
import { useAuth } from '../../AuthContext'; // Para obtener el usuario cliente logueado
import './CheckoutPage.css'; // Reutilizando CSS del Vendedor - Ajusta si es necesario

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // 'user' DEBE tener la propiedad 'ci'
    const { viajeId: viajeIdFromParams, asientoNumero: asientoNumeroFromParams } = useParams();

    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [numeroAsientoSeleccionado, setNumeroAsientoSeleccionado] = useState(
        location.state?.asientoNumero || asientoNumeroFromParams
    );

    // Estados para la lógica de esta página
    const [isLoadingViaje, setIsLoadingViaje] = useState(true); // Para la carga inicial de datos del viaje
    const [errorCarga, setErrorCarga] = useState(null);
    const [isLoadingCompra, setIsLoadingCompra] = useState(false); // Para el proceso de compra
    const [errorCompra, setErrorCompra] = useState(null);
    const [mensajeExitoCompra, setMensajeExitoCompra] = useState(null);

    const parsedViajeId = parseInt(viajeIdFromParams, 10);
    const parsedAsientoNumero = parseInt(numeroAsientoSeleccionado, 10);


    useEffect(() => {
        console.log("ClienteCheckoutPage - AuthContext al montar:", { isAuthenticated, user, authLoading });

        const cargarDatosIniciales = async () => {
            if (authLoading) return; // Esperar a que el AuthContext termine de cargar

            setIsLoadingViaje(true);
            setErrorCarga(null);

            if (isNaN(parsedViajeId) || isNaN(parsedAsientoNumero)) {
                setErrorCarga("Información de viaje o asiento no válida.");
                setIsLoadingViaje(false);
                return;
            }

            let currentViajeData = viajeData; // Usar el que vino del state si existe

            try {
                if (!currentViajeData || currentViajeData.id !== parsedViajeId) {
                    console.log("ClienteCheckoutPage: Cargando detalles del viaje ID:", parsedViajeId);
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    if (!responseDetalles.data || typeof responseDetalles.data.id === 'undefined') {
                        throw new Error("La API no devolvió información válida para el viaje.");
                    }
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData); // Actualizar con los datos frescos
                }

                // Validaciones del asiento (copiadas de tu lógica de vendedor)
                if (currentViajeData && currentViajeData.capacidadOmnibus) {
                    if (parsedAsientoNumero < 1 || parsedAsientoNumero > currentViajeData.capacidadOmnibus) {
                        throw new Error(`El asiento ${parsedAsientoNumero} no es válido para este ómnibus.`);
                    }
                    // Asumimos que `numerosAsientoOcupados` viene en `currentViajeData.detallesAsientos` o similar
                    // Necesitarías la función obtenerAsientosOcupados si no viene con obtenerDetallesViajeConAsientos
                    // Por ahora, esta validación podría necesitar ajuste dependiendo de tu DTO ViajeDetalleConAsientosDTO
                    // if (currentViajeData.numerosAsientoOcupados && currentViajeData.numerosAsientoOcupados.includes(parsedAsientoNumero)) {
                    //     throw new Error(`El asiento ${parsedAsientoNumero} ya se encuentra ocupado.`);
                    // }
                }

                if (!isAuthenticated || !user || !user.ci) { // Verificar CI aquí también
                    throw new Error("Debe iniciar sesión y tener una CI registrada para continuar.");
                }

            } catch (err) {
                console.error("ClienteCheckoutPage - Error en cargarDatosIniciales:", err);
                setErrorCarga(err.message || "Error al preparar la información del checkout.");
                setViajeData(null); // Limpiar si hay error
            } finally {
                setIsLoadingViaje(false);
            }
        };

        cargarDatosIniciales();
    }, [viajeIdFromParams, asientoNumeroFromParams, authLoading, isAuthenticated, user]); // Dependencias actualizadas


    const handleConfirmarYComprar = async () => {
        console.log("ClienteCheckoutPage - handleConfirmarYComprar - Verificando Auth y Datos:");
        console.log({ isAuthenticated, user, viajeData, parsedAsientoNumero });

        if (authLoading) {
            setErrorCompra("Verificando sesión, por favor espere...");
            return;
        }

        if (!isAuthenticated || !user || !user.ci) { // La CI es crucial
            setErrorCompra("Debe iniciar sesión y tener una CI válida para comprar. Redirigiendo...");
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
            clienteCi: user.ci, // Usar la CI del usuario logueado
            numeroAsiento: parsedAsientoNumero,
        };

        console.log("ClienteCheckoutPage: Enviando DTO de compra:", datosCompraDTO);

        try {
            // Simulación de pago (opcional)
            // await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await comprarPasaje(datosCompraDTO);
            console.log("ClienteCheckoutPage: Respuesta de compra exitosa:", response.data);
            setMensajeExitoCompra(response.data); // Guardar el objeto PasajeResponseDTO completo
        } catch (err) {
            console.error("ClienteCheckoutPage - Error en API comprarPasaje:", err.response || err);
            setErrorCompra(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setIsLoadingCompra(false);
        }
    };

    const isBotonPagarDisabled = isLoadingCompra || !!mensajeExitoCompra || authLoading || !isAuthenticated || !user?.ci || !viajeData;


    if (authLoading || isLoadingViaje) {
        return (
            <div className="checkout-page-container cliente-checkout-page">
                <p className="loading-mensaje">{authLoading ? "Verificando sesión..." : "Cargando información del checkout..."}</p>
            </div>
        );
    }

    if (errorCarga) {
        return (
            <div className="checkout-page-container cliente-checkout-page error-container-checkout">
                <p className="error-mensaje">{errorCarga}</p>
                <button onClick={() => navigate(-1)} className="btn-checkout-volver">Volver</button>
            </div>
        );
    }

    if (!viajeData || isNaN(parsedAsientoNumero)) {
        return (
            <div className="checkout-page-container cliente-checkout-page error-container-checkout">
                <p className="error-mensaje">No se pudo cargar la información del viaje o el asiento no es válido.</p>
                <button onClick={() => navigate('/viajes')} className="btn-checkout-volver">Ir a Viajes</button>
            </div>
        );
    }

    return (
        <div className="checkout-page-container cliente-checkout-page">
            <button
                onClick={() => navigate(-1)} // Vuelve a la página anterior (selección de asientos)
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

            {/* Información del cliente (ya logueado) */}
            {user && (
                <div className="checkout-info-cliente-logueado">
                    <h4>Comprando como:</h4>
                    <p>Nombre: {user.nombre} {user.apellido}</p>
                    <p>CI: {user.ci}</p>
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
                    <p><strong>Viaje:</strong> {mensajeExitoCompra.origenViaje} → {mensajeExitoCompra.destinoViaje}</p>
                    <p><strong>Fecha:</strong> {new Date(mensajeExitoCompra.fechaViaje + 'T' + mensajeExitoCompra.horaSalidaViaje).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p><strong>Asiento:</strong> {String(mensajeExitoCompra.numeroAsiento).padStart(2, '0')}</p>
                    <p><strong>Monto Pagado:</strong> ${parseFloat(mensajeExitoCompra.precio).toFixed(2)}</p>
                    <div className="checkout-acciones-post">
                        <button onClick={() => navigate('/')}>Volver al Inicio</button>
                        {/* Podrías tener un enlace a "Mis Compras" si existe */}
                        {/* <button onClick={() => navigate('/cliente/mis-compras')}>Ver Mis Compras</button> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteCheckoutPage;