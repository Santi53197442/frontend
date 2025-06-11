import React, { useState, useEffect, useCallback } from 'react';
import {
    obtenerTodosLosOmnibus, // Para el selector de ómnibus
    buscarViajesDeOmnibus   // La nueva función que creamos
} from '../../services/api';

// Se importa el archivo CSS para aplicar los estilos
import './VendedorListarViajes.css';

// Opciones para los selectores
const ESTADOS_VIAJE_OPTIONS = [
    { value: '', label: 'Todos los Estados' },
    { value: 'PROGRAMADO', label: 'Programado' },
    { value: 'EN_CURSO', label: 'En Curso' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'CANCELADO', label: 'Cancelado' },
];

const ORDENAR_POR_OPTIONS = [
    { value: 'fecha', label: 'Fecha' },
    { value: 'horaSalida', label: 'Hora de Salida' },
    { value: 'estado', label: 'Estado del Viaje' },
];

const DIRECCION_ORDEN_OPTIONS = [
    { value: 'ASC', label: 'Ascendente' },
    { value: 'DESC', label: 'Descendente' },
];

const VendedorListarViajes = () => {
    const [omnibusLista, setOmnibusLista] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');

    // Estado para los filtros y ordenamiento
    const [filtros, setFiltros] = useState({
        fechaDesde: '',
        fechaHasta: '',
        estadoViaje: '',
        ordenarPor: 'fecha',
        direccionOrden: 'ASC',
    });

    const [viajes, setViajes] = useState([]);
    const [loadingOmnibus, setLoadingOmnibus] = useState(false);
    const [loadingViajes, setLoadingViajes] = useState(false);
    const [error, setError] = useState(null);

    // Cargar lista de ómnibus al montar el componente
    useEffect(() => {
        const fetchOmnibus = async () => {
            setLoadingOmnibus(true);
            try {
                const response = await obtenerTodosLosOmnibus();
                setOmnibusLista(response.data || []);
            } catch (err) {
                setError('Error al cargar la lista de ómnibus.');
                console.error(err);
            } finally {
                setLoadingOmnibus(false);
            }
        };
        fetchOmnibus();
    }, []);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscarViajes = useCallback(async () => {
        if (!selectedOmnibusId) {
            setError('Por favor, seleccione un ómnibus.');
            setViajes([]);
            return;
        }
        setError(null);
        setLoadingViajes(true);
        try {
            // Construir parámetros solo con valores definidos
            const params = {};
            if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
            if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
            if (filtros.estadoViaje) params.estadoViaje = filtros.estadoViaje;
            params.ordenarPor = filtros.ordenarPor;
            params.direccionOrden = filtros.direccionOrden;

            const response = await buscarViajesDeOmnibus(selectedOmnibusId, params);
            setViajes(response.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al buscar los viajes.';
            setError(errorMessage);
            setViajes([]);
            console.error(err);
        } finally {
            setLoadingViajes(false);
        }
    }, [selectedOmnibusId, filtros]);

    // Función auxiliar para obtener la clase CSS del chip de estado
    const getEstadoChipClass = (estado) => {
        return `estado-viaje-chip estado-${estado}`;
    };

    return (
        <div className="listar-viajes-omnibus-container">
            <h2>Listado de Viajes por Ómnibus</h2>

            {error && <p className="error-message">{error}</p>}

            {/* Selector de Ómnibus */}
            <div className="omnibus-selector-container">
                <label htmlFor="omnibus-select">Seleccione un Ómnibus:</label>
                <select
                    id="omnibus-select"
                    value={selectedOmnibusId}
                    onChange={(e) => {
                        setSelectedOmnibusId(e.target.value);
                        setViajes([]); // Limpiar lista de viajes al cambiar de ómnibus
                        setError(null); // Limpiar errores
                    }}
                    disabled={loadingOmnibus}
                >
                    <option value="">-- {loadingOmnibus ? "Cargando ómnibus..." : "Seleccionar Ómnibus"} --</option>
                    {omnibusLista.map(omnibus => (
                        <option key={omnibus.id} value={omnibus.id}>
                            {omnibus.matricula} - {omnibus.marca} {omnibus.modelo} (ID: {omnibus.id})
                        </option>
                    ))}
                </select>
            </div>

            {/* Filtros y Ordenamiento */}
            {selectedOmnibusId && (
                <div className="filtros-container">
                    <div className="filtro-item">
                        <label htmlFor="fechaDesde">Fecha Desde:</label>
                        <input type="date" id="fechaDesde" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} />
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="fechaHasta">Fecha Hasta:</label>
                        <input type="date" id="fechaHasta" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} />
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="estadoViaje">Estado del Viaje:</label>
                        <select id="estadoViaje" name="estadoViaje" value={filtros.estadoViaje} onChange={handleFiltroChange}>
                            {ESTADOS_VIAJE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="ordenarPor">Ordenar Por:</label>
                        <select id="ordenarPor" name="ordenarPor" value={filtros.ordenarPor} onChange={handleFiltroChange}>
                            {ORDENAR_POR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="direccionOrden">Dirección:</label>
                        <select id="direccionOrden" name="direccionOrden" value={filtros.direccionOrden} onChange={handleFiltroChange}>
                            {DIRECCION_ORDEN_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleBuscarViajes}
                        disabled={loadingViajes || !selectedOmnibusId}
                        className="buscar-btn"
                    >
                        {loadingViajes ? 'Buscando...' : 'Buscar Viajes'}
                    </button>
                </div>
            )}

            {/* Listado de Viajes */}
            {loadingViajes && <p className="loading-message">Cargando viajes...</p>}
            {!loadingViajes && selectedOmnibusId && viajes.length === 0 && !error && <p className="no-results-message">No se encontraron viajes para este ómnibus con los filtros aplicados.</p>}
            {!loadingViajes && viajes.length > 0 && (
                <div className="viajes-listado">
                    <h3>Viajes Asignados al Ómnibus (Matrícula: {omnibusLista.find(o => o.id === parseInt(selectedOmnibusId))?.matricula})</h3>
                    <table className="viajes-tabla">
                        <thead>
                        <tr>
                            <th>ID Viaje</th>
                            <th>Fecha</th>
                            <th>Salida</th>
                            <th>Llegada</th>
                            <th>Origen</th>
                            <th>Destino</th>
                            <th>Estado</th>
                            <th>Asientos Disp.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {viajes.map(viaje => (
                            <tr key={viaje.id}>
                                <td>{viaje.id}</td>
                                <td>{viaje.fecha}</td>
                                <td>{viaje.horaSalida}</td>
                                <td>{viaje.horaLlegada}</td>
                                <td>{viaje.origenNombre}</td>
                                <td>{viaje.destinoNombre}</td>
                                <td>
                                    <span className={getEstadoChipClass(viaje.estado)}>
                                        {viaje.estado.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>{viaje.asientosDisponibles}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VendedorListarViajes;