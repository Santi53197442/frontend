// src/components/VendedorCambiarEstadoOmnibus.jsx
import React, { useState, useEffect } from 'react';
import { obtenerTodosLosOmnibus, marcarOmnibusInactivo } from '../../services/api'; // Ajusta la ruta a tu api.js
import './VendedorCambiarEstadoOmnibus.css'; // Crearemos este archivo CSS

function VendedorCambiarEstadoOmnibus() {
    const [omnibusDisponibles, setOmnibusDisponibles] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    const [inicioInactividad, setInicioInactividad] = useState('');
    const [finInactividad, setFinInactividad] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('EN_MANTENIMIENTO'); // Estado por defecto
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' o 'error'
    const [viajesConflictivos, setViajesConflictivos] = useState([]);

    // Cargar ómnibus disponibles al montar el componente
    useEffect(() => {
        const cargarOmnibus = async () => {
            try {
                const response = await obtenerTodosLosOmnibus();
                // Filtrar para mostrar solo buses que podrían necesitar mantenimiento (ej. OPERATIVO)
                // o adaptar según tu lógica de negocio.
                setOmnibusDisponibles(response.data || []);
                if (response.data && response.data.length > 0) {
                    // Opcional: seleccionar el primero por defecto si la lista no es muy larga
                    // setSelectedOmnibusId(response.data[0].id);
                }
            } catch (error) {
                console.error("Error cargando ómnibus:", error);
                setMessage({ text: 'Error al cargar la lista de ómnibus.', type: 'error' });
                setOmnibusDisponibles([]);
            }
        };
        cargarOmnibus();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage({ text: '', type: '' });
        setViajesConflictivos([]);
        setIsLoading(true);

        if (!selectedOmnibusId || !inicioInactividad || !finInactividad || !nuevoEstado) {
            setMessage({ text: 'Por favor, complete todos los campos.', type: 'error' });
            setIsLoading(false);
            return;
        }

        // Formatear las fechas y horas a YYYY-MM-DDTHH:mm:ss si tus inputs son datetime-local
        // Los inputs datetime-local ya devuelven este formato.
        // Si usaras date y time por separado, necesitarías combinarlos.

        const inactividadData = {
            inicioInactividad: inicioInactividad, // Asegúrate que el input datetime-local genere esto
            finInactividad: finInactividad,     // o formatea aquí si es necesario
            nuevoEstado: nuevoEstado,
        };

        try {
            const response = await marcarOmnibusInactivo(selectedOmnibusId, inactividadData);
            setMessage({
                text: `Ómnibus ID ${response.data.id} (${response.data.matricula}) cambiado a estado ${response.data.estado} exitosamente.`,
                type: 'success',
            });
            // Opcional: Limpiar formulario o actualizar lista de ómnibus
            // setSelectedOmnibusId('');
            // setInicioInactividad('');
            // setFinInactividad('');
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
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajustar a la zona horaria local
        return now.toISOString().slice(0, 16);
    };


    return (
        <div className="cambiar-estado-omnibus-container">
            <h2>Marcar Ómnibus como Inactivo</h2>
            <form onSubmit={handleSubmit} className="cambiar-estado-form">
                <div className="form-group">
                    <label htmlFor="omnibus-select">Seleccionar Ómnibus:</label>
                    <select
                        id="omnibus-select"
                        value={selectedOmnibusId}
                        onChange={(e) => setSelectedOmnibusId(e.target.value)}
                        required
                    >
                        <option value="" disabled>-- Seleccione un ómnibus --</option>
                        {omnibusDisponibles.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                {omnibus.matricula} - {omnibus.marca} {omnibus.modelo} (Estado: {omnibus.estado})
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
                        min={getCurrentDateTimeLocal()} // No permitir fechas pasadas
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
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nuevo-estado">Nuevo Estado:</label>
                    <select
                        id="nuevo-estado"
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                        required
                    >
                        <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                        <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                    </select>
                </div>

                <button type="submit" disabled={isLoading} className="submit-button">
                    {isLoading ? 'Procesando...' : 'Marcar Inactivo'}
                </button>
            </form>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {viajesConflictivos.length > 0 && (
                <div className="viajes-conflictivos">
                    <h4>Viajes Conflictivos Detectados:</h4>
                    <ul>
                        {viajesConflictivos.map((viaje, index) => (
                            <li key={index}>
                                Viaje ID: {viaje.id}, Fecha: {viaje.fecha}, Salida: {viaje.horaSalida}, Llegada: {viaje.horaLlegada}
                                {/* Podrías añadir más detalles del viaje si los devuelve la API */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default VendedorCambiarEstadoOmnibus;