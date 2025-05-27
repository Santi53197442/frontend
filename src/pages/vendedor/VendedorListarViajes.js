// src/components/Vendedor/VendedorListarViajes.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    obtenerTodosLosOmnibus, // Para el selector de ómnibus
    buscarViajesDeOmnibus   // La nueva función que creamos
} from '../../services/apiService'; // Ajusta la ruta a tu apiService

// Opciones para los selectores (podrías obtenerlas de una constante o API si cambian mucho)
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
    // Agrega más campos si son relevantes y soportados por el backend
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
        estadoViaje: '', // Valor del enum EstadoViaje o string vacío
        ordenarPor: 'fecha', // Campo por defecto para ordenar
        direccionOrden: 'ASC', // Dirección por defecto
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
            setViajes([]); // Limpiar viajes si no hay ómnibus seleccionado
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
            if (filtros.ordenarPor) params.ordenarPor = filtros.ordenarPor;
            if (filtros.direccionOrden) params.direccionOrden = filtros.direccionOrden;

            const response = await buscarViajesDeOmnibus(selectedOmnibusId, params);
            setViajes(response.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al buscar los viajes del ómnibus.';
            setError(errorMessage);
            setViajes([]);
            console.error(err);
        } finally {
            setLoadingViajes(false);
        }
    }, [selectedOmnibusId, filtros]);

    // Cargar viajes cuando se selecciona un ómnibus por primera vez o cambian filtros y se presiona buscar
    // Para este ejemplo, la carga se activa con el botón "Buscar Viajes"
    // Si quisieras que se cargue al cambiar de ómnibus, podrías añadir un useEffect:
    // useEffect(() => {
    //     if (selectedOmnibusId) {
    //         handleBuscarViajes();
    //     } else {
    //         setViajes([]); // Limpiar viajes si se deselecciona el ómnibus
    //     }
    // }, [selectedOmnibusId, handleBuscarViajes]); // handleBuscarViajes debe estar en useCallback

    return (
        <div className="listar-viajes-omnibus-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Listado de Viajes por Ómnibus</h2>

            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Error: {error}</p>}

            {/* Selector de Ómnibus */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="omnibus-select" style={{ display: 'block', marginBottom: '5px' }}>Seleccione un Ómnibus:</label>
                <select
                    id="omnibus-select"
                    value={selectedOmnibusId}
                    onChange={(e) => {
                        setSelectedOmnibusId(e.target.value);
                        setViajes([]); // Limpiar lista de viajes al cambiar de ómnibus
                        setError(null); // Limpiar errores
                    }}
                    disabled={loadingOmnibus}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
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
                <div className="filtros-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
                    <div>
                        <label htmlFor="fechaDesde">Fecha Desde:</label>
                        <input type="date" id="fechaDesde" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} style={{ padding: '8px' }} />
                    </div>
                    <div>
                        <label htmlFor="fechaHasta">Fecha Hasta:</label>
                        <input type="date" id="fechaHasta" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} style={{ padding: '8px' }} />
                    </div>
                    <div>
                        <label htmlFor="estadoViaje">Estado del Viaje:</label>
                        <select id="estadoViaje" name="estadoViaje" value={filtros.estadoViaje} onChange={handleFiltroChange} style={{ padding: '8px' }}>
                            {ESTADOS_VIAJE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ordenarPor">Ordenar Por:</label>
                        <select id="ordenarPor" name="ordenarPor" value={filtros.ordenarPor} onChange={handleFiltroChange} style={{ padding: '8px' }}>
                            {ORDENAR_POR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="direccionOrden">Dirección:</label>
                        <select id="direccionOrden" name="direccionOrden" value={filtros.direccionOrden} onChange={handleFiltroChange} style={{ padding: '8px' }}>
                            {DIRECCION_ORDEN_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleBuscarViajes}
                        disabled={loadingViajes || !selectedOmnibusId}
                        style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}
                    >
                        {loadingViajes ? 'Buscando...' : 'Buscar Viajes'}
                    </button>
                </div>
            )}

            {/* Listado de Viajes */}
            {loadingViajes && <p>Cargando viajes...</p>}
            {!loadingViajes && selectedOmnibusId && viajes.length === 0 && !error && <p>No se encontraron viajes para este ómnibus con los filtros aplicados.</p>}
            {!loadingViajes && viajes.length > 0 && (
                <div className="viajes-listado">
                    <h3>Viajes Asignados al Ómnibus (Matrícula: {omnibusLista.find(o => o.id === parseInt(selectedOmnibusId))?.matricula})</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID Viaje</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Salida</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Llegada</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Origen</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Destino</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Estado</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Asientos Disp.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {viajes.map(viaje => (
                            <tr key={viaje.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.id}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.fecha}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.horaSalida}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.horaLlegada}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.origenNombre}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.destinoNombre}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.estado}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{viaje.asientosDisponibles}</td>
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