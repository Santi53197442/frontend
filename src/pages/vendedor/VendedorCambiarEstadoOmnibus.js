import React, { useState, useEffect } from 'react';
import { obtenerOmnibusPorEstado } from '../../services/api'; // API actualizada
import './VendedorCambiarEstadoOmnibus.css'; // Asegúrate que este archivo CSS exista

function VendedorCambiarEstadoOmnibus() {
    const [omnibusDisponibles, setOmnibusDisponibles] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    const [inicioInactividad, setInicioInactividad] = useState(''); // Para UI, no se envía directamente si el mantenimiento empieza "ahora"
    const [fechaReactivacion, setFechaReactivacion] = useState(''); // Se enviará como fechaHoraReactivacionEstimada
    const [estadoSeleccionadoUsuario, setEstadoSeleccionadoUsuario] = useState('EN_MANTENIMIENTO'); // Intención del usuario

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

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
                if (error.response) {
                    if (error.response.status === 403) {
                        errMsg = "No tiene permisos para ver los ómnibus. Verifique su sesión.";
                    } else if (error.response.data && error.response.data.message) {
                        errMsg = error.response.data.message;
                    }
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

        if (!selectedOmnibusId) {
            setMessage({ text: 'Por favor, seleccione un ómnibus.', type: 'error' });
            return;
        }
        // Validar que la fecha de reactivación sea posterior al inicio (si ambas están presentes)
        if (fechaReactivacion && inicioInactividad && new Date(inicioInactividad) >= new Date(fechaReactivacion)) {
            setMessage({ text: 'La fecha de reactivación debe ser posterior a la fecha de inicio.', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            // El 'estadoSeleccionadoUsuario' aquí es más para el UI. El endpoint de backend
            // '/poner-en-mantenimiento' implícitamente pone el bus en EN_MANTENIMIENTO.
            // Si 'FUERA_DE_SERVICIO_TEMPORAL' es un flujo de backend diferente, necesitarías
            // una función de API distinta y lógica condicional aquí.
            const response = await ponerOmnibusEnMantenimiento(
                selectedOmnibusId,
                fechaReactivacion || null // Enviar null si no se especificó fecha de reactivación
            );

            setMessage({
                text: `Ómnibus ID ${response.data.id} (Matrícula: ${response.data.matricula}) ahora en estado ${response.data.estado}. Reactivación programada para: ${response.data.fechaHoraReactivacionProgramada || 'No definida'}.`,
                type: 'success',
            });
            // Resetear formulario y recargar lista
            setSelectedOmnibusId('');
            setInicioInactividad('');
            setFechaReactivacion('');
            setEstadoSeleccionadoUsuario('EN_MANTENIMIENTO'); // Resetear al valor por defecto
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
        const offset = now.getTimezoneOffset(); // Diferencia en minutos con UTC
        const localNow = new Date(now.getTime() - (offset * 60 * 1000));
        return localNow.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
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
                            {omnibusDisponibles.length > 0 ? "-- Seleccione un ómnibus --" : "Cargando o no hay ómnibus operativos..."}
                        </option>
                        {omnibusDisponibles.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                {omnibus.matricula} - {omnibus.marca} {omnibus.modelo} (ID: {omnibus.id})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inicio-inactividad">Inicio (Informativo, mantenimiento empieza al aplicar):</label>
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
                        min={inicioInactividad || getCurrentDateTimeLocal()} // No puede ser antes que el inicio
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tipo-inactividad">Tipo de Inactividad (Conceptual):</label>
                    <select
                        id="tipo-inactividad"
                        value={estadoSeleccionadoUsuario}
                        onChange={(e) => setEstadoSeleccionadoUsuario(e.target.value)}
                        disabled={isLoading}
                        required
                    >
                        <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                        {/* Si tienes un flujo diferente para "FUERA_DE_SERVICIO_TEMPORAL" en el backend,
                            necesitarías manejarlo. Por ahora, ambos usan 'ponerOmnibusEnMantenimiento'. */}
                        <option value="FUERA_DE_SERVICIO_TEMPORAL">Fuera de Servicio Temporal</option>
                    </select>
                </div>

                <button type="submit" disabled={isLoading || !selectedOmnibusId} className="submit-button">
                    {isLoading ? 'Procesando...' : 'Aplicar Estado al Ómnibus'}
                </button>
            </form>

            {message.text && (
                <div className={`message ${message.type === 'info' ? 'info-message' : message.type + '-message'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default VendedorCambiarEstadoOmnibus;