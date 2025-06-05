// src/pages/cliente/ClienteListarPasajes.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../AuthContext';
import { obtenerHistorialPasajesCliente, obtenerTodasLasLocalidades } from '../../services/api'; // Asegúrate de exportar obtenerTodasLasLocalidades
import './ClienteListarPasajes.css';
import { Link } from 'react-router-dom';

const ClienteListarPasajes = () => {
    const { user } = useAuth();
    const [todosLosPasajes, setTodosLosPasajes] = useState([]); // Guarda todos los pasajes originales
    const [localidades, setLocalidades] = useState([]); // Para filtros de origen/destino
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filtros, setFiltros] = useState({
        origenNombre: '', // Filtro por texto
        destinoNombre: '', // Filtro por texto
        fechaDesde: '',
        fechaHasta: '',
        estadoPasaje: '', // VENDIDO, CANCELADO, etc.
        sortBy: 'fechaViaje', // Campo por defecto para ordenar
        sortDir: 'desc',      // Dirección por defecto
    });

    // Cargar localidades para los dropdowns (opcional, pero mejora UX)
    useEffect(() => {
        const cargarLocalidadesYPasajes = async () => {
            setLoading(true);
            setError('');
            try {
                // Cargar localidades
                try {
                    const locResponse = await obtenerTodasLasLocalidades();
                    setLocalidades(locResponse.data || []);
                } catch (locErr) {
                    console.warn("Advertencia: No se pudieron cargar las localidades para los filtros.", locErr);
                    // Continuar sin localidades si falla, los filtros de texto seguirán funcionando
                }

                // Cargar pasajes
                if (user && user.id) {
                    const pasajesResponse = await obtenerHistorialPasajesCliente(user.id);
                    setTodosLosPasajes(pasajesResponse.data || []);
                } else {
                    setError("No se pudo identificar al usuario para cargar el historial.");
                    setTodosLosPasajes([]);
                }
            } catch (err) {
                console.error("Error al obtener historial de pasajes:", err);
                setError(err.response?.data?.message || "No se pudo cargar el historial de pasajes.");
                setTodosLosPasajes([]);
            } finally {
                setLoading(false);
            }
        };
        cargarLocalidadesYPasajes();
    }, [user]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prevFiltros => ({ ...prevFiltros, [name]: value }));
    };

    const pasajesFiltradosYOrdenados = useMemo(() => {
        let pasajesProcesados = [...todosLosPasajes];

        // Aplicar filtros
        pasajesProcesados = pasajesProcesados.filter(pasaje => {
            const origenMatch = filtros.origenNombre ? pasaje.origenViaje?.toLowerCase().includes(filtros.origenNombre.toLowerCase()) : true;
            const destinoMatch = filtros.destinoNombre ? pasaje.destinoViaje?.toLowerCase().includes(filtros.destinoNombre.toLowerCase()) : true;
            const estadoMatch = filtros.estadoPasaje ? pasaje.estado === filtros.estadoPasaje : true;

            let fechaMatch = true;
            if (pasaje.fechaViaje) { // Asegurarse que hay fecha de viaje
                const fechaPasaje = new Date(pasaje.fechaViaje);
                fechaPasaje.setHours(0,0,0,0); // Normalizar para comparar solo fechas

                if (filtros.fechaDesde) {
                    const fechaDesdeFiltro = new Date(filtros.fechaDesde);
                    fechaDesdeFiltro.setHours(0,0,0,0);
                    if (fechaPasaje < fechaDesdeFiltro) fechaMatch = false;
                }
                if (filtros.fechaHasta && fechaMatch) {
                    const fechaHastaFiltro = new Date(filtros.fechaHasta);
                    fechaHastaFiltro.setHours(0,0,0,0);
                    if (fechaPasaje > fechaHastaFiltro) fechaMatch = false;
                }
            } else if (filtros.fechaDesde || filtros.fechaHasta) { // Si hay filtro de fecha pero el pasaje no tiene fecha
                fechaMatch = false;
            }


            return origenMatch && destinoMatch && estadoMatch && fechaMatch;
        });

        // Aplicar ordenación
        if (filtros.sortBy) {
            pasajesProcesados.sort((a, b) => {
                let valA = a[filtros.sortBy];
                let valB = b[filtros.sortBy];

                // Manejo especial para fechas
                if (filtros.sortBy === 'fechaViaje') {
                    valA = a.fechaViaje ? new Date(a.fechaViaje) : null;
                    valB = b.fechaViaje ? new Date(b.fechaViaje) : null;
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return filtros.sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return filtros.sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return pasajesProcesados;
    }, [todosLosPasajes, filtros]);

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

    // Obtener estados únicos de los pasajes para el dropdown de filtro
    const estadosUnicos = useMemo(() => {
        const estados = new Set(todosLosPasajes.map(p => p.estado).filter(Boolean));
        return Array.from(estados);
    }, [todosLosPasajes]);


    if (loading && todosLosPasajes.length === 0) { // Mostrar spinner solo si no hay datos previos
        return <div className="loading-container"><div className="loading-spinner"></div><p>Cargando historial de pasajes...</p></div>;
    }

    return (
        <div className="listar-pasajes-container">
            <h1 className="page-title">Mis Pasajes Comprados</h1>

            <form className="filtros-form-pasajes">
                <div className="filtro-grupo-pasajes">
                    <label htmlFor="origenNombre">Origen:</label>
                    <input type="text" name="origenNombre" id="origenNombre" value={filtros.origenNombre} onChange={handleFiltroChange} placeholder="Ej: Montevideo" />
                </div>
                <div className="filtro-grupo-pasajes">
                    <label htmlFor="destinoNombre">Destino:</label>
                    <input type="text" name="destinoNombre" id="destinoNombre" value={filtros.destinoNombre} onChange={handleFiltroChange} placeholder="Ej: Colonia" />
                </div>
                <div className="filtro-grupo-pasajes">
                    <label htmlFor="fechaDesde">Fecha Desde:</label>
                    <input type="date" name="fechaDesde" id="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} />
                </div>
                <div className="filtro-grupo-pasajes">
                    <label htmlFor="fechaHasta">Fecha Hasta:</label>
                    <input type="date" name="fechaHasta" id="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} />
                </div>
                <div className="filtro-grupo-pasajes">
                    <label htmlFor="estadoPasaje">Estado:</label>
                    <select name="estadoPasaje" id="estadoPasaje" value={filtros.estadoPasaje} onChange={handleFiltroChange}>
                        <option value="">Todos</option>
                        {estadosUnicos.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                    </select>
                </div>
                {/* No necesitamos botón de submit, los filtros se aplican al cambiar gracias a useMemo */}
            </form>

            {error && <div className="error-message">{error}</div>}

            {!loading && !error && pasajesFiltradosYOrdenados.length === 0 && todosLosPasajes.length > 0 && (
                <div className="no-pasajes-message">
                    <p>No se encontraron pasajes con los filtros aplicados.</p>
                </div>
            )}
            {!loading && !error && pasajesFiltradosYOrdenados.length === 0 && todosLosPasajes.length === 0 && (
                <div className="no-pasajes-message">
                    <p>Aún no has comprado ningún pasaje.</p>
                    <Link to="/viajes" className="cta-button">Buscar Viajes</Link>
                </div>
            )}

            {pasajesFiltradosYOrdenados.length > 0 && (
                <div className="pasajes-grid"> {/* O usa una tabla si prefieres */}
                    {/* Encabezados para ordenar (si usas grid, esto es más conceptual) */}
                    {/* Para una tabla, serían los <th> */}
                    {/* <div className="pasaje-card-header-sortable" onClick={() => handleSortChange('destinoViaje')}>
                        Destino {getSortIndicator('destinoViaje')}
                    </div> */}

                    {pasajesFiltradosYOrdenados.map((pasaje) => (
                        <div key={pasaje.id} className="pasaje-card">
                            <div className="pasaje-card-header">
                                <h3 onClick={() => handleSortChange('destinoViaje')} style={{cursor: 'pointer'}}>
                                    Viaje a {pasaje.destinoViaje || 'Destino Desconocido'}
                                    {filtros.sortBy === 'destinoViaje' ? getSortIndicator('destinoViaje') : ''}
                                </h3>
                                <span className={`pasaje-estado pasaje-estado-${pasaje.estado?.toLowerCase()}`}>
                                    {pasaje.estado || 'ESTADO DESCONOCIDO'}
                                </span>
                            </div>
                            <div className="pasaje-card-body">
                                <p><strong>ID Pasaje:</strong> {pasaje.id}</p>
                                <p onClick={() => handleSortChange('origenViaje')} style={{cursor: 'pointer'}}>
                                    <strong>Origen:</strong> {pasaje.origenViaje || 'N/A'}
                                    {filtros.sortBy === 'origenViaje' ? getSortIndicator('origenViaje') : ''}
                                </p>
                                <p><strong>Destino:</strong> {pasaje.destinoViaje || 'N/A'}</p>
                                <p onClick={() => handleSortChange('fechaViaje')} style={{cursor: 'pointer'}}>
                                    <strong>Fecha:</strong> {pasaje.fechaViaje ? new Date(pasaje.fechaViaje).toLocaleDateString() : 'N/A'}
                                    {filtros.sortBy === 'fechaViaje' ? getSortIndicator('fechaViaje') : ''}
                                </p>
                                <p><strong>Hora Salida:</strong> {pasaje.horaSalidaViaje || 'N/A'}</p>
                                <p><strong>Asiento N°:</strong> {pasaje.numeroAsiento || 'N/A'}</p>
                                <p onClick={() => handleSortChange('precio')} style={{cursor: 'pointer'}}>
                                    <strong>Precio:</strong> ${pasaje.precio ? pasaje.precio.toFixed(2) : 'N/A'}
                                    {filtros.sortBy === 'precio' ? getSortIndicator('precio') : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="actions-container bottom-actions">
                <Link to="/" className="back-button">Volver al Inicio</Link>
            </div>
        </div>
    );
};

export default ClienteListarPasajes;