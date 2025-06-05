// src/pages/vendedor/VendedorListadoPasajesViaje.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para el botón de volver al dashboard
import {
    obtenerViajesPorEstado, // O una función para obtener todos los viajes
    obtenerPasajesDeViajeParaVendedor
} from '../../services/api'; // Asegúrate que las rutas y nombres sean correctos
import './VendedorListadoPasajesViaje.css'; // Asegúrate de tener este archivo CSS y sus estilos

const VendedorListadoPasajesViaje = () => {
    const [todosLosViajes, setTodosLosViajes] = useState([]);
    const [selectedViajeId, setSelectedViajeId] = useState('');
    const [nombreViajeSeleccionadoInfo, setNombreViajeSeleccionadoInfo] = useState(''); // Para el título

    const [pasajesDelViaje, setPasajesDelViaje] = useState([]);
    const [loadingViajes, setLoadingViajes] = useState(true);
    const [loadingPasajes, setLoadingPasajes] = useState(false);
    const [error, setError] = useState(null); // Un solo estado de error para simplificar

    const [filtrosPasajes, setFiltrosPasajes] = useState({
        clienteNombre: '',
        numeroAsiento: '',
        sortBy: 'numeroAsiento', // Campo por defecto para ordenar pasajes
        sortDir: 'asc'      // Dirección por defecto
    });

    // Cargar la lista de viajes al montar el componente
    useEffect(() => {
        const fetchViajes = async () => {
            setLoadingViajes(true);
            setError(null);
            try {
                const response = await obtenerViajesPorEstado('PROGRAMADO'); // O 'TODOS', o la función que prefieras
                setTodosLosViajes(response.data || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al cargar la lista de viajes.');
                setTodosLosViajes([]);
            } finally {
                setLoadingViajes(false);
            }
        };
        fetchViajes();
    }, []);

    // Cargar pasajes cuando se selecciona un viaje o cambian los filtros/orden de pasajes
    useEffect(() => {
        if (!selectedViajeId) {
            setPasajesDelViaje([]);
            return;
        }

        const fetchPasajes = async () => {
            setLoadingPasajes(true);
            setError(null); // Limpiar error de carga de pasajes
            try {
                const params = {};
                if (filtrosPasajes.clienteNombre) params.clienteNombre = filtrosPasajes.clienteNombre;
                if (filtrosPasajes.numeroAsiento) params.numeroAsiento = filtrosPasajes.numeroAsiento;
                if (filtrosPasajes.sortBy) params.sortBy = filtrosPasajes.sortBy;
                if (filtrosPasajes.sortDir) params.sortDir = filtrosPasajes.sortDir;

                const response = await obtenerPasajesDeViajeParaVendedor(selectedViajeId, params);
                setPasajesDelViaje(response.data || []);
            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar los pasajes del viaje seleccionado.");
                setPasajesDelViaje([]);
            } finally {
                setLoadingPasajes(false);
            }
        };

        fetchPasajes();
    }, [selectedViajeId, filtrosPasajes]);

    const handleViajeChange = (e) => {
        const viajeId = e.target.value;
        setSelectedViajeId(viajeId);
        if (viajeId) {
            const viajeSeleccionado = todosLosViajes.find(v => v.id.toString() === viajeId);
            setNombreViajeSeleccionadoInfo(
                viajeSeleccionado ?
                    `ID: ${viajeSeleccionado.id} (${viajeSeleccionado.origenNombre || viajeSeleccionado.origen?.nombre} a ${viajeSeleccionado.destinoNombre || viajeSeleccionado.destino?.nombre} - ${new Date(viajeSeleccionado.fecha || viajeSeleccionado.fechaSalida).toLocaleDateString()})`
                    : `Viaje ID: ${viajeId}`
            );
        } else {
            setNombreViajeSeleccionadoInfo('');
            setPasajesDelViaje([]); // Limpiar pasajes si se deselecciona el viaje
        }
    };

    const handleFiltroPasajeChange = (e) => {
        const { name, value } = e.target;
        setFiltrosPasajes(prev => ({ ...prev, [name]: value }));
    };

    const handleSortPasajeChange = (newSortBy) => {
        setFiltrosPasajes(prevFiltros => {
            const newSortDir = prevFiltros.sortBy === newSortBy && prevFiltros.sortDir === 'asc' ? 'desc' : 'asc';
            return { ...prevFiltros, sortBy: newSortBy, sortDir: newSortDir };
        });
    };

    const getSortPasajeIndicator = (columnName) => {
        if (filtrosPasajes.sortBy === columnName) {
            return filtrosPasajes.sortDir === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <div className="vendedor-listado-pasajes-container"> {/* Clase principal del contenedor */}
            <h1>Consulta de Pasajes Vendidos por Viaje</h1>

            {/* Sección para Seleccionar el Viaje */}
            <section className="seccion-seleccion-viaje">
                <h2>1. Seleccione un Viaje</h2>
                {loadingViajes && <p className="loading-mensaje">Cargando lista de viajes...</p>}
                {error && !loadingViajes && <p className="error-mensaje">Error al cargar viajes: {error}</p>}

                {!loadingViajes && todosLosViajes.length === 0 && !error && (
                    <p className="info-mensaje">No hay viajes disponibles para seleccionar.</p>
                )}

                {!loadingViajes && todosLosViajes.length > 0 && (
                    <div className="selector-viaje-wrapper">
                        <label htmlFor="viajeSelect">Viaje:</label>
                        <select
                            id="viajeSelect"
                            value={selectedViajeId}
                            onChange={handleViajeChange}
                        >
                            <option value="">-- Elija un viaje de la lista --</option>
                            {todosLosViajes.map(viaje => (
                                <option key={viaje.id} value={viaje.id}>
                                    ID: {viaje.id} | {viaje.origenNombre || viaje.origen?.nombre} → {viaje.destinoNombre || viaje.destino?.nombre} | {new Date(viaje.fecha || viaje.fechaSalida).toLocaleDateString()} {viaje.horaSalida || ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </section>

            {/* Sección para Mostrar los Pasajes del Viaje Seleccionado */}
            {selectedViajeId && (
                <section className="seccion-listado-pasajes">
                    <h2>2. Pasajes para el Viaje: {nombreViajeSeleccionadoInfo}</h2>

                    <form className="filtros-form-inline" onSubmit={(e) => e.preventDefault()}>
                        <div className="filtro-item">
                            <label htmlFor="clienteNombrePasaje">Nombre Cliente:</label>
                            <input
                                type="text"
                                id="clienteNombrePasaje" /* ID único para el input */
                                name="clienteNombre"
                                value={filtrosPasajes.clienteNombre}
                                onChange={handleFiltroPasajeChange}
                                placeholder="Filtrar por nombre"
                            />
                        </div>
                        <div className="filtro-item">
                            <label htmlFor="numeroAsientoPasaje">N° Asiento:</label>
                            <input
                                type="number"
                                id="numeroAsientoPasaje" /* ID único para el input */
                                name="numeroAsiento"
                                value={filtrosPasajes.numeroAsiento}
                                onChange={handleFiltroPasajeChange}
                                placeholder="Filtrar asiento"
                            />
                        </div>
                    </form>

                    {loadingPasajes && <p className="loading-mensaje">Cargando pasajes del viaje...</p>}
                    {error && !loadingPasajes && <p className="error-mensaje">Error al cargar pasajes: {error}</p>}

                    {!loadingPasajes && pasajesDelViaje.length === 0 && !error && (
                        <p className="info-mensaje">No hay pasajes vendidos para este viaje o que coincidan con los filtros.</p>
                    )}

                    {!loadingPasajes && pasajesDelViaje.length > 0 && (
                        <table className="tabla-pasajes-vendedor">
                            <thead>
                            <tr>
                                <th onClick={() => handleSortPasajeChange('clienteNombre')} style={{ cursor: 'pointer' }}>
                                    Cliente {getSortPasajeIndicator('clienteNombre')}
                                </th>
                                <th onClick={() => handleSortPasajeChange('numeroAsiento')} style={{ cursor: 'pointer' }}>
                                    Asiento N° {getSortPasajeIndicator('numeroAsiento')}
                                </th>
                                <th onClick={() => handleSortPasajeChange('precio')} style={{ cursor: 'pointer' }}>
                                    Precio {getSortPasajeIndicator('precio')}
                                </th>
                                <th onClick={() => handleSortPasajeChange('estado')} style={{ cursor: 'pointer' }}>
                                    Estado {getSortPasajeIndicator('estado')}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {pasajesDelViaje.map(pasaje => (
                                <tr key={pasaje.id}>
                                    <td>{pasaje.clienteNombre || 'N/A'}</td>
                                    <td>{pasaje.numeroAsiento}</td>
                                    <td>${pasaje.precio ? pasaje.precio.toFixed(2) : 'N/A'}</td>
                                    <td>{pasaje.estado}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}
            <div style={{marginTop: '30px', textAlign: 'center'}}>
                <Link to="/vendedor/dashboard" className="btn-volver-dashboard">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default VendedorListadoPasajesViaje;