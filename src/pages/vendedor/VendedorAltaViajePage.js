import React, { useState, useEffect } from 'react';
import { crearViaje, obtenerTodasLasLocalidades } from '../../services/api'; // Ajusta la ruta a tu api.js
import './VendedorAltaViajePage.css'; // CSS para esta página

const VendedorAltaViajePage = () => {
    // Estados del formulario
    const [fecha, setFecha] = useState('');
    const [horaSalida, setHoraSalida] = useState('');
    const [horaLlegada, setHoraLlegada] = useState('');
    const [origenId, setOrigenId] = useState('');
    const [destinoId, setDestinoId] = useState('');

    // Estados para la UI y datos
    const [localidades, setLocalidades] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLocalidadesLoading, setIsLocalidadesLoading] = useState(true);

    // Cargar localidades para los dropdowns al montar el componente
    useEffect(() => {
        const cargarLocalidades = async () => {
            setIsLocalidadesLoading(true);
            try {
                const response = await obtenerTodasLasLocalidades();
                setLocalidades(response.data || []);
                setError(''); // Limpiar errores previos
            } catch (err) {
                console.error("Error cargando localidades:", err);
                setError("No se pudieron cargar las localidades. Intente recargar la página.");
                setLocalidades([]);
            } finally {
                setIsLocalidadesLoading(false);
            }
        };
        cargarLocalidades();
    }, []);

    const limpiarFormulario = () => {
        setFecha('');
        setHoraSalida('');
        setHoraLlegada('');
        setOrigenId('');
        setDestinoId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');
        setIsLoading(true);

        if (!fecha || !horaSalida || !horaLlegada || !origenId || !destinoId) {
            setError("Todos los campos son obligatorios.");
            setIsLoading(false);
            return;
        }

        if (origenId === destinoId) {
            setError("La localidad de origen y destino no pueden ser la misma.");
            setIsLoading(false);
            return;
        }

        if (horaLlegada <= horaSalida) {
            setError("La hora de llegada debe ser posterior a la hora de salida.");
            setIsLoading(false);
            return;
        }

        const viajeData = {
            fecha,
            horaSalida,
            horaLlegada,
            origenId: parseInt(origenId, 10),
            destinoId: parseInt(destinoId, 10),
        };

        try {
            const response = await crearViaje(viajeData);
            setMensaje(`Viaje creado exitosamente con ID: ${response.data.id}. Asientos: ${response.data.asientosDisponibles}. Bus: ${response.data.busMatricula}`);
            limpiarFormulario();
        } catch (err) {
            console.error("Error al crear el viaje:", err.response?.data?.message || err.message);
            setError(err.response?.data?.message || "Error al crear el viaje. Verifique los datos o la disponibilidad de buses.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vendedor-alta-viaje-page">
            <header className="page-header">
                <h2>Alta de Nuevo Viaje</h2>
                <p>
                    Complete la información solicitada para registrar un nuevo viaje. El sistema asignará automáticamente un ómnibus disponible.
                </p>
            </header>

            <section className="form-section-container">
                {isLocalidadesLoading && <p className="loading-message">Cargando localidades...</p>}

                {!isLocalidadesLoading && (
                    <form onSubmit={handleSubmit} className="formulario-crear-viaje-directo">
                        {mensaje && <div className="mensaje-exito">{mensaje}</div>}
                        {error && <div className="mensaje-error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="fecha">Fecha del Viaje:</label>
                            <input
                                type="date"
                                id="fecha"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="horaSalida">Hora de Salida:</label>
                            <input
                                type="time"
                                id="horaSalida"
                                value={horaSalida}
                                onChange={(e) => setHoraSalida(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="horaLlegada">Hora de Llegada:</label>
                            <input
                                type="time"
                                id="horaLlegada"
                                value={horaLlegada}
                                onChange={(e) => setHoraLlegada(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="origen">Localidad de Origen:</label>
                            <select
                                id="origen"
                                value={origenId}
                                onChange={(e) => setOrigenId(e.target.value)}
                                required
                                disabled={localidades.length === 0}
                            >
                                <option value="">Seleccione una localidad</option>
                                {localidades.map(loc => (
                                    <option key={`origen-${loc.id}`} value={loc.id}>{loc.nombre} ({loc.departamento})</option>
                                ))}
                            </select>
                            {localidades.length === 0 && !isLocalidadesLoading && <p className="mensaje-advertencia">No hay localidades cargadas para seleccionar.</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="destino">Localidad de Destino:</label>
                            <select
                                id="destino"
                                value={destinoId}
                                onChange={(e) => setDestinoId(e.target.value)}
                                required
                                disabled={localidades.length === 0}
                            >
                                <option value="">Seleccione una localidad</option>
                                {localidades.map(loc => (
                                    <option key={`destino-${loc.id}`} value={loc.id}>{loc.nombre} ({loc.departamento})</option>
                                ))}
                            </select>
                            {localidades.length === 0 && !isLocalidadesLoading && <p className="mensaje-advertencia">No hay localidades cargadas para seleccionar.</p>}
                        </div>

                        <button type="submit" className="submit-button" disabled={isLoading || isLocalidadesLoading}>
                            {isLoading ? 'Creando Viaje...' : 'Crear Viaje'}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
};

export default VendedorAltaViajePage;