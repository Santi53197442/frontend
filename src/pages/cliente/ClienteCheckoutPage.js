// src/pages/cliente/ClienteCheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { comprarPasaje, obtenerDetallesViajeConAsientos } from '../../services/api'; // Ajusta ruta si es necesario
import { useAuth } from '../../AuthContext'; // Ajusta ruta si es necesario
import '../vendedor/CheckoutPage.css'; // REUTILIZANDO CSS DEL VENDEDOR - Ajusta ruta o crea uno nuevo

const ClienteCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { viajeId: viajeIdFromParams, asientoNumero: asientoNumeroFromParams } = useParams();

    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [numeroAsientoSeleccionado, setNumeroAsientoSeleccionado] = useState(
        location.state?.asientoNumero || asientoNumeroFromParams
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    useEffect(() => {
        // Si viajeData no vino por el state, intentar cargarlo
        const cargarViajeSiEsNecesario = async () => {
            if (!viajeData && !isNaN(parsedViajeId)) {
                console.log("ClienteCheckoutPage: viajeData no encontrado en state, cargando detalles del viaje ID:", parsedViajeId);
                setIsLoading(true);
                try {
                    const response = await obtenerDetallesViajeConAsientos(parsedViajeId);
                    setViajeData(response.data);
                } catch (err) {
                    console.error("ClienteCheckoutPage: Error cargando detalles del viaje:", err);
                    setError("No se pudo cargar la información del viaje.");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        cargarViajeSiEsNecesario();
    }, [viajeData, parsedViajeId]); // Dependencias

    const handleConfirmarCompra = async () => {
        if (!isAuthenticated || !user || !user.id) {
            setError("Debe iniciar sesión para realizar la compra.");
            navigate('/login', { state: { from: location } });
            return;
        }
        if (!viajeData || !numeroAsientoSeleccionado || isNaN(parsedViajeId)) {
            setError("Falta información del viaje o del asiento, o el ID del viaje es inválido.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setMensajeExito('');

        const compraRequestDTO = {
            viajeId: parsedViajeId,
            clienteId: user.id, // ID del cliente logueado
            numeroAsiento: parseInt(numeroAsientoSeleccionado, 10),
        };

        console.log("ClienteCheckoutPage: Enviando DTO de compra:", compraRequestDTO);

        try {
            const response = await comprarPasaje(compraRequestDTO);
            console.log("ClienteCheckoutPage: Respuesta de compra:", response.data);
            setMensajeExito(`¡Pasaje comprado con éxito! ID de Pasaje: ${response.data.id}. Revisa tu correo para la confirmación.`);
            setTimeout(() => {
                navigate('/'); // O a '/cliente/mis-compras' si tienes esa página
            }, 5000);
        } catch (err) {
            const apiError = err.response?.data?.message || err.message || "Error al procesar la compra.";
            console.error("ClienteCheckoutPage: Error en API comprarPasaje:", err.response || err);
            setError(`Error al realizar la compra: ${apiError}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !viajeData) { // Muestra cargando si está obteniendo datos del viaje
        return <div className="checkout-container cliente-checkout-page"><p className="loading-mensaje">Cargando información del checkout...</p></div>;
    }

    if (!viajeData || !numeroAsientoSeleccionado) {
        return (
            <div className="checkout-container cliente-checkout-page">
                <h2>Error en Checkout</h2>
                <p className="error-mensaje">{error || "No se pudo cargar la información necesaria para el checkout. Por favor, intente seleccionar su viaje y asiento nuevamente."}</p>
                <button onClick={() => navigate('/viajes')} className="btn-volver">Volver a Viajes</button>
            </div>
        );
    }

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

            {/* Aquí irían los campos para el método de pago si los tuvieras */}
            {/* <MetodoDePagoForm /> */}

            {error && <p className="error-mensaje" role="alert">{error}</p>}
            {mensajeExito && <p className="mensaje-exito" role="alert">{mensajeExito}</p>}

            <div className="acciones-checkout">
                <button
                    onClick={handleConfirmarCompra}
                    disabled={isLoading || !!mensajeExito}
                    className="btn-confirmar-compra"
                >
                    {isLoading ? 'Procesando...' : (mensajeExito ? 'Compra Realizada' : 'Confirmar y Pagar')}
                </button>
                {!mensajeExito && (
                    <button onClick={() => navigate(-1)} className="btn-cancelar" disabled={isLoading}>
                        Cancelar y Volver
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClienteCheckoutPage;