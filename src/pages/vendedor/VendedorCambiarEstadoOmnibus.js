// src/pages/vendedor/VendedorCambiarEstadoOmnibus.js
import React, { useState, useEffect, useCallback } from 'react'; // useCallback añadido por si se usa en dependencias de useEffect
import { obtenerOmnibusPorEstado, marcarOmnibusInactivo } from '../../services/api';
import './VendedorCambiarEstadoOmnibus.css'; // Asegúrate de que este archivo CSS exista y esté estilizado

function VendedorCambiarEstadoOmnibus() {
    const [omnibusDisponibles, setOmnibusDisponibles] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    const [inicioInactividad, setInicioInactividad] = useState('');
    const [finInactividad, setFinInactividad] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('EN_MANTENIMIENTO'); // Estado por defecto
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success', 'error', o 'info'
    const [viajesConflictivos, setViajesConflictivos] = useState([]);

    // Cargar ómnibus operativos al montar el componente
    const cargarOmnibusOperativos = useCallback(async () => { // envuelto en useCallback por si se usa como dependencia
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        setViajesConflictivos([]); // Limpiar viajes previos al recargar
        try {
            const response = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusDisponibles(response.data || []);
            if (response.status === 204 || (response.data && response.data.length === 0)) {
                setMessage({ text: 'No hay ómnibus en estado OPERATIVO disponibles para modificar.', type: 'info' });
                setOmnibusDisponibles([]); // Asegurar que sea un array vacío
            }
        } catch (error) {
            console.error("Error cargando ómnibus operativos:", error.response || error);
            let errMsg = "Error al cargar la lista de ómnibus operativos.";
            if (error.response && error.response.status === 403) {
                errMsg = "No tiene permisos para ver los ómnibus. Verifique su sesión.";
            } else if (error.response && error.response.data && error.response.data.message) {
                errMsg = error.response.data.message;
            }
            setMessage({ text: errMsg, type: 'error' });
            setOmnibusDisponibles([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback porque la función en sí no cambia

    useEffect(() => {
        cargarOmnibusOperativos();
    }, [cargarOmnibusOperativos]); // Ahora cargarOmnibusOperativos es una dependencia estable

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ text: '', type: '' });
        setViajesConflictivos([]);

        if (!selectedOmnibusId) {
            setMessage({ text: 'Por favor, seleccione un ómnibus.', type: 'error' });
            return;
        }
        if (!inicioInactividad) {
            setMessage({ text: 'Por favor, ingrese la fecha y hora de inicio de inactividad.', type: 'error' });
            return;
        }
        if (!finInactividad) {
            setMessage({ text: 'Por favor, ingrese la fecha y hora de fin de inactividad.', type: 'error' });
            return;
        }
        if (new Date(inicioInactividad) >= new Date(finInactividad)) {
            setMessage({ text: 'La fecha de fin debe ser posterior a la fecha de inicio.', type: 'error' });
            return;
        }

        setIsLoading(true);

        const inactividadData = {
            // Convertir fechas a formato YYYY-MM-DD si es necesario, aunque datetime-local ya debería darlo
            // Si el backend espera solo fecha (LocalDate) y no hora, hay que ajustar aquí.
            // Asumiendo que el backend espera YYYY-MM-DDTHH:MM o maneja la conversión de LocalDate.
            inicioInactividad: inicioInactividad,
            finInactividad: finInactividad,
            nuevoEstado: nuevoEstado,
        };

        try {
            const response = await marcarOmnibusInactivo(selectedOmnibusId, inactividadData);
            setMessage({
                text: `Ómnibus ID ${response.data.id} (Matrícula: ${response.data.matricula}) cambiado a estado ${response.data.estado} exitosamente.`,
                type: 'success',
            });
            setSelectedOmnibusId('');
            setInicioInactividad('');
            setFinInactividad('');
            setNuevoEstado('EN_MANTENIMIENTO'); // Reset al estado por defecto
            cargarOmnibusOperativos(); // Recargar la lista
        } catch (error) {
            console.error("Error al marcar ómnibus inactivo:", error.response || error);
            let errorMessage = 'Ocurrió un error al intentar cambiar el estado del ómnibus.';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || errorMessage;
                if (error.response.data.viajesConflictivos) {
                    setViajesConflictivos(error.response.data.viajesConflictivos);
                }
            }
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localNow = new Date(now.getTime() - (offset * 60 * 1000));
        return localNow.toISOString().slice(0, 16);
    };

    return (
        <div className="vces-container"> {/* Cambié el prefijo de clase para este componente vces: VendedorCambiarEstadoOmnibus */}
            <h2 className="vces-title">Marcar Ómnibus como Inactivo Temporalmente</h2>
            <form onSubmit={handleSubmit} className="vces-form">
                <div className="vces-form-group">
                    <label htmlFor="omnibus-select">Seleccionar Ómnibus (Solo Operativos):</label>
                    <select
                        id="omnibus-select"
                        value={selectedOmnibusId}
                        onChange={(e) => setSelectedOmnibusId(e.target.value)}
                        disabled={isLoading || omnibusDisponibles.length === 0}
                        required
                    >
                        <option value="" disabled>
                            {isLoading && omnibusDisponibles.length === 0 ? "Cargando ómnibus..." :
                                !isLoading && omnibusDisponibles.length === 0 ? "No hay ómnibus operativos" :
                                    "-- Seleccione un ómnibus --"}
                        </option>
                        {omnibusDisponibles.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                {omnibus.matricula} - {omnibus.marca} {omnibus.modelo} (ID: {omnibus.id})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="vces-form-group">
                    <label htmlFor="inicio-inactividad">Inicio de Inactividad:</label>
                    <input
                        type="datetime-local"
                        id="inicio-inactividad"
                        value={inicioInactividad}
                        onChange={(e) => {
                            setInicioInactividad(e.target.value);
                            // Opcional: si finInactividad es anterior al nuevo inicioInactividad, limpiarla o ajustarla
                            if (finInactividad && new Date(e.target.value) >= new Date(finInactividad)) {
                                setFinInactividad('');
                            }
                        }}
                        min={getCurrentDateTimeLocal()}
                        disabled={isLoading}
                        required
                    />
                </div>

                <div className="vces-form-group">
                    <label htmlFor="fin-inactividad">Fin de Inactividad:</label>
                    <input
                        type="datetime-local"
                        id="fin-inactividad"
                        value={finInactividad}
                        onChange={(e) => setFinInactividad(e.target.value)}
                        min={inicioInactividad || getCurrentDateTimeLocal()}
                        disabled={isLoading || !inicioInactividad} // Deshabilitar si no hay fecha de inicio
                        required
                    />
                </div>

                <div className="vces-form-group">
                    <label htmlFor="nuevo-estado">Nuevo Estado de Inactividad:</label>
                    <select
                        id="nuevo-estado"
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                        disabled={isLoading}
                        required
                    >
                        <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                        <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                        <option value="INACTIVO">Inactivo (General)</option> {/* <-- AÑADIDO AQUÍ */}
                    </select>
                </div>

                <button type="submit" disabled={isLoading || !selectedOmnibusId} className="vces-submit-button">
                    {isLoading ? 'Procesando...' : `Marcar como ${nuevoEstado.replace('_', ' ')}`}
                </button>
            </form>

            {message.text && (
                <div className={`vces-message vces-message-${message.type}`}>
                    {message.text}
                </div>
            )}

            {viajesConflictivos.length > 0 && (
                <div className="vces-viajes-conflictivos">
                    <h4>Viajes Conflictivos Detectados:</h4>
                    <ul>
                        {viajesConflictivos.map((viaje, index) => (
                            // Asegúrate que el objeto viaje tenga estas propiedades
                            <li key={viaje.id || `conflicto-${index}`}>
                                Viaje ID: {viaje.id || 'N/A'},
                                Fecha: {viaje.fecha || new Date(viaje.fechaHoraSalida).toLocaleDateString() || 'N/A'},
                                Desde: {viaje.origen?.nombre || 'N/A'} ({viaje.horaSalida || new Date(viaje.fechaHoraSalida).toLocaleTimeString() || 'N/A'})
                                Hasta: {viaje.destino?.nombre || 'N/A'} ({viaje.horaLlegada || new Date(viaje.fechaHoraLlegadaEstimada).toLocaleTimeString() || 'N/A'})
                            </li>
                        ))}
                    </ul>
                    <p>Por favor, cancele o reprograme estos viajes antes de marcar el ómnibus como inactivo en este período.</p>
                </div>
            )}
        </div>
    );
}

export default VendedorCambiarEstadoOmnibus;