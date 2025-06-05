// src/pages/cliente/ClienteListarPasajes.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../AuthContext';
// Asegúrate que la ruta a apiService (o api) sea correcta
import { obtenerHistorialPasajesCliente, obtenerTodasLasLocalidades } from '../../services/api';
import './ClienteListarPasajes.css';
import { Link } from 'react-router-dom';

const ClienteListarPasajes = () => {
    const { user } = useAuth();
    const [todosLosPasajes, setTodosLosPasajes] = useState([]);
    const [localidades, setLocalidades] = useState([]); // Opcional, si decides usar dropdowns de origen/destino en el futuro
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filtros, setFiltros] = useState({
        origenNombre: '',
        destinoNombre: '',
        fechaDesde: '',
        fechaHasta: '',
        // estadoPasaje: '', // ELIMINADO
        sortBy: 'fechaViaje',
        sortDir: 'desc',
    });

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            setLoading(true);
            setError('');
            try {
                // Cargar localidades (opcional)
                try {
                    const locResponse = await obtenerTodasLasLocalidades();
                    setLocalidades(locResponse.data || []);
                } catch (locErr) {
                    console.warn("Advertencia: No se pudieron cargar las localidades para los filtros.", locErr);
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
        cargarDatosIniciales();
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
            // const estadoMatch = filtros.estadoPasaje ? pasaje.estado === filtros.estadoPasaje : true; // ELIMINADO

            let fechaMatch = true;
            if (pasaje.fechaViaje) {
                const fechaPasaje = new Date(pasaje.fechaViaje);
                fechaPasaje.setHours(0,0,0,0);

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
            } else if (filtros.fechaDesde || filtros.fechaHasta) {
                fechaMatch = false;
            }

            // return origenMatch && destinoMatch && estadoMatch && fechaMatch; // ANTES
            return origenMatch && destinoMatch && fechaMatch; // AHORA
        });

        // Aplicar ordenación
        if (filtros.sortBy) {
            pasajesProcesados.sort((a, b) => {
                let valA = a[filtros.sortBy];
                let valB = b[filtros.sortBy];

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

    // const estadosUnicos = useMemo(() => { ... }); // ELIMINADO

    if (loading && todosLosPasajes.length === 0) {
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
                {/* El filtro de estado ha sido eliminado del JSX */}
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
                <div className="pasajes-grid">
                    {pasajesFiltradosYOrdenados.map((pasaje) => (
                        <div key={pasaje.id} className="pasaje-card">
                            <div className="pasaje-card-header">
                                <h3 onClick={() => handleSortChange('destinoViaje')} style={{cursor: 'pointer'}}>
                                    Viaje a {pasaje.destinoViaje || 'Destino Desconocido'}
                                    {filtros.sortBy === 'destinoViaje' ? getSortIndicator('destinoViaje') : ''}
                                </h3>
                                <span className={`pasaje-estado pasaje-estado-${pasaje.estado?.toLowerCase()}`}>
                                    {pasaje.estado || 'ESTADO DESCONOCIDO'} {/* Mantenemos la visualización del estado del pasaje */}
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