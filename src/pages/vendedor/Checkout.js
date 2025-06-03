// src/components/vendedor/Checkout.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    comprarPasaje,
    obtenerUsuariosParaSeleccion,
    obtenerDetallesViajeConAsientos // Para recargar si es necesario
} from '../../services/apiService';
import './Checkout.css'; // Necesitarás crear este archivo CSS

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // 'viajeId' y 'asientoNumero' deben coincidir con los parámetros de tu ruta de checkout
    const { viajeId: viajeIdFromParams, asientoNumero: asientoFromParams } = useParams();

    // Prioriza el estado de la navegación, luego los parámetros de la URL
    const initialViajeData = location.state?.viajeData || null;
    const initialAsiento = location.state?.asientoNumero
        ? parseInt(location.state.asientoNumero, 10)
        : parseInt(asientoFromParams, 10);

    const [viajeData, setViajeData] = useState(initialViajeData);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(initialAsiento);

    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState('');

    const [loadingPago, setLoadingPago] = useState(false); // Para el proceso de pago
    const [loadingInitial, setLoadingInitial] = useState(true); // Para carga de datos iniciales
    const [error, setError] = useState(null); // Para errores generales de carga
    const [compraError, setCompraError] = useState(null); // Para errores específicos de la compra
    const [compraExitosaInfo, setCompraExitosaInfo] = useState(null); // Para info del PasajeResponseDTO

    const userRole = localStorage.getItem('userRole'); // Asume que guardas el rol así
    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    const cargarDatosNecesarios = useCallback(async () => {
        if (isNaN(parsedViajeId) || isNaN(asientoSeleccionado)) {
            setError("Información de viaje o asiento no válida para el checkout.");
            setLoadingInitial(false);
            return;
        }
        setLoadingInitial(true);
        setError(null);
        try {
            // Si viajeData no vino por state o el ID no coincide, la cargamos
            if (!viajeData || viajeData.id !== parsedViajeId) {
                console.log(`Checkout: Recargando detalles de viaje para ID: ${parsedViajeId}`);
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                if (!responseDetalles.data) throw new Error("No se recibieron datos del viaje.");
                setViajeData(responseDetalles.data);
            }

            // Cargar clientes si es Vendedor/Admin
            if (userRole === 'VENDEDOR' || userRole === 'ADMIN') {
                const responseClientes = await obtenerUsuariosParaSeleccion();
                setClientes(responseClientes.data || []);
            } else if (userRole === 'CLIENTE') {
                const clienteLogueadoId = localStorage.getItem('userId'); // Asume que guardas el ID del cliente así
                if (clienteLogueadoId) {
                    setClienteSeleccionadoId(clienteLogueadoId);
                } else {
                    setError("No se pudo identificar al cliente. Por favor, inicie sesión nuevamente.");
                }
            }
        } catch (err) {
            console.error("Checkout: Error al cargar datos:", err);
            setError(err.response?.data?.message || err.message || "Error al preparar la página de checkout.");
            setViajeData(null); // Limpiar si falla
        } finally {
            setLoadingInitial(false);
        }
    }, [parsedViajeId, asientoSeleccionado, userRole, viajeData]); // viajeData para evitar recarga si ya está

    useEffect(() => {
        cargarDatosNecesarios();
    }, [cargarDatosNecesarios]);


    const handleConfirmarYComprar = async () => {
        if (!viajeData || !asientoSeleccionado) {
            setCompraError("Faltan datos del viaje o asiento para procesar la compra.");
            return;
        }
        if ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteSeleccionadoId) {
            setCompraError("Por favor, seleccione un cliente para el pasaje.");
            return;
        }
        if (!clienteSeleccionadoId && userRole === 'CLIENTE') {
            // Esto no debería pasar si se seteó bien en useEffect, pero por si acaso.
            setCompraError("Información del cliente no disponible.");
            return;
        }


        setLoadingPago(true);
        setCompraError(null);
        try {
            // Aquí puedes añadir una simulación más visual de pago si quieres
            console.log("Simulando proceso de pago...");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simula demora de red/pago

            const datosCompra = {
                viajeId: parsedViajeId,
                clienteId: parseInt(clienteSeleccionadoId, 10),
                numeroAsiento: asientoSeleccionado,
            };
            const response = await comprarPasaje(datosCompra);
            setCompraExitosaInfo(response.data); // Guardamos el PasajeResponseDTO
        } catch (err) {
            console.error("Checkout: Error durante la compra:", err);
            setCompraError(err.response?.data?.message || err.message || "Ocurrió un error al intentar comprar el pasaje.");
        } finally {
            setLoadingPago(false);
        }
    };

    if (loadingInitial) return <p className="loading-mensaje">Cargando información del checkout...</p>;
    if (error) return <div className="error-container-checkout"><p className="error-mensaje">{error}</p><button onClick={() => navigate(`/vendedor/viaje/${parsedViajeId}/seleccionar-asientos`)} className="btn-checkout-volver">Volver a Selección</button></div>;
    if (!viajeData || isNaN(asientoSeleccionado)) return <div className="error-container-checkout"><p className="error-mensaje">No se pudo cargar la información necesaria para el checkout.</p><button onClick={() => navigate('/vendedor/listar-viajes-compra')} className="btn-checkout-volver">Buscar Viajes</button></div>;


    return (
        <div className="checkout-page-container">
            <button onClick={() => navigate(`/vendedor/viaje/${parsedViajeId}/seleccionar-asientos`, { state: { viajeData: viajeData } })} className="btn-checkout-volver-atras" disabled={loadingPago || compraExitosaInfo}>
                ← Modificar Selección
            </button>
            <h2>Confirmación y Pago</h2>

            <div className="checkout-resumen-viaje">
                <h3>Detalles de tu Selección</h3>
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date((viajeData.fecha || '') + 'T' + (viajeData.horaSalida || '')).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(asientoSeleccionado).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${parseFloat(viajeData.precio).toFixed(2)}</span></p>
            </div>

            {!compraExitosaInfo && (userRole === 'VENDEDOR' || userRole === 'ADMIN') && (
                <div className="checkout-selector-cliente">
                    <label htmlFor="cliente-checkout">Asignar Pasaje a Cliente:</label>
                    {clientes.length === 0 && !loadingInitial && <p>No hay clientes para seleccionar.</p>}
                    <select
                        id="cliente-checkout"
                        value={clienteSeleccionadoId}
                        onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                        required
                        disabled={loadingPago || loadingInitial}
                    >
                        <option value="">-- Seleccionar Cliente --</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nombre} (ID: {cliente.id})</option>
                        ))}
                    </select>
                </div>
            )}

            {compraError && <p className="error-mensaje checkout-error">{compraError}</p>}

            {!compraExitosaInfo ? (
                <div className="checkout-acciones">
                    <p className="checkout-aviso-pago">Estás a punto de confirmar la compra (pago simulado).</p>
                    <button
                        onClick={handleConfirmarYComprar}
                        className="btn-checkout-pagar"
                        disabled={loadingPago || ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteSeleccionadoId)}
                    >
                        {loadingPago ? 'Procesando...' : `Confirmar y Pagar $${parseFloat(viajeData.precio).toFixed(2)}`}
                    </button>
                </div>
            ) : (
                <div className="checkout-confirmacion-exitosa">
                    <h4>¡Compra Realizada con Éxito!</h4>
                    <p><strong>ID del Pasaje:</strong> {compraExitosaInfo.id}</p>
                    <p><strong>Cliente:</strong> {compraExitosaInfo.clienteNombre}</p>
                    <p><strong>Viaje:</strong> {compraExitosaInfo.origenViaje} → {compraExitosaInfo.destinoViaje}</p>
                    <p><strong>Fecha:</strong> {new Date(compraExitosaInfo.fechaViaje + 'T' + compraExitosaInfo.horaSalidaViaje).toLocaleString()}</p>
                    <p><strong>Asiento:</strong> {String(compraExitosaInfo.numeroAsiento).padStart(2, '0')}</p>
                    <p><strong>Monto Pagado:</strong> ${parseFloat(compraExitosaInfo.precio).toFixed(2)}</p>
                    <div className="checkout-acciones-post">
                        <button onClick={() => navigate('/vendedor/listar-viajes-compra')}>Buscar Otro Viaje</button>
                        <button onClick={() => navigate(`/vendedor/viaje/${parsedViajeId}/seleccionar-asientos`)}>Comprar Otro Asiento (Mismo Viaje)</button>
                        {/* <button onClick={() => alert("Función Descargar PDF no implementada")}>Descargar Pasaje (PDF)</button> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;