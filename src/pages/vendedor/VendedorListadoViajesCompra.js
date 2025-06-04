// src/pages/vendedor/VendedorListadoViajesCompra.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buscarViajesConDisponibilidad, obtenerTodasLasLocalidades } from '../../services/api';
import './ClienteSeleccionAsientosPage.css';
import { useAuth } from '../../AuthContext';

const VendedorListadoViajesCompra = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

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
                    if (key === 'minAsientosDisponibles' && Number(filtros[key]) < 0) continue;
                    criteriosActivos[key] = filtros[key];
                }
            }
            const response = await buscarViajesConDisponibilidad(criteriosActivos);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const data = Array.isArray(response.data) ? response.data : [];
            const viajesFiltrados = data.filter(viaje => {
                const fechaViaje = new Date(viaje.fechaSalida);
                return fechaViaje >= hoy;
            });
            setViajes(viajesFiltrados);
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
        setFiltros(prevFiltros => ({ ...prevFiltros, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchViajes();
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
        let targetPathBase = '/vendedor'; // Por defecto para el vendedor

        // Logs para depuración
        console.log("--- VendedorListadoViajesCompra: handleSeleccionarAsientos DEBUG ---");
        console.log("Usuario actual:", user);
        console.log("Rol del usuario:", user?.rol);
        console.log("Ruta actual (location.pathname):", location.pathname);
        console.log("Viaje seleccionado (objeto completo):", viajeSeleccionado);

        const esCliente = user && user.rol && user.rol.toLowerCase() === 'cliente';
        const estaEnRutaDeViajesPublica = location.pathname === '/viajes';

        console.log("Condición (esCliente):", esCliente);
        console.log("Condición (estaEnRutaDeViajesPublica):", estaEnRutaDeViajesPublica);

        if (esCliente && estaEnRutaDeViajesPublica) {
            targetPathBase = '/compra';
        }
        console.log("BasePath decidido para la navegación:", targetPathBase);

        if (!viajeSeleccionado || typeof viajeSeleccionado.id === 'undefined' || viajeSeleccionado.id === null) {
            console.error("Error crítico: El ID del viaje seleccionado es nulo o indefinido. No se puede navegar.");
            alert("Se produjo un error al seleccionar el viaje. Falta información del viaje.");
            return;
        }

        const targetPath = `${targetPathBase}/viaje/${viajeSeleccionado.id}/seleccionar-asientos`;
        console.log("Intentando navegar a la ruta final:", targetPath);

        navigate(targetPath, {
            state: { viajeData: viajeSeleccionado }
        });
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
                <p className="no-viajes-mensaje">No se encontraron viajes con los criterios seleccionados o todos los viajes disponibles ya han pasado.</p>
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