import React, { useState, useEffect } from 'react';
import { obtenerOmnibusPorEstado, marcarOmnibusInactivo } from '../../services/api';
import './VendedorCambiarEstadoOmnibus.css';

function VendedorCambiarEstadoOmnibus() {
    const [omnibusDisponibles, setOmnibusDisponibles] = useState([]);
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    const [inicioInactividad, setInicioInactividad] = useState('');
    const [finInactividad, setFinInactividad] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('EN_MANTENIMIENTO');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [viajesConflictivos, setViajesConflictivos] = useState([]);

    useEffect(() => {
        const cargarOmnibusOperativos = async () => {
            setIsLoading(true);
            try {
                const response = await obtenerOmnibusPorEstado('OPERATIVO');
                setOmnibusDisponibles(response.data || []);
                if (!response.data || response.data.length === 0) {
                    setMessage({ text: 'No hay ómnibus en estado OPERATIVO disponibles.', type: 'info' });
                }
            } catch (error) {
                const errMsg = error.response?.data?.message || "Error al cargar la lista de ómnibus.";
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
        setViajesConflictivos([]);

        if (!selectedOmnibusId || !inicioInactividad || !finInactividad) {
            setMessage({ text: 'Por favor, complete todos los campos.', type: 'error' });
            return;
        }
        if (new Date(inicioInactividad) >= new Date(finInactividad)) {
            setMessage({ text: 'La fecha de fin debe ser posterior a la fecha de inicio.', type: 'error' });
            return;
        }

        setIsLoading(true);

        const inactividadData = {
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
            const updatedOmnibusList = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusDisponibles(updatedOmnibusList.data || []);

        } catch (error) {
            console.error("Error al marcar ómnibus inactivo:", error.response || error);
            // --- LÓGICA DE ERROR MEJORADA ---
            // Intenta obtener el mensaje de error de validación primero
            let errorMessage = error.response?.data?.errors?.[0]?.defaultMessage ||
                error.response?.data?.message ||
                'Ocurrió un error al intentar cambiar el estado del ómnibus.';

            setMessage({ text: errorMessage, type: 'error' });

            if (error.response?.data?.viajesConflictivos) {
                setViajesConflictivos(error.response.data.viajesConflictivos);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNCIÓN DE FECHA CORREGIDA ---
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        // Añadimos 1 minuto para dar un margen de seguridad a la validación @FutureOrPresent
        now.setMinutes(now.getMinutes() + 1);

        const offset = now.getTimezoneOffset();
        const localNow = new Date(now.getTime() - (offset * 60 * 1000));
        return localNow.toISOString().slice(0, 16);
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
                        min={getCurrentDateTimeLocal()} // Ahora el mínimo es en el futuro
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
                        min={inicioInactividad || getCurrentDateTimeLocal()}
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
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {viajesConflictivos.length > 0 && (
                <div className="viajes-conflictivos">
                    <h4>Viajes Conflictivos Detectados:</h4>
                    <ul>
                        {viajesConflictivos.map((viaje, index) => (
                            <li key={viaje.id || index}>
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