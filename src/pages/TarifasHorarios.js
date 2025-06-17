import React, { useState, useEffect } from 'react';
import { obtenerListadoViajesConPrecio } from '../services/api';
import './TarifasHorarios.css';

const TarifasHorarios = () => {
    // Estado para guardar los viajes *filtrados*
    const [viajesMostrados, setViajesMostrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarYFiltrarViajes = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await obtenerListadoViajesConPrecio();
                const todosLosViajes = response.data || [];

                // --- LÓGICA DE FILTRADO EN EL FRONTEND ---
                const viajesFiltrados = todosLosViajes.filter(
                    viaje => viaje.estado === 'PROGRAMADO'
                );

                setViajesMostrados(viajesFiltrados);

            } catch (err) {
                console.error("Error al cargar tarifas y horarios:", err);
                setError("No se pudieron cargar los datos de los viajes. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        cargarYFiltrarViajes();
    }, []);

    const formatDate = (fecha) => {
        const dateObj = new Date(fecha);
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return dateObj.toLocaleDateString('es-UY', options);
    };

    return (
        <div className="tarifas-horarios-container">
            <h1>Tarifas y Horarios</h1>
            <p>Consulta todos nuestros próximos viajes, sus rutas, horarios y precios.</p>

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
                            {/* La columna "Estado" ya no se renderiza */}
                            <th>Precio</th>
                        </tr>
                        </thead>
                        <tbody>
                        {viajesMostrados.length > 0 ? (
                            // Ahora iteramos sobre la lista ya filtrada
                            viajesMostrados.map(viaje => (
                                <tr key={viaje.id}>
                                    <td>{formatDate(viaje.fecha)}</td>
                                    <td>{viaje.origenNombre}</td>
                                    <td>{viaje.destinoNombre}</td>
                                    <td>{viaje.horaSalida}</td>
                                    <td>{viaje.horaLlegada}</td>
                                    {/* La celda "Estado" ya no se renderiza */}
                                    <td>${viaje.precio.toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* Ajustamos el colspan a 6 columnas */}
                                <td colSpan="6">No hay viajes programados para mostrar en este momento.</td>
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