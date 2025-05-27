import React, { useState, useEffect } from 'react';
// Asegúrate que la ruta a tu api.js sea correcta
import { obtenerOmnibusPorEstado, marcarOmnibusInactivo } from '../services/api';
import './VendedorCambiarEstadoOmnibus.css'; // Asegúrate de que este archivo CSS exista y esté estilizado

function VendedorCambiarEstadoOmnibus() {
    const [omnibusDisponibles, setOmnibusDisponibles] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    const [inicioInactividad, setInicioInactividad] = useState('');
    const [finInactividad, setFinInactividad] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('EN_MANTENIMIENTO'); // Estado por defecto
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' o 'error'
    const [viajesConflictivos, setViajesConflictivos] = useState([]);

    // Cargar ómnibus operativos al montar el componente
    useEffect(() => {
        const cargarOmnibusOperativos = async () => {
            setIsLoading(true); // Indicar carga inicial
            setMessage({ text: '', type: '' });
            try {
                const response = await obtenerOmnibusPorEstado('OPERATIVO');
                setOmnibusDisponibles(response.data || []); // response.data puede ser null si es 204 No Content
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
    }, []); // El array vacío significa que se ejecuta solo al montar

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
            inicioInactividad: inicioInactividad, // Formato YYYY-MM-DDTHH:MM (el input datetime-local lo da así)
            finInactividad: finInactividad,
            nuevoEstado: nuevoEstado,
        };

        try {
            const response = await marcarOmnibusInactivo(selectedOmnibusId, inactividadData);
            setMessage({
                text: `Ómnibus ID ${response.data.id} (Matrícula: ${response.data.matricula}) cambiado a estado ${response.data.estado} exitosamente.`,
                type: 'success',
            });
            // Opcional: Limpiar formulario y recargar ómnibus operativos
            setSelectedOmnibusId('');
            setInicioInactividad('');
            setFinInactividad('');
            // Recargar la lista para reflejar el cambio de estado del ómnibus (si ya no es OPERATIVO)
            const updatedOmnibusList = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusDisponibles(updatedOmnibusList.data || []);

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

    // Función para obtener la fecha y hora actual en formato YYYY-MM-DDTHH:MM para el min del input
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        // Ajustar a la zona horaria local para que el 'min' funcione correctamente con el input
        const offset = now.getTimezoneOffset();
        const localNow = new Date(now.getTime() - (offset*60*1000));
        return localNow.toISOString().slice(0,16); // Formato YYYY-MM-DDTHH:mm
    };

    return (
        <div className="cambiar-estado-omnibus-container">
            <h2>Marcar Ómnibus como Inactivo</h2>
            <form onSubmit={handleSubmit} className="cambiar-estado-form">
                <div className="form-group">
                    <label htmlFor="omnibus-select">Seleccionar Ómnibus (Solo Operativos):</label>
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
                    <label htmlFor="inicio-inactividad">Inicio de Inactividad:</label>
                    <input
                        type="datetime-local"
                        id="inicio-inactividad"
                        value={inicioInactividad}
                        onChange={(e) => setInicioInactividad(e.target.value)}
                        min={getCurrentDateTimeLocal()}
                        disabled={isLoading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fin-inactividad">Fin de Inactividad:</label>
                    <input
                        type="datetime-local"
                        id="fin-inactividad"
                        value={finInactividad}
                        onChange={(e) => setFinInactividad(e.target.value)}
                        min={inicioInactividad || getCurrentDateTimeLocal()} // Fin no puede ser antes que inicio
                        disabled={isLoading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nuevo-estado">Nuevo Estado:</label>
                    <select
                        id="nuevo-estado"
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                        disabled={isLoading}
                        required
                    >
                        <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                        <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                    </select>
                </div>

                <button type="submit" disabled={isLoading || !selectedOmnibusId} className="submit-button">
                    {isLoading ? 'Procesando...' : 'Marcar Inactivo'}
                </button>
            </form>

            {message.text && (
                <div className={`message ${message.type === 'info' ? 'info' : message.type}`}>
                    {message.text}
                </div>
            )}

            {viajesConflictivos.length > 0 && (
                <div className="viajes-conflictivos">
                    <h4>Viajes Conflictivos Detectados:</h4>
                    <ul>
                        {viajesConflictivos.map((viaje, index) => (
                            <li key={viaje.id || index}> {/* Usar viaje.id si está disponible y es único */}
                                Viaje ID: {viaje.id}, Fecha: {viaje.fecha}, De {viaje.horaSalida} a {viaje.horaLlegada}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default VendedorCambiarEstadoOmnibus;