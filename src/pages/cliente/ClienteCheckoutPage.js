// src/pages/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api'; // Ajusta la ruta a tu apiService
import { useAuth } from '../../AuthContext'; // Ajusta la ruta a tu AuthContext
import '../vendedor/CheckoutPage.css'; // REUTILIZANDO CSS DEL VENDEDOR - Ajusta ruta si es diferente o crea uno nuevo

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading: authLoading } = useAuth(); // Obtener el estado de carga del AuthContext si existe
    const { viajeId: viajeIdFromParams, asientoNumero: asientoNumeroFromParams } = useParams();

    // Intenta obtener viajeData y asientoNumero del state pasado por el Link/navigate,
    // sino, usa los parámetros de la URL (asientoNumeroFromParams)
    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [numeroAsientoSeleccionado, setNumeroAsientoSeleccionado] = useState(
        location.state?.asientoNumero || asientoNumeroFromParams
    );

    const [isLoading, setIsLoading] = useState(false); // Loading para acciones de esta página (compra, carga de viaje si es necesario)
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    // Efecto para cargar datos del viaje si no se pasaron por state
    useEffect(() => {
        const cargarViajeSiEsNecesario = async () => {
            // Solo cargar si no hay viajeData y parsedViajeId es un número válido
            // y si la autenticación no está cargando (para evitar llamadas prematuras si depende del user)
            if (!viajeData && !isNaN(parsedViajeId) && !authLoading) {
                console.log("ClienteCheckoutPage: viajeData no encontrado en state o no coincide, cargando detalles del viaje ID:", parsedViajeId);
                setIsLoading(true); // Loading de esta página
                setError(null);
                try {
                    const response = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    setViajeData(response.data);
                } catch (err) {
                    console.error("ClienteCheckoutPage: Error cargando detalles del viaje:", err);
                    setError("No se pudo cargar la información completa del viaje. Intente de nuevo.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        // No ejecutar si authLoading es true, esperar a que se resuelva la autenticación
        if (!authLoading) {
            cargarViajeSiEsNecesario();
        }
    }, [viajeData, parsedViajeId, authLoading]); // Dependencias


    // Loguear estado de autenticación al montar o cuando cambie
    useEffect(() => {
        console.log("ClienteCheckoutPage - Estado de AuthContext (useEffect):");
        console.log("authLoading:", authLoading);
        console.log("isAuthenticated:", isAuthenticated);
        console.log("user:", user);
    }, [authLoading, isAuthenticated, user]);


    const handleConfirmarCompra = async () => {
        console.log("ClienteCheckoutPage - handleConfirmarCompra - Verificando autenticación:");
        console.log("authLoading:", authLoading);
        console.log("isAuthenticated:", isAuthenticated);
        console.log("user:", user);
        console.log("user.id:", user?.id);

        if (authLoading) {
            setError("Verificando su sesión, por favor espere un momento...");
            return;
        }

        if (!isAuthenticated || !user || !user.id) {
            setError("Debe iniciar sesión para realizar la compra. Redirigiendo al login...");
            console.log("Redirección a login gatillada por: !isAuthenticated O !user O !user.id");
            setTimeout(() => {
                navigate('/login', { state: { from: location } });
            }, 2000); // Pequeña demora para que el usuario vea el mensaje
            return;
        }

        if (!viajeData || !numeroAsientoSeleccionado || isNaN(parsedViajeId)) {
            setError("Falta información del viaje o del asiento, o el ID del viaje es inválido. Por favor, vuelva a intentarlo.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setMensajeExito('');

        const compraRequestDTO = {
            viajeId: parsedViajeId,
            clienteId: user.id, // ID del cliente es el del usuario logueado
            numeroAsiento: parseInt(numeroAsientoSeleccionado, 10),
        };

        console.log("ClienteCheckoutPage: Enviando DTO de compra:", compraRequestDTO);

        try {
            const response = await comprarPasaje(compraRequestDTO);
            console.log("ClienteCheckoutPage: Respuesta de compra exitosa:", response.data);
            setMensajeExito(`¡Pasaje comprado con éxito! ID de Pasaje: ${response.data.id}. En breve recibirá una confirmación.`);
            // Considera deshabilitar el botón o limpiar el formulario aquí
            setTimeout(() => {
                navigate('/'); // O a una página de "Mis Compras" o "Gracias"
            }, 5000);
        } catch (err) {
            const apiError = err.response?.data?.message || err.message || "Ocurrió un error al procesar la compra.";
            console.error("ClienteCheckoutPage: Error en API comprarPasaje:", err.response || err);
            setError(`Error al realizar la compra: ${apiError}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Si el estado de autenticación del AuthContext aún está cargando
    if (authLoading) {
        return (
            <div className="checkout-container cliente-checkout-page">
                <p className="loading-mensaje">Verificando sesión...</p>
            </div>
        );
    }

    // Si estamos cargando datos del viaje (y no es el authLoading)
    if (isLoading && !viajeData && !error) {
        return (
            <div className="checkout-container cliente-checkout-page">
                <p className="loading-mensaje">Cargando información del checkout...</p>
            </div>
        );
    }

    // Si hay un error general o no se pudieron cargar los datos necesarios
    if (error || !viajeData || !numeroAsientoSeleccionado) {
        return (
            <div className="checkout-container cliente-checkout-page">
                <h2>Error en Checkout</h2>
                <p className="error-mensaje">
                    {error || "No se pudo cargar la información necesaria para el checkout. Por favor, intente seleccionar su viaje y asiento nuevamente."}
                </p>
                <button onClick={() => navigate('/viajes')} className="btn-volver">Volver a Viajes</button>
            </div>
        );
    }

    // Si todo está listo, mostrar el resumen y el botón de compra
    return (
        <div className="checkout-container cliente-checkout-page">
            <h2>Confirmar Compra de Pasaje</h2>

            <div className="resumen-compra">
                <h3>Detalles del Viaje</h3>
                <p><strong>Origen:</strong> {viajeData.origenNombre}</p>
                <p><strong>Destino:</strong> {viajeData.destinoNombre}</p>
                <p><strong>Fecha Salida:</strong> {new Date(viajeData.fechaSalida).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p><strong>Ómnibus:</strong> {viajeData.omnibusMatricula}</p>
                <p><strong>Asiento Seleccionado:</strong> N° {numeroAsientoSeleccionado}</p>
                <p className="precio-total"><strong>Total a Pagar:</strong> ${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</p>
            </div>

            {/* Aquí podrían ir los métodos de pago */}
            {/* <MetodoDePagoForm /> */}

            {error && <p className="error-mensaje" role="alert">{error}</p>}
            {mensajeExito && <p className="mensaje-exito" role="alert">{mensajeExito}</p>}

            <div className="acciones-checkout">
                <button
                    onClick={handleConfirmarCompra}
                    disabled={isLoading || !!mensajeExito} // Deshabilitar si está cargando o si ya fue exitoso
                    className="btn-confirmar-compra"
                >
                    {isLoading ? 'Procesando...' : (mensajeExito ? 'Compra Realizada' : 'Confirmar y Pagar')}
                </button>
                {!mensajeExito && ( // Solo mostrar cancelar si la compra no fue exitosa
                    <button onClick={() => navigate(-1)} className="btn-cancelar" disabled={isLoading}>
                        Cancelar y Volver
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClienteCheckoutPage;