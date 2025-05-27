// VendedorCambiarEstadoOmnibus.js
import React, { useState, useEffect } from 'react';
import { obtenerOmnibusPorEstado, ponerOmnibusEnMantenimiento } from '../../services/api'; // API actualizada
import './VendedorCambiarEstadoOmnibus.css';

function VendedorCambiarEstadoOmnibus() {
    const [omnibusDisponibles, setOmnibusDisponibles] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    // 'inicioInactividad' no lo usa el endpoint de backend 'poner-en-mantenimiento' directamente.
    // El backend asume que el mantenimiento comienza cuando se llama al endpoint.
    // Lo mantenemos en el estado por si quieres darle algún uso en el UI o lógica futura.
    const [inicioInactividad, setInicioInactividad] = useState('');
    const [fechaReactivacion, setFechaReactivacion] = useState(''); // Antes 'finInactividad'
    // El 'nuevoEstado' seleccionado por el usuario es más conceptual. El backend
    // para '/poner-en-mantenimiento' siempre lo pone en EN_MANTENIMIENTO.
    const [estadoSeleccionadoUsuario, setEstadoSeleccionadoUsuario] = useState('EN_MANTENIMIENTO');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    // 'viajesConflictivos' no es manejado por el endpoint 'poner-en-mantenimiento' actual del backend.
    // Si necesitas esa validación, deberás agregarla al OmnibusService.
    // const [viajesConflictivos, setViajesConflictivos] = useState([]);

    useEffect(() => {
        const cargarOmnibusOperativos = async () => {
            setIsLoading(true);
            setMessage({ text: '', type: '' });
            try {
                const response = await obtenerOmnibusPorEstado('OPERATIVO');
                setOmnibusDisponibles(response.data || []);
                if (response.data && response.data.length === 0) {
                    setMessage({ text: 'No hay ómnibus en estado OPERATIVO disponibles.', type: 'info' });
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
        };
        cargarOmnibusOperativos();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ text: '', type: '' });
        // setViajesConflictivos([]);

        if (!selectedOmnibusId) {
            setMessage({ text: 'Por favor, seleccione un ómnibus.', type: 'error' });
            return;
        }
        // La fecha de inicio de inactividad no es estrictamente necesaria para el backend
        // si el mantenimiento se considera que empieza 'ahora'.
        // if (!inicioInactividad) {
        //     setMessage({ text: 'Por favor, ingrese la fecha y hora de inicio de inactividad.', type: 'error' });
        //     return;
        // }
        // La fecha de reactivación es opcional para el backend.
        if (fechaReactivacion && inicioInactividad && new Date(inicioInactividad) >= new Date(fechaReactivacion)) {
            setMessage({ text: 'La fecha de reactivación debe ser posterior a la fecha de inicio.', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            // El estado seleccionado por el usuario (EN_MANTENIMIENTO o FUERA_DE_SERVICIO)
            // no se pasa directamente al backend /poner-en-mantenimiento, ya que este
            // endpoint siempre pone el bus en EN_MANTENIMIENTO.
            // Si "FUERA_DE_SERVICIO temporal" es distinto, necesitaría otro endpoint/lógica.
            const response = await ponerOmnibusEnMantenimiento(
                selectedOmnibusId,
                fechaReactivacion || null // Enviar null si no se especificó fecha de reactivación
            );

            setMessage({
                text: `Ómnibus ID ${response.data.id} (Matrícula: ${response.data.matricula}) ahora en estado ${response.data.estado}. Reactivación programada para: ${response.data.fechaHoraReactivacionProgramada || 'No definida'}.`,
                type: 'success',
            });
            setSelectedOmnibusId('');
            setInicioInactividad('');
            setFechaReactivacion('');
            const updatedOmnibusList = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusDisponibles(updatedOmnibusList.data || []);

        } catch (error) {
            console.error("Error al poner ómnibus en mantenimiento:", error.response || error);
            let errorMessage = 'Ocurrió un error al intentar cambiar el estado del ómnibus.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
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
        <div className="cambiar-estado-omnibus-container">
            <h2>Poner Ómnibus en Mantenimiento / Inactivo Temporalmente</h2>
            <form onSubmit={handleSubmit} className="cambiar-estado-form">
                <div className="form-group">
                    <label htmlFor="omnibus-select">Seleccionar Ómnibus (Operativos):</label>
                    <select
                        id="omnibus-select"
                        value={selectedOmnibusId}
                        onChange={(e) => setSelectedOmnibusId(e.target.value)}
                        disabled={isLoading || omnibusDisponibles.length === 0}
                        required
                    >
                        <option value="" disabled>
                            {omnibusDisponibles.length > 0 ? "-- Seleccione un ómnibus --" : "No hay ómnibus operativos"}
                        </option>
                        {omnibusDisponibles.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                {omnibus.matricula} - {omnibus.marca} {omnibus.modelo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inicio-inactividad">Inicio de Inactividad (Opcional, informativo):</label>
                    <input
                        type="datetime-local"
                        id="inicio-inactividad"
                        value={inicioInactividad}
                        onChange={(e) => setInicioInactividad(e.target.value)}
                        min={getCurrentDateTimeLocal()}
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fecha-reactivacion">Fecha de Reactivación Estimada (Opcional):</label>
                    <input
                        type="datetime-local"
                        id="fecha-reactivacion"
                        value={fechaReactivacion}
                        onChange={(e) => setFechaReactivacion(e.target.value)}
                        min={inicioInactividad || getCurrentDateTimeLocal()}
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tipo-inactividad">Tipo de Inactividad:</label>
                    <select
                        id="tipo-inactividad"
                        value={estadoSeleccionadoUsuario}
                        onChange={(e) => setEstadoSeleccionadoUsuario(e.target.value)}
                        disabled={isLoading}
                        required
                    >
                        {/* Este select es más para la intención del usuario, ya que el endpoint actual
                            del backend para inactividad temporal es '/poner-en-mantenimiento' */}
                        <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                        <option value="FUERA_DE_SERVICIO_TEMPORAL">Fuera de Servicio Temporal</option>
                    </select>
                </div>

                <button type="submit" disabled={isLoading || !selectedOmnibusId} className="submit-button">
                    {isLoading ? 'Procesando...' : 'Aplicar Estado'}
                </button>
            </form>

            {message.text && (
                <div className={`message ${message.type === 'info' ? 'info' : message.type}`}>
                    {message.text}
                </div>
            )}

            {/* La sección de viajesConflictivos se elimina por ahora ya que el endpoint de mantenimiento no la maneja
            {viajesConflictivos.length > 0 && (
                // ...
            )}
            */}
        </div>
    );
}

export default VendedorCambiarEstadoOmnibus;