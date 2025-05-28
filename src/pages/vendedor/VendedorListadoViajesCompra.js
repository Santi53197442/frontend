import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. IMPORTAR useNavigate
// Asegúrate que la ruta a tu apiService sea correcta
import { buscarViajesConDisponibilidad, obtenerTodasLasLocalidades } from '../../services/api';
import './ListadoViajes.css';

const VendedorListadoViajesCompra = () => {
    const navigate = useNavigate(); // <--- 2. INICIALIZAR useNavigate

    const [viajes, setViajes] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState({
        origenId: '',
        destinoId: '',
        fechaDesde: '',
        minAsientosDisponibles: '',
        sortBy: 'fechaSalida',
        sortDir: 'asc',
    });

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

    const fetchViajes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const criteriosActivos = {};
            for (const key in filtros) {
                if (filtros[key] !== null && filtros[key] !== '') {
                    if (key === 'minAsientosDisponibles' && filtros[key] < 0) continue;
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
    }, [filtros]);

    useEffect(() => {
        fetchViajes();
    }, [fetchViajes]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prevFiltros => ({
            ...prevFiltros,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchViajes();
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

    // <--- 3. CREAR LA FUNCIÓN HANDLER PARA EL BOTÓN "COMPRAR" ---
    const handleSeleccionarAsientos = (viajeSeleccionado) => {
        // Navega a la página de selección de asientos, pasando el objeto 'viaje'
        // (que contiene id, precio, capacidadOmnibus, etc. del ViajeConDisponibilidadDTO)
        // a través del estado de la ruta.
        // La ruta debe coincidir con la que definiste en AppRouter.js
        navigate(`/vendedor/viaje/${viajeSeleccionado.id}/seleccionar-asientos`, {
            state: { viajeData: viajeSeleccionado }
        });
    };

    return (
        <div className="listado-viajes-container">
            <h2>Buscar Viajes Disponibles</h2>

            <form onSubmit={handleSubmit} className="filtros-form">
                {/* ... tus inputs de filtro ... */}
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
                                {/* <--- 4. MODIFICAR EL onClick DEL BOTÓN --- */}
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