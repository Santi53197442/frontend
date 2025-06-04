// src/components/vendedor/Checkout.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    comprarPasaje,
    obtenerUsuariosParaSeleccion,
    obtenerDetallesViajeConAsientos // Para recargar si es necesario
} from '../../services/apiService'; // Ajusta la ruta a tu apiService
import './Checkout.css'; // Asegúrate de que el CSS exista en esta ruta

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId: viajeIdFromUrl, asientoNumero: asientoFromUrl } = useParams(); // Nombres claros de params

    // --- Estados ---
    // Inicializar con lo que viene del state de la navegación O de la URL directamente
    const [viajeData, setViajeData] = useState(location.state?.viajeData || null);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(
        location.state?.asientoNumero !== undefined
            ? parseInt(location.state.asientoNumero, 10)
            : parseInt(asientoFromUrl, 10)
    );

    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState('');

    const [loadingPago, setLoadingPago] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(true); // Para la carga inicial
    const [error, setError] = useState(null);
    const [compraError, setCompraError] = useState(null);
    const [compraExitosaInfo, setCompraExitosaInfo] = useState(null);

    const userRole = localStorage.getItem('userRole');
    // Parsear el ID del viaje de la URL una vez
    const parsedViajeIdFromUrl = parseInt(viajeIdFromUrl, 10);

    // --- Efecto para cargar datos iniciales ---
    useEffect(() => {
        // Convertir el número de asiento de la URL a número para la validación inicial
        const parsedAsientoFromUrl = parseInt(asientoFromUrl, 10);

        // Log inicial para depuración
        console.log("Checkout Mounted - URL Params:", { viajeIdFromUrl, asientoFromUrl });
        console.log("Checkout Mounted - Location State:", location.state);
        console.log("Checkout Mounted - Initial asientoSeleccionado (after parse):", asientoSeleccionado);
        console.log("Checkout Mounted - Parsed Viaje ID from URL:", parsedViajeIdFromUrl);


        const cargarDatos = async () => {
            setLoadingInitialData(true);
            setError(null); // Resetear error en cada intento de carga

            // Validar IDs antes de proceder
            if (isNaN(parsedViajeIdFromUrl) || isNaN(asientoSeleccionado)) {
                setError("La información del viaje o el número de asiento no son válidos.");
                setLoadingInitialData(false);
                return;
            }

            let currentViajeData = viajeData; // Usa el estado actual si ya existe

            try {
                // Si no tenemos viajeData (ej. recarga de página) O si el ID no coincide con la URL, la cargamos
                if (!currentViajeData || currentViajeData.id !== parsedViajeIdFromUrl) {
                    console.log(`Checkout: Necesita cargar/recargar datos del viaje ID: ${parsedViajeIdFromUrl}`);
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeIdFromUrl);
                    if (!responseDetalles.data || typeof responseDetalles.data.id === 'undefined') {
                        throw new Error("La API no devolvió información válida para el viaje.");
                    }
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData); // Actualiza el estado
                    console.log("Checkout: ViajeData cargada desde API:", currentViajeData);
                } else {
                    console.log("Checkout: Usando viajeData existente desde location.state o ya cargada:", currentViajeData);
                }

                // Validar el asiento seleccionado contra la capacidad del ómnibus (si tenemos los datos)
                if (currentViajeData && currentViajeData.capacidadOmnibus) {
                    if (asientoSeleccionado < 1 || asientoSeleccionado > currentViajeData.capacidadOmnibus) {
                        throw new Error(`El asiento número ${asientoSeleccionado} no es válido para la capacidad de este ómnibus (${currentViajeData.capacidadOmnibus}).`);
                    }
                    // Podrías también verificar si el asiento está en numerosAsientoOcupados aquí, aunque ya debería estar filtrado
                    // if (currentViajeData.numerosAsientoOcupados && currentViajeData.numerosAsientoOcupados.includes(asientoSeleccionado)) {
                    //    throw new Error(`El asiento ${asientoSeleccionado} ya está ocupado.`);
                    // }
                }


                // Cargar clientes si es VENDEDOR/ADMIN
                if (userRole === 'VENDEDOR' || userRole === 'ADMIN') {
                    const responseClientes = await obtenerUsuariosParaSeleccion();
                    setClientes(responseClientes.data || []);
                } else if (userRole === 'CLIENTE') {
                    const clienteLogueadoId = localStorage.getItem('userId');
                    if (clienteLogueadoId) {
                        setClienteSeleccionadoId(clienteLogueadoId);
                    } else {
                        // Considerar esto como un error que impide la compra para el cliente
                        setError("No se pudo identificar al usuario cliente. Por favor, inicie sesión.");
                    }
                }
            } catch (err) {
                console.error("Checkout - Error en cargarDatos:", err);
                setError(err.message || "Ocurrió un error al cargar la información para el checkout.");
                setViajeData(null); // Limpiar si la carga crítica falla
            } finally {
                setLoadingInitialData(false);
            }
        };

        cargarDatos();
        // Dependencias: Los parámetros de la URL son los que definen QUÉ cargar.
        // location.state es solo para el valor inicial.
        // No incluir viajeData o asientoSeleccionado (estados) aquí para evitar bucles si se setean dentro.
    }, [viajeIdFromUrl, asientoFromUrl, userRole]); // Se re-ejecuta si cambia la URL


    const handleConfirmarYComprar = async () => {
        // Validaciones antes de la compra
        if (!viajeData || isNaN(asientoSeleccionado)) {
            setCompraError("La información del viaje o del asiento no está completa para continuar.");
            return;
        }
        if ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteSeleccionadoId) {
            setCompraError("Por favor, seleccione un cliente para este pasaje.");
            return;
        }
        if (userRole === 'CLIENTE' && !clienteSeleccionadoId) {
            setCompraError("No se pudo identificar al cliente para realizar la compra.");
            return;
        }

        setLoadingPago(true);
        setCompraError(null);
        try {
            console.log("Simulando proceso de pago...");
            await new Promise(resolve => setTimeout(resolve, 1500));

            const datosCompra = {
                viajeId: viajeData.id, // Usar el ID del viajeData cargado
                clienteId: parseInt(clienteSeleccionadoId, 10),
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

    // --- Renderizado Condicional ---
    if (loadingInitialData) {
        return <p className="loading-mensaje">Cargando información del checkout...</p>;
    }

    if (error) { // Error general durante la carga inicial
        return (
            <div className="error-container-checkout">
                <p className="error-mensaje">{error}</p>
                <button
                    onClick={() => navigate(`/vendedor/viaje/${viajeIdFromUrl}/seleccionar-asientos`, { state: { viajeData: viajeData }})}
                    className="btn-checkout-volver"
                >
                    Volver a Selección de Asientos
                </button>
            </div>
        );
    }

    // Si después de cargar, viajeData sigue sin ser válido o asientoSeleccionado es NaN, mostramos error
    if (!viajeData || typeof viajeData.id === 'undefined' || isNaN(asientoSeleccionado)) {
        return (
            <div className="error-container-checkout">
                <p className="error-mensaje">Información de viaje o asiento no válida para el checkout.</p>
                <button
                    onClick={() => navigate(`/vendedor/viaje/${viajeIdFromUrl}/seleccionar-asientos`)}
                    className="btn-checkout-volver"
                >
                    Volver a Selección de Asientos
                </button>
            </div>
        );
    }

    // --- Renderizado Principal ---
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
                        value={clienteSeleccionadoId}
                        onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                        required
                        disabled={loadingPago || loadingInitialData}
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