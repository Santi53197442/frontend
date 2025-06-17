import React, { useState, useEffect } from 'react';
// --- LÍNEA CORREGIDA ---
// Importamos la función correcta que ya existe en tu apiService.js
import { obtenerListadoViajesConPrecio } from '../services/api';
import './TarifasHorarios.css';

const TarifasHorarios = () => {
    const [viajes, setViajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarViajes = async () => {
            try {
                setLoading(true);
                setError('');
                // --- LÍNEA CORREGIDA ---
                // Ahora llamamos a la función con el nombre correcto
                const response = await obtenerListadoViajesConPrecio();
                setViajes(response.data || []);
            } catch (err) {
                console.error("Error al cargar tarifas y horarios:", err);
                setError("No se pudieron cargar los datos de los viajes. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        cargarViajes();
    }, []);

    // Función para formatear la fecha usando los getters transitorios de la entidad
    const formatDate = (fecha) => {
        const dateObj = new Date(fecha);
        // Ajustamos para evitar problemas de zona horaria que resten un día
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return dateObj.toLocaleDateString('es-UY', options);
    };

    return (
        <div className="tarifas-horarios-container">
            <h1>Tarifas y Horarios</h1>
            <p>Consulta todos nuestros viajes programados, sus rutas, horarios y precios.</p>

            {loading && <p>Cargando horarios...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <div className="tabla-viajes-wrapper">
                    <table className="tabla-viajes">
                        <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Origen</th>
                            <th>Destino</th>
                            <th>Salida</th>
                            <th>Llegada</th>
                            <th>Estado</th>
                            <th>Precio</th>
                        </tr>
                        </thead>
                        <tbody>
                        {viajes.length > 0 ? (
                            viajes.map(viaje => (
                                <tr key={viaje.id}>
                                    <td>{formatDate(viaje.fecha)}</td>
                                    <td>{viaje.origenNombre}</td>
                                    <td>{viaje.destinoNombre}</td>
                                    <td>{viaje.horaSalida}</td>
                                    <td>{viaje.horaLlegada}</td>
                                    <td>{viaje.estado}</td>
                                    <td>${viaje.precio.toFixed(2)}</td> {/* Usar toFixed para mostrar 2 decimales */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No hay viajes programados para mostrar en este momento.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TarifasHorarios;