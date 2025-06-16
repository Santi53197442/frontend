// src/pages/vendedor/VendedorListadoViajesCompra.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { buscarViajesConDisponibilidad, obtenerTodasLasLocalidades } from '../../services/api';
import './ListadoViajes.css';
import { useAuth } from '../../AuthContext';

const VendedorListadoViajesCompra = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [viajes, setViajes] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [loading, setLoading] = useState(true); // Empieza en true para la carga inicial
    const [error, setError] = useState(null);

    // Inicializamos los filtros desde la URL si existen
    const [filtros, setFiltros] = useState({
        origenId: searchParams.get('origenId') || '',
        destinoId: searchParams.get('destinoId') || '',
        fechaDesde: searchParams.get('fecha') || '', // 'fecha' viene de Home.js
        minAsientosDisponibles: '1',
        sortBy: 'fechaSalida',
        sortDir: 'asc',
    });

    // Cargar localidades una sola vez
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

    // Función para buscar viajes, memoizada con useCallback
    const fetchViajes = useCallback(async (currentFilters) => {
        setLoading(true);
        setError(null);
        try {
            const criteriosActivos = Object.fromEntries(
                Object.entries(currentFilters).filter(([, value]) => value !== '' && value !== null)
            );
            const response = await buscarViajesConDisponibilidad(criteriosActivos);
            setViajes(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar viajes");
            setViajes([]);
        } finally {
            setLoading(false);
        }
    }, []); // No depende de nada, recibe los filtros como argumento

    // Dispara la búsqueda cuando los filtros cambian
    useEffect(() => {
        fetchViajes(filtros);
    }, [filtros, fetchViajes]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prevFiltros => ({ ...prevFiltros, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchViajes(filtros); // Forzar búsqueda con los filtros actuales
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
        if (!viajeSeleccionado?.id) {
            alert("Se produjo un error al seleccionar el viaje.");
            return;
        }
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const esCliente = user?.rol?.toLowerCase() === 'cliente';
        const targetPathBase = esCliente ? '/compra' : '/vendedor';
        const targetPath = `${targetPathBase}/viaje/${viajeSeleccionado.id}/seleccionar-asientos`;
        navigate(targetPath, { state: { viajeData: viajeSeleccionado } });
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
                    <label htmlFor="fechaDesde">Fecha:</label>
                    <input type="date" name="fechaDesde" id="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} />
                </div>
                <div className="filtro-grupo">
                    <label htmlFor="minAsientosDisponibles">Mín. Asientos:</label>
                    <input type="number" name="minAsientosDisponibles" id="minAsientosDisponibles" min="1" value={filtros.minAsientosDisponibles} onChange={handleFiltroChange} />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Buscando...' : 'Aplicar Filtros'}
                </button>
            </form>

            {error && <p className="error-mensaje">Error: {error}</p>}
            {loading && !error && <div className="loading-mensaje">Cargando viajes...</div>}
            {!loading && !error && viajes.length === 0 && (
                <div className="no-viajes-mensaje">No se encontraron viajes con los criterios seleccionados.</div>
            )}

            {!loading && !error && viajes.length > 0 && (
                <table className="tabla-viajes">
                    <thead>
                    <tr>
                        <th onClick={() => handleSortChange('origenNombre')}>Origen {getSortIndicator('origenNombre')}</th>
                        <th onClick={() => handleSortChange('destinoNombre')}>Destino {getSortIndicator('destinoNombre')}</th>
                        <th onClick={() => handleSortChange('fechaSalida')}>Fecha y Hora Salida {getSortIndicator('fechaSalida')}</th>
                        <th>Ómnibus</th>
                        <th onClick={() => handleSortChange('asientosDisponibles')}>Asientos Disp. {getSortIndicator('asientosDisponibles')}</th>
                        <th onClick={() => handleSortChange('precio')}>Precio {getSortIndicator('precio')}</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {viajes.map(viaje => (
                        <tr key={viaje.id}>
                            <td>{viaje.origenNombre}</td>
                            <td>{viaje.destinoNombre}</td>
                            <td>{new Date(viaje.fechaSalida).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td>{viaje.omnibusMatricula}</td>
                            <td className="asientos-disponibles">{viaje.asientosDisponibles}</td>
                            <td>${viaje.precio ? parseFloat(viaje.precio).toFixed(2) : 'N/A'}</td>
                            <td>
                                <button
                                    className="btn-comprar"
                                    onClick={() => handleSeleccionarAsientos(viaje)}
                                    disabled={viaje.asientosDisponibles === 0}
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