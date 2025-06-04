// src/components/vendedor/Checkout.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    comprarPasaje,
    obtenerUsuariosParaSeleccion,
    obtenerDetallesViajeConAsientos
} from '../../services/api';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId: viajeIdFromUrlParam, asientoNumero: asientoNumeroFromUrlParam } = useParams();

    const initialViajeData = location.state?.viajeData || null;
    const initialAsiento = location.state?.asientoNumero !== undefined
        ? parseInt(location.state.asientoNumero, 10)
        : parseInt(asientoNumeroFromUrlParam, 10);

    const [viajeData, setViajeData] = useState(initialViajeData);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(initialAsiento);

    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(''); // Inicia como string vacío

    const [loadingPago, setLoadingPago] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [error, setError] = useState(null);
    const [compraError, setCompraError] = useState(null);
    const [compraExitosaInfo, setCompraExitosaInfo] = useState(null);

    const userRole = localStorage.getItem('userRole');
    const parsedUrlViajeId = parseInt(viajeIdFromUrlParam, 10);

    useEffect(() => {
        console.log("Checkout Mounted - URL Params:", { viajeIdFromUrlParam, asientoNumeroFromUrlParam });
        console.log("Checkout Mounted - Location State:", location.state);
        console.log("Checkout Mounted - Initial asientoSeleccionado (after parse):", asientoSeleccionado);
        console.log("Checkout Mounted - Parsed Viaje ID from URL:", parsedUrlViajeId);

        const cargarDatos = async () => {
            setLoadingInitialData(true);
            setError(null);

            if (isNaN(parsedUrlViajeId) || isNaN(asientoSeleccionado)) {
                setError("La información del viaje o el número de asiento no son válidos.");
                setLoadingInitialData(false);
                return;
            }

            let currentViajeData = viajeData;

            try {
                if (!currentViajeData || currentViajeData.id !== parsedUrlViajeId) {
                    console.log(`Checkout: Necesita cargar/recargar datos del viaje ID: ${parsedUrlViajeId}`);
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedUrlViajeId);
                    if (!responseDetalles.data || typeof responseDetalles.data.id === 'undefined') {
                        throw new Error("La API no devolvió información válida para el viaje.");
                    }
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData);
                } else {
                    console.log("Checkout: Usando viajeData existente:", currentViajeData);
                }

                if (currentViajeData && currentViajeData.capacidadOmnibus) {
                    if (asientoSeleccionado < 1 || asientoSeleccionado > currentViajeData.capacidadOmnibus) {
                        throw new Error(`El asiento ${asientoSeleccionado} no es válido para este ómnibus.`);
                    }
                }

                if (userRole === 'VENDEDOR' || userRole === 'ADMIN') {
                    const responseClientes = await obtenerUsuariosParaSeleccion();
                    setClientes(responseClientes.data || []);
                } else if (userRole === 'CLIENTE') {
                    const clienteLogueadoId = localStorage.getItem('userId');
                    if (clienteLogueadoId) {
                        setClienteSeleccionadoId(clienteLogueadoId); // Se setea el ID del cliente logueado
                    } else {
                        setError("No se pudo identificar al usuario cliente. Por favor, inicie sesión.");
                    }
                }
            } catch (err) {
                console.error("Checkout - Error en cargarDatos:", err);
                setError(err.message || "Ocurrió un error al cargar la información para el checkout.");
                setViajeData(null);
            } finally {
                setLoadingInitialData(false);
            }
        };
        cargarDatos();
    }, [viajeIdFromUrlParam, asientoNumeroFromUrlParam, userRole]); // Dependencias correctas


    const handleConfirmarYComprar = async () => {
        if (!viajeData || isNaN(asientoSeleccionado)) {
            setCompraError("La información del viaje o del asiento no está completa para continuar.");
            return;
        }

        // --- VALIDACIÓN MEJORADA PARA clienteSeleccionadoId ---
        const idClienteParseado = parseInt(clienteSeleccionadoId, 10);

        if (isNaN(idClienteParseado) || idClienteParseado <= 0) { // Un ID válido debe ser un número positivo
            if (userRole === 'VENDEDOR' || userRole === 'ADMIN') {
                setCompraError("Por favor, seleccione un cliente válido de la lista.");
            } else if (userRole === 'CLIENTE') {
                setCompraError("Información del cliente no disponible o inválida. Intente iniciar sesión de nuevo.");
            }
            return;
        }
        // --- FIN DE VALIDACIÓN MEJORADA ---

        setLoadingPago(true);
        setCompraError(null);
        try {
            console.log("Simulando proceso de pago...");
            await new Promise(resolve => setTimeout(resolve, 1500));

            const datosCompra = {
                viajeId: viajeData.id,
                clienteId: idClienteParseado, // Usar el ID parseado y validado
                numeroAsiento: asientoSeleccionado,
            };
            console.log("Enviando a comprarPasaje:", datosCompra);
            const response = await comprarPasaje(datosCompra);
            setCompraExitosaInfo(response.data);
        } catch (err) {
            console.error("Checkout - Error durante la compra:", err);
            setCompraError(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setLoadingPago(false);
        }
    };

    if (loadingInitialData) {
        return <p className="loading-mensaje">Cargando información del checkout...</p>;
    }
    if (error) {
        return (
            <div className="error-container-checkout">
                <p className="error-mensaje">{error}</p>
                <button
                    onClick={() => navigate(`/vendedor/viaje/${parsedUrlViajeId}/seleccionar-asientos`)}
                    className="btn-checkout-volver"
                >
                    Volver a Selección de Asientos
                </button>
            </div>
        );
    }
    if (!viajeData || typeof viajeData.id === 'undefined' || isNaN(asientoSeleccionado)) {
        return (
            <div className="error-container-checkout">
                <p className="error-mensaje">Información de viaje o asiento no válida para el checkout.</p>
                <button
                    onClick={() => navigate(`/vendedor/viaje/${parsedUrlViajeId}/seleccionar-asientos`)}
                    className="btn-checkout-volver"
                >
                    Volver a Selección de Asientos
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page-container">
            <button
                onClick={() => navigate(`/vendedor/viaje/${viajeData.id}/seleccionar-asientos`, { state: { viajeData: viajeData } })}
                className="btn-checkout-volver-atras"
                disabled={loadingPago || !!compraExitosaInfo}
            >
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago</h2>

            <div className="checkout-resumen-viaje">
                <h3>Detalles de tu Selección</h3>
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date((viajeData.fecha || '') + 'T' + (viajeData.horaSalida || '')).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(asientoSeleccionado).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</span></p>
            </div>

            {!compraExitosaInfo && (userRole === 'VENDEDOR' || userRole === 'ADMIN') && (
                <div className="checkout-selector-cliente">
                    <label htmlFor="cliente-checkout">Asignar Pasaje a Cliente:</label>
                    {clientes.length === 0 && !loadingInitialData && !(userRole === 'CLIENTE') && <p>No hay clientes para seleccionar o no se pudieron cargar.</p>}
                    <select
                        id="cliente-checkout"
                        value={clienteSeleccionadoId} // Sigue siendo el string aquí
                        onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                        required
                        disabled={loadingPago || loadingInitialData}
                    >
                        <option value="">-- Seleccionar Cliente --</option> {/* value es "" */}
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={String(cliente.id)}>{cliente.nombre} (ID: {cliente.id})</option>
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
                        disabled={loadingPago || ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteSeleccionadoId) || (userRole === 'CLIENTE' && !clienteSeleccionadoId)}
                    >
                        {loadingPago ? 'Procesando...' : `Confirmar y Pagar $${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}`}
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
                        <button onClick={() => navigate(`/vendedor/viaje/${viajeData.id}/seleccionar-asientos`)}>Comprar Otro Asiento (Mismo Viaje)</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;