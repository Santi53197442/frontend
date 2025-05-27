// src/components/Vendedor/VendedorReasignarViaje.js
import React, { useState, useEffect } from 'react';
import {
    obtenerViajesPorEstado,
    obtenerOmnibusPorEstado,
    reasignarViaje
} from '../../services/api'; // Ajusta la ruta a tu apiService

const VendedorReasignarViaje = () => {
    const [viajesProgramados, setViajesProgramados] = useState([]);
    const [omnibusOperativos, setOmnibusOperativos] = useState([]);

    const [selectedViajeId, setSelectedViajeId] = useState('');
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- Función para obtener viajes programados usando obtenerViajesPorEstado ---
    const fetchViajesProgramados = async () => {
        setLoading(true);
        setError(null); // Limpiar errores previos
        try {
            // Llama a la función del apiService para obtener viajes con estado 'PROGRAMADO'
            const response = await obtenerViajesPorEstado('PROGRAMADO');
            // Asume que la respuesta de la API es un objeto con una propiedad 'data' que contiene el array de viajes
            // o que la respuesta es directamente el array de viajes.
            // Si response.data es undefined pero response es el array, usa response.
            setViajesProgramados(response.data || response || []);
            if ((response.data && response.data.length === 0) || (Array.isArray(response) && response.length === 0)) {
                console.info("No se encontraron viajes programados.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al cargar viajes programados.';
            setError(errorMessage);
            setViajesProgramados([]); // Asegurar que no haya datos viejos en caso de error
            console.error("Error en fetchViajesProgramados:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOmnibusOperativos = async () => {
        setLoading(true);
        setError(null); // Limpiar errores previos
        try {
            const response = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusOperativos(response.data || response || []);
            if ((response.data && response.data.length === 0) || (Array.isArray(response) && response.length === 0)) {
                console.info("No se encontraron ómnibus operativos.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al cargar ómnibus operativos.';
            setError(errorMessage);
            setOmnibusOperativos([]); // Asegurar que no haya datos viejos en caso de error
            console.error("Error en fetchOmnibusOperativos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchViajesProgramados();
        fetchOmnibusOperativos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        if (!selectedViajeId || !selectedOmnibusId) {
            setError('Por favor, seleccione un viaje y un nuevo ómnibus.');
            return;
        }

        setLoading(true);
        try {
            const response = await reasignarViaje(selectedViajeId, selectedOmnibusId);
            setSuccessMessage(`Viaje ID ${response.data.id} reasignado exitosamente al ómnibus con matrícula ${response.data.busMatricula}.`);
            // Opcional: Resetear selecciones o recargar datos
            setSelectedViajeId('');
            setSelectedOmnibusId('');
            fetchViajesProgramados(); // Recargar viajes
            fetchOmnibusOperativos(); // Recargar ómnibus (el estado de un ómnibus podría cambiar si se le asigna un viaje)
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al reasignar el viaje.';
            setError(errorMessage);
            console.error("Error en handleSubmit reasignarViaje:", err);
        } finally {
            setLoading(false);
        }
    };

    const selectedViajeInfo = viajesProgramados.find(v => v.id === parseInt(selectedViajeId));

    return (
        <div className="reasignar-viaje-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Reasignar Viaje a Otro Ómnibus</h2>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="viaje" style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Viaje a Reasignar (PROGRAMADO):</label>
                    <select
                        id="viaje"
                        value={selectedViajeId}
                        onChange={(e) => {
                            setSelectedViajeId(e.target.value);
                            setError(null);
                            setSuccessMessage('');
                        }}
                        required
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading}
                    >
                        <option value="">-- Seleccione un Viaje --</option>
                        {viajesProgramados.length === 0 && !loading && (
                            <option value="" disabled>No hay viajes programados disponibles</option>
                        )}
                        {viajesProgramados.map((viaje) => (
                            <option key={viaje.id} value={viaje.id}>
                                ID: {viaje.id} - {viaje.origenNombre} a {viaje.destinoNombre} ({viaje.fecha} {viaje.horaSalida}) - Bus Actual: {viaje.busMatricula || 'N/A'}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedViajeInfo && (
                    <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                        <h4>Información del Viaje Seleccionado:</h4>
                        <p><strong>ID:</strong> {selectedViajeInfo.id}</p>
                        <p><strong>Ruta:</strong> {selectedViajeInfo.origenNombre} → {selectedViajeInfo.destinoNombre}</p>
                        <p><strong>Fecha y Hora Partida:</strong> {selectedViajeInfo.fecha} {selectedViajeInfo.horaSalida}</p>
                        <p><strong>Ómnibus Actual:</strong> {selectedViajeInfo.busMatricula || 'No asignado'}</p>
                        <p><strong>Origen ID (para referencia):</strong> {selectedViajeInfo.origenId}</p> {/* Añadido para debug/info */}
                    </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="omnibus" style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Nuevo Ómnibus (OPERATIVO):</label>
                    <select
                        id="omnibus"
                        value={selectedOmnibusId}
                        onChange={(e) => {
                            setSelectedOmnibusId(e.target.value);
                            setError(null);
                            setSuccessMessage('');
                        }}
                        required
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading || !selectedViajeId}
                    >
                        <option value="">-- Seleccione un Nuevo Ómnibus --</option>
                        {omnibusOperativos.length === 0 && !loading && (
                            <option value="" disabled>No hay ómnibus operativos disponibles</option>
                        )}
                        {omnibusOperativos.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                Matrícula: {omnibus.matricula} - Capacidad: {omnibus.capacidadAsientos} - Localidad: {omnibus.localidadActual?.nombre || 'N/A'}
                            </option>
                        ))}
                    </select>
                    {selectedViajeInfo && omnibusOperativos.length > 0 &&
                        !omnibusOperativos.some(o => o.localidadActual?.id === selectedViajeInfo.origenId) &&
                        selectedOmnibusId && // Mostrar advertencia solo si un ómnibus está seleccionado
                        omnibusOperativos.find(o => o.id === parseInt(selectedOmnibusId))?.localidadActual?.id !== selectedViajeInfo.origenId && (
                            <p style={{color: 'orange', fontSize: '0.9em', marginTop: '5px'}}>
                                Advertencia: El ómnibus seleccionado ({omnibusOperativos.find(o => o.id === parseInt(selectedOmnibusId))?.matricula})
                                no parece estar en la localidad de origen del viaje ({selectedViajeInfo.origenNombre} - ID: {selectedViajeInfo.origenId}).
                                El backend debería validar esto.
                            </p>
                        )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedViajeId || !selectedOmnibusId}
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Reasignando...' : 'Reasignar Viaje'}
                </button>
            </form>
        </div>
    );
};

export default VendedorReasignarViaje;