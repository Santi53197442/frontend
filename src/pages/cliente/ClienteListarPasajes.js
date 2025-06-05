// src/pages/ClienteListarPasajes.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext'; // Asegúrate que la ruta sea correcta
import { obtenerHistorialPasajesCliente } from '../services/apiService'; // Asegúrate que la ruta sea correcta
import './ClienteListarPasajes.css'; // Crearemos este archivo CSS
import { Link } from 'react-router-dom'; // Para el botón de volver

const ClienteListarPasajes = () => {
    const { user } = useAuth(); // Obtener el usuario logueado (que contiene el ID)
    const [pasajes, setPasajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistorialPasajes = async () => {
            if (user && user.id) { // Asegurarse que el usuario y su ID están disponibles
                try {
                    setLoading(true);
                    setError('');
                    const response = await obtenerHistorialPasajesCliente(user.id);
                    setPasajes(response.data || []); // El backend devuelve la lista directamente en data
                } catch (err) {
                    console.error("Error al obtener historial de pasajes:", err);
                    setError(err.response?.data?.message || "No se pudo cargar el historial de pasajes. Inténtalo más tarde.");
                    setPasajes([]); // Limpiar pasajes en caso de error
                } finally {
                    setLoading(false);
                }
            } else {
                setError("No se pudo identificar al usuario para cargar el historial.");
                setLoading(false);
            }
        };

        fetchHistorialPasajes();
    }, [user]); // Dependencia: se ejecuta cuando 'user' cambia

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div><p>Cargando historial de pasajes...</p></div>;
    }

    return (
        <div className="listar-pasajes-container">
            <h1 className="page-title">Mis Pasajes Comprados</h1>

            {error && <div className="error-message">{error}</div>}

            {!loading && !error && pasajes.length === 0 && (
                <div className="no-pasajes-message">
                    <p>Aún no has comprado ningún pasaje.</p>
                    <Link to="/viajes" className="cta-button">Buscar Viajes</Link>
                </div>
            )}

            {pasajes.length > 0 && (
                <div className="pasajes-grid">
                    {pasajes.map((pasaje) => (
                        <div key={pasaje.id} className="pasaje-card">
                            <div className="pasaje-card-header">
                                <h3>Viaje a {pasaje.destinoViaje || 'Destino Desconocido'}</h3>
                                <span className={`pasaje-estado pasaje-estado-${pasaje.estado?.toLowerCase()}`}>
                                    {pasaje.estado || 'ESTADO DESCONOCIDO'}
                                </span>
                            </div>
                            <div className="pasaje-card-body">
                                <p><strong>ID Pasaje:</strong> {pasaje.id}</p>
                                <p><strong>Origen:</strong> {pasaje.origenViaje || 'N/A'}</p>
                                <p><strong>Destino:</strong> {pasaje.destinoViaje || 'N/A'}</p>
                                <p><strong>Fecha:</strong> {pasaje.fechaViaje ? new Date(pasaje.fechaViaje).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Hora Salida:</strong> {pasaje.horaSalidaViaje || 'N/A'}</p>
                                <p><strong>Asiento N°:</strong> {pasaje.numeroAsiento || 'N/A'}</p>
                                <p><strong>Precio:</strong> ${pasaje.precio ? pasaje.precio.toFixed(2) : 'N/A'}</p>
                                {/* Podrías añadir más detalles si los tienes en PasajeResponseDTO */}
                            </div>
                            <div className="pasaje-card-footer">
                                {/* Aquí podrías poner acciones como "Ver Detalle Completo del Viaje" o "Cancelar Pasaje" si aplica */}
                                {/* <Link to={`/viajes/${pasaje.viajeId}`} className="info-button">Ver Viaje</Link> */}
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