import React, { useState, useEffect, useCallback } from 'react';
import { buscarViajesConDisponibilidad, obtenerTodasLasLocalidades } from '../services/apiService'; // Ajusta la ruta si es necesario
import './ListadoViajes.css'; // Crearemos este archivo CSS

const ListadoViajes = () => {
    const [viajes, setViajes] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState({
        origenId: '',
        destinoId: '',
        fechaDesde: '',
        // fechaHasta: '', // Puedes añadir fechaHasta si lo deseas
        minAsientosDisponibles: '', // Para que el usuario pueda ingresar un número
        // estado: '', // Puedes añadir filtro por estado si lo necesitas
        sortBy: 'fechaSalida',
        sortDir: 'asc',
    });

    // Cargar localidades para los select
    useEffect(() => {
        const cargarLocalidades = async () => {
            try {
                const response = await obtenerTodasLasLocalidades();
                setLocalidades(response.data || []);
            } catch (err) {
                console.error("Error al cargar localidades:", err);
                // Manejar error de carga de localidades si es necesario
            }
        };
        cargarLocalidades();
    }, []);

    // Función para buscar viajes, envuelta en useCallback para optimización
    const fetchViajes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const criteriosActivos = {};
            for (const key in filtros) {
                if (filtros[key] !== null && filtros[key] !== '') {
                    if (key === 'minAsientosDisponibles' && filtros[key] < 0) continue; // Ignorar si es negativo
                    criteriosActivos[key] = filtros[key];
                }
            }
            const response = await buscarViajesConDisponibilidad(criteriosActivos);
            setViajes(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Error al cargar viajes");
            setViajes([]);
        } finally {
            setLoading(false);
        }
    }, [filtros]); // Dependencia: se re-crea si 'filtros' cambia

    // Cargar viajes inicialmente y cuando los filtros cambian
    useEffect(() => {
        fetchViajes();
    }, [fetchViajes]); // Dependencia: fetchViajes (que a su vez depende de filtros)

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prevFiltros => ({
            ...prevFiltros,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchViajes(); // Llama a fetchViajes manualmente al enviar el formulario
    };

    const handleSortChange = (newSortBy) => {
        setFiltros(prevFiltros => {
            const newSortDir = prevFiltros.sortBy === newSortBy && prevFiltros.sortDir === 'asc' ? 'desc' : 'asc';
            return {
                ...prevFiltros,
                sortBy: newSortBy,
                sortDir: newSortDir,
            };
        });
    };

    const getSortIndicator = (columnName) => {
        if (filtros.sortBy === columnName) {
            return filtros.sortDir === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };


    return (
        <div className="listado-viajes-container">
            <h2>Buscar Viajes Disponibles</h2>

            <form onSubmit={handleSubmit} className="filtros-form">
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
                            <td>${viaje.precio ? viaje.precio.toFixed(2) : 'N/A'}</td>
                            <td>{viaje.estado}</td>
                            <td>
                                <button className="btn-comprar" onClick={() => alert(`Comprar pasaje para viaje ID: ${viaje.id}`)}>
                                    Comprar
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

export default ListadoViajes;