// src/components/vendedor/SeleccionAsientos.js (o donde lo vayas a crear)
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    obtenerDetallesViajeConAsientos, // Ya lo tenías en tu apiService
    obtenerAsientosOcupados,
    comprarPasaje,
    obtenerUsuariosParaSeleccion // Asegúrate que este endpoint esté bien en tu apiService
} from '../../services/apiService'; // Ruta a tu apiService.js
import './SeleccionAsientos.css'; // Crea este archivo CSS o usa el style tag como antes

const SeleccionAsientos = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Para obtener viajeData si se pasó por state
    const { viajeId: viajeIdParam } = useParams(); // Obtiene el viajeId de la URL

    const viajeId = parseInt(viajeIdParam, 10);

    // Estado para los datos del viaje (del DTO ViajeDetalleConAsientosDTO)
    const [viajeDetalles, setViajeDetalles] = useState(location.state?.viajeData || null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [compraError, setCompraError] = useState(null);
    const [compraExitosaInfo, setCompraExitosaInfo] = useState(null); // Para guardar el PasajeResponseDTO

    const cargarDatosIniciales = useCallback(async () => {
        if (isNaN(viajeId)) {
            setError("ID de Viaje inválido en la URL.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setCompraError(null);
            setCompraExitosaInfo(null); // Resetear en cada carga

            let currentViajeDetalles = viajeDetalles;
            // Si no tenemos los detalles o el ID no coincide, los cargamos
            if (!currentViajeDetalles || currentViajeDetalles.id !== viajeId) {
                const responseDetalles = await obtenerDetallesViajeConAsientos(viajeId);
                currentViajeDetalles = responseDetalles.data; // ViajeDetalleConAsientosDTO
                setViajeDetalles(currentViajeDetalles);
            }

            const responseOcupados = await obtenerAsientosOcupados(viajeId);
            setAsientosOcupados(responseOcupados.data || []);

            // Cargar clientes (solo si es VENDEDOR/ADMIN)
            // Asume que tienes una forma de obtener el rol del usuario actual
            const userRole = localStorage.getItem('userRole'); // O como obtengas el rol
            if (userRole === 'VENDEDOR' || userRole === 'ADMIN') {
                const responseClientes = await obtenerUsuariosParaSeleccion();
                setClientes(responseClientes.data || []);
            } else if (userRole === 'CLIENTE') {
                const clienteLogueadoId = localStorage.getItem('userId'); // O como obtengas el ID
                if (clienteLogueadoId) {
                    setClienteSeleccionadoId(clienteLogueadoId);
                } else {
                    setError("No se pudo identificar al cliente para la compra.");
                }
            }
        } catch (err) {
            console.error("Error al cargar datos iniciales:", err);
            const errorMessage = err.response?.data?.message || err.message || "Error al cargar datos.";
            setError(errorMessage);
            setViajeDetalles(null);
        } finally {
            setLoading(false);
        }
    }, [viajeId, viajeDetalles]); // viajeDetalles como dep para que si viene por state, no recargue innecesariamente

    useEffect(() => {
        cargarDatosIniciales();
    }, [cargarDatosIniciales]); // Se ejecuta cuando viajeId (de la URL) cambia


    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento) || compraExitosaInfo) return;
        setAsientoSeleccionado(numeroAsiento === asientoSeleccionado ? null : numeroAsiento);
        setCompraError(null);
    };

    const handleComprarPasaje = async () => {
        if (!asientoSeleccionado) {
            setCompraError("Por favor, seleccione un asiento.");
            return;
        }
        // Validar cliente seleccionado si el rol lo requiere
        const userRole = localStorage.getItem('userRole');
        if ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteSeleccionadoId) {
            setCompraError("Por favor, seleccione un cliente.");
            return;
        }
        if (!viajeDetalles || !viajeDetalles.id) {
            setCompraError("Datos del viaje no disponibles para la compra.");
            return;
        }

        setLoading(true);
        setCompraError(null);

        try {
            // Aquí podrías añadir una simulación de pasarela de pago si quisieras
            console.log("Simulando proceso de pago...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simula espera
            console.log("Pago simulado exitoso!");

            const payload = {
                viajeId: viajeDetalles.id,
                clienteId: parseInt(clienteSeleccionadoId, 10),
                numeroAsiento: asientoSeleccionado,
            };
            const responseCompra = await comprarPasaje(payload);
            setCompraExitosaInfo(responseCompra.data); // Guardamos el PasajeResponseDTO

            // Actualizar UI tras compra exitosa
            setAsientosOcupados(prev => [...prev, asientoSeleccionado].sort((a, b) => a - b));
            setAsientoSeleccionado(null);
            // Actualizar asientos disponibles en viajeDetalles si es necesario mostrarlo
            setViajeDetalles(prev => ({...prev, asientosDisponibles: prev.asientosDisponibles -1 }));

            // alert(`¡Pasaje comprado con éxito! ID: ${responseCompra.data.id}. Asiento: ${responseCompra.data.numeroAsiento}`);

        } catch (err) {
            console.error("Error en la compra del pasaje:", err);
            const errorMessage = err.response?.data?.message || err.message || "Ocurrió un error durante la compra.";
            setCompraError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener la capacidad total de asientos del ómnibus.
    // Tu ViajeDetalleConAsientosDTO debe incluir esta información.
    // Podría ser `viajeDetalles.capacidadOmnibus` o `viajeDetalles.omnibus.capacidadAsientos`.
    const getCapacidadAsientos = () => {
        if (!viajeDetalles) return 0;
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    const renderAsientos = () => {
        const capacidad = getCapacidadAsientos();
        if (capacidad === 0 && !loading) return <p>No se pudo determinar la capacidad del ómnibus.</p>;
        if (capacidad === 0 && loading) return <p>Cargando capacidad de asientos...</p>;

        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionado = asientoSeleccionado === i;
            let claseAsiento = "asiento";
            if (estaOcupado) claseAsiento += " ocupado";
            if (estaSeleccionado) claseAsiento += " seleccionado";

            asientosVisuales.push(
                <button
                    key={i}
                    className={claseAsiento}
                    onClick={() => handleSeleccionarAsiento(i)}
                    disabled={estaOcupado || !!compraExitosaInfo}
                >
                    {i}
                </button>
            );
        }
        // Agrupar en filas (ejemplo 2 pasillo 2)
        const filas = [];
        for (let i = 0; i < asientosVisuales.length; i += 4) {
            filas.push(
                <div key={`fila-${i/4}`} className="fila-asientos">
                    {asientosVisuales.slice(i, i + 2)}
                    <div className="pasillo"></div>
                    {asientosVisuales.slice(i + 2, i + 4)}
                </div>
            );
        }
        return filas;
    };

    // Manejadores para botones de navegación post-compra
    const handleBuscarOtroViaje = () => {
        navigate('/vendedor/viajes/buscar'); // Ajusta esta ruta si es diferente
    };

    const handleComprarOtroPasajeMismoViaje = () => {
        setCompraExitosaInfo(null); // Permite nueva selección
        setAsientoSeleccionado(null);
        // No es necesario recargar todo, solo resetear el estado de compra.
    };


    if (loading && !viajeDetalles) return <p className="loading-mensaje">Cargando datos del viaje...</p>;
    if (error) return <p className="error-mensaje">Error: {error} <button onClick={cargarDatosIniciales}>Reintentar</button></p>;
    if (!viajeDetalles && !loading) return <p>No se encontraron datos para este viaje (ID: {viajeId}). <button onClick={handleBuscarOtroViaje}>Volver al Listado</button></p>;

    const userRole = localStorage.getItem('userRole');

    return (
        <div className="seleccion-asientos-container">
            <h2>Seleccionar Asientos para el Viaje</h2>
            {viajeDetalles && (
                <div className="info-viaje">
                    <p><strong>Viaje ID:</strong> {viajeDetalles.id}</p>
                    <p><strong>Origen:</strong> {viajeDetalles.origenNombre} - <strong>Destino:</strong> {viajeDetalles.destinoNombre}</p>
                    <p><strong>Fecha:</strong> {new Date(viajeDetalles.fechaSalida || (viajeDetalles.fecha + 'T' + viajeDetalles.horaSalida)).toLocaleString()}</p>
                    <p><strong>Precio por asiento:</strong> ${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : 'N/A'}</p>
                    <p><strong>Asientos Disponibles (general):</strong> {viajeDetalles.asientosDisponibles}</p>
                </div>
            )}

            { (userRole === 'VENDEDOR' || userRole === 'ADMIN') && !compraExitosaInfo && (
                <div className="selector-cliente">
                    <label htmlFor="cliente">Seleccionar Cliente:</label>
                    <select id="cliente" value={clienteSeleccionadoId} onChange={(e) => setClienteSeleccionadoId(e.target.value)} required disabled={loading || !!compraExitosaInfo}>
                        <option value="">-- Elija un cliente --</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nombre} (ID: {cliente.id})</option>
                        ))}
                    </select>
                </div>
            )}

            <h3>Mapa de Asientos</h3>
            <div className="leyenda-asientos">
                <span className="asiento-ejemplo disponible"></span> Disponible
                <span className="asiento-ejemplo seleccionado"></span> Seleccionado
                <span className="asiento-ejemplo ocupado"></span> Ocupado
            </div>
            <div className="mapa-asientos-wrapper">
                {loading && getCapacidadAsientos() === 0 ? <p className="loading-mensaje">Cargando asientos...</p> : renderAsientos()}
            </div>

            {asientoSeleccionado && !compraExitosaInfo && (
                <p className="asiento-seleccionado-info">Asiento seleccionado: <strong>{asientoSeleccionado}</strong></p>
            )}

            {compraError && <p className="error-mensaje">{compraError}</p>}

            {!compraExitosaInfo && (
                <button
                    onClick={handleComprarPasaje}
                    disabled={!asientoSeleccionado || ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteSeleccionadoId) || loading}
                    className="btn-comprar-final"
                >
                    {loading ? 'Procesando...' : 'Confirmar y Comprar Pasaje'}
                </button>
            )}

            {compraExitosaInfo && (
                <div className="confirmacion-compra">
                    <h4>¡Compra Exitosa!</h4>
                    <p>Pasaje ID: <strong>{compraExitosaInfo.id}</strong></p>
                    <p>Cliente: <strong>{compraExitosaInfo.clienteNombre}</strong> (ID: {compraExitosaInfo.clienteId})</p>
                    <p>Viaje: {compraExitosaInfo.origenViaje} a {compraExitosaInfo.destinoViaje}</p>
                    <p>Fecha y Hora: {new Date(compraExitosaInfo.fechaViaje + 'T' + compraExitosaInfo.horaSalidaViaje).toLocaleString()}</p>
                    <p>Asiento: <strong>{compraExitosaInfo.numeroAsiento}</strong></p>
                    <p>Precio: ${parseFloat(compraExitosaInfo.precio).toFixed(2)}</p>
                    {/* <button onClick={() => alert("PDF no implementado aún")}>Descargar PDF</button> */}
                    <button onClick={handleComprarOtroPasajeMismoViaje}>Comprar Otro Pasaje (mismo viaje)</button>
                </div>
            )}
            <button onClick={handleBuscarOtroViaje} style={{marginTop: '20px'}} className="btn-volver">
                {compraExitosaInfo ? 'Ir al Listado de Viajes' : 'Cancelar y Volver al Listado'}
            </button>
        </div>
    );
};

export default SeleccionAsientos;