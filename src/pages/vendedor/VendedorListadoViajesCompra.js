// src/pages/vendedor/VendedorListadoViajesCompra.js

// --- ¡CAMBIO IMPORTANTE! ---
// Usaremos useSearchParams para leer la URL de forma más sencilla.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { buscarViajesConDisponibilidad, obtenerTodasLasLocalidades } from '../../services/api'; // Asegúrate que el nombre del archivo de API sea correcto
import './ListadoViajes.css';
import { useAuth } from '../../AuthContext';

const VendedorListadoViajesCompra = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // --- ¡CAMBIO IMPORTANTE! ---
    // Hook para leer los parámetros de la URL.
    const [searchParams] = useSearchParams();

    const [viajes, setViajes] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState({
        origenId: '',
        destinoId: '',
        fechaDesde: '',
        minAsientosDisponibles: '1', // Por defecto, buscar viajes con al menos 1 asiento
        sortBy: 'fechaSalida',
        sortDir: 'asc',
    });

    // Cargar localidades (esto no cambia)
    useEffect(() => {
        const cargarLocalidades = async () => {
            try {
                const response = await obtenerTodasLasLocalidades();
                setLocalidades(response.data || []);
            } catch (err) {
                console.error("Error al cargar localidades:", err);
            }
        };
        cargarLocalidades();
    }, []);

    // --- ¡NUEVO Y CLAVE! ---
    // Este useEffect se ejecuta solo una vez al cargar la página.
    // Su trabajo es leer los filtros de la URL y actualizar el estado interno.
    useEffect(() => {
        const origenIdFromUrl = searchParams.get('origenId');
        const destinoIdFromUrl = searchParams.get('destinoId');
        const fechaFromUrl = searchParams.get('fecha'); // Home.js envía 'fecha'

        // Si los parámetros existen en la URL, los usamos para pre-llenar los filtros.
        if (origenIdFromUrl && destinoIdFromUrl && fechaFromUrl) {
            setFiltros(prevFiltros => ({
                ...prevFiltros,
                origenId: origenIdFromUrl,
                destinoId: destinoIdFromUrl,
                fechaDesde: fechaFromUrl, // Mapeamos 'fecha' de la URL a 'fechaDesde' del filtro
            }));
        }
    }, []); // El array vacío asegura que esto se ejecute solo una vez.

    // La lógica de búsqueda se mantiene, ahora será disparada por el useEffect de abajo
    // cuando los filtros se actualicen con los datos de la URL.
    const fetchViajes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const criteriosActivos = {};
            for (const key in filtros) {
                if (filtros[key] !== null && filtros[key] !== '') {
                    if (key === 'minAsientosDisponibles' && Number(filtros[key]) < 0) continue;
                    criteriosActivos[key] = filtros[key];
                }
            }
            const response = await buscarViajesConDisponibilidad(criteriosActivos);
            // Ya no filtramos por fecha aquí, dejamos que el backend lo haga si es necesario
            setViajes(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al cargar viajes");
            setViajes([]);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    // Este useEffect ahora reaccionará al cambio inicial de filtros desde la URL
    // y también a los cambios manuales del usuario.
    useEffect(() => {
        // Solo realizamos la búsqueda si tenemos un origen, destino y fecha.
        if (filtros.origenId && filtros.destinoId && filtros.fechaDesde) {
            fetchViajes();
        } else {
            // Si la página carga sin parámetros, no mostramos nada inicialmente.
            setViajes([]);
        }
    }, [fetchViajes, filtros.origenId, filtros.destinoId, filtros.fechaDesde]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prevFiltros => ({ ...prevFiltros, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchViajes(); // Forzar búsqueda al hacer clic en el botón
    };

    const handleSortChange = (newSortBy) => {
        setFiltros(prevFiltros => {
            const newSortDir = prevFiltros.sortBy === newSortBy && prevFiltros.sortDir === 'asc' ? 'desc' : 'asc';
            return { ...prevFiltros, sortBy: newSortBy, sortDir: newSortDir };
        });
    };

    const getSortIndicator = (columnName) => {
        if (filtros.sortBy === columnName) {
            return filtros.sortDir === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    const handleSeleccionarAsientos = (viajeSeleccionado) => {
        let targetPathBase = '/vendedor';
        const esCliente = user?.rol?.toLowerCase() === 'cliente';
        const estaEnRutaDeViajesPublica = location.pathname === '/viajes';

        if (esCliente && estaEnRutaDeViajesPublica) {
            targetPathBase = '/compra';
        }

        if (!viajeSeleccionado?.id) {
            console.error("Error crítico: El ID del viaje es inválido.");
            alert("Se produjo un error al seleccionar el viaje.");
            return;
        }

        const targetPath = `${targetPathBase}/viaje/${viajeSeleccionado.id}/seleccionar-asientos`;
        navigate(targetPath, { state: { viajeData: viajeSeleccionado } });
    };

    // El resto del JSX (la parte visual) se mantiene exactamente igual.
    return (
        <div className="listado-viajes-container">
            <h2>Buscar Viajes Disponibles</h2>
            <form onSubmit={handleSubmit} className="filtros-form">
                {/* ... tu formulario de filtros no cambia ... */}
                <div className="filtro-grupo">
                    <label htmlFor="origenId">Origen:</label>
                    <select name="origenId" id="origenId" value={filtros.origenId} onChange={handleFiltroChange}>
                        <option value="">Cualquiera</option>
                        {localidades.map(loc => <option key={loc.id} value={loc.id}>{loc.nombre}</option>)}
                    </select>
                </div>
                <div className="filtro-grupo">
                    <label htmlFor="destinoId">Destino:</label>
                    <select name="destinoId" id="destinoId" value={filtros.destinoId} onChange={handleFiltroChange}>
                        <option value="">Cualquiera</option>
                        {localidades.map(loc => <option key={loc.id} value={loc.id}>{loc.nombre}</option>)}
                    </select>
                </div>
                <div className="filtro-grupo">
                    <label htmlFor="fechaDesde">Fecha Desde:</label>
                    <input type="date" name="fechaDesde" id="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} />
                </div>
                <div className="filtro-grupo">
                    <label htmlFor="minAsientosDisponibles">Mín. Asientos Disp.:</label>
                    <input type="number" name="minAsientosDisponibles" id="minAsientosDisponibles" min="0" value={filtros.minAsientosDisponibles} onChange={handleFiltroChange} placeholder="Ej: 1" />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar Viajes'}
                </button>
            </form>

            {error && <p className="error-mensaje">Error: {error}</p>}
            {loading && !error && <p className="loading-mensaje">Cargando viajes...</p>}
            {!loading && !error && viajes.length === 0 && (
                <p className="no-viajes-mensaje">No se encontraron viajes con los criterios seleccionados.</p>
            )}

            {!loading && !error && viajes.length > 0 && (
                <table className="tabla-viajes">
                    <thead>
                    <tr>
                        <th onClick={() => handleSortChange('origenNombre')}>Origen {getSortIndicator('origenNombre')}</th>
                        <th onClick={() => handleSortChange('destinoNombre')}>Destino {getSortIndicator('destinoNombre')}</th>
                        <th onClick={() => handleSortChange('fechaSalida')}>Fecha Salida {getSortIndicator('fechaSalida')}</th>
                        <th>Ómnibus</th>
                        <th onClick={() => handleSortChange('asientosDisponibles')}>Asientos Disp. {getSortIndicator('asientosDisponibles')}</th>
                        <th onClick={() => handleSortChange('precio')}>Precio {getSortIndicator('precio')}</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {viajes.map(viaje => (
                        <tr key={viaje.id}>
                            <td>{viaje.origenNombre}</td>
                            <td>{viaje.destinoNombre}</td>
                            <td>{new Date(viaje.fechaSalida).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td>{viaje.omnibusMatricula}</td>
                            <td className="asientos-disponibles">{viaje.asientosDisponibles}</td>
                            <td>${viaje.precio ? parseFloat(viaje.precio).toFixed(2) : 'N/A'}</td>
                            <td>{viaje.estado}</td>
                            <td>
                                <button
                                    className="btn-comprar"
                                    onClick={() => handleSeleccionarAsientos(viaje)}
                                >
                                    Seleccionar Asientos
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VendedorListadoViajesCompra;