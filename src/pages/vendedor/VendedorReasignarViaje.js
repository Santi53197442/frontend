// src/components/Vendedor/VendedorReasignarViaje.js
import React, { useState, useEffect } from 'react';
import {
    obtenerTodosLosViajes, // Necesitarás una función para obtener viajes (idealmente filtrados por PROGRAMADO)
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

    // --- Simulación de obtenerTodosLosViajes (deberías implementarla en apiService.js) ---
    // O mejor, una función como obtenerViajesPorEstado('PROGRAMADO')
    const fetchViajesProgramados = async () => {
        setLoading(true);
        try {
            // Idealmente, tu API debería tener un endpoint para obtener viajes por estado
            // Por ahora, si obtenerTodosLosViajes devuelve todos, filtramos aquí.
            // const response = await apiClient.get('/vendedor/viajes'); // Asume que existe este endpoint
            // setViajesProgramados(response.data.filter(v => v.estado === 'PROGRAMADO'));

            // ***** EJEMPLO SIMULADO *****
            // Esto es solo un ejemplo, necesitas un endpoint real en tu backend y apiService.js
            // Por ejemplo, si tu VendedorController tuviera un GET /api/vendedor/viajes/estado?estado=PROGRAMADO
            // const response = await apiClient.get('/vendedor/viajes/estado', { params: { estado: 'PROGRAMADO' } });
            // setViajesProgramados(response.data);

            // Como no tenemos un endpoint GET para viajes en el VendedorController,
            // esta parte es más compleja. Asumiremos que los viajes vienen de otro lado
            // o que se añade un endpoint.
            // Por ahora, lo dejaremos vacío para que se vea que falta algo.
            console.warn("Funcionalidad para obtener viajes programados no implementada completamente en el ejemplo.");
            // setViajesProgramados([]); // O carga datos de prueba
            setViajesProgramados([
                { id: 1, origenNombre: "Montevideo", destinoNombre: "Punta del Este", horaSalida: "10:00", fecha: "2024-06-01", busMatricula: "SAB1234", estado: "PROGRAMADO" },
                { id: 2, origenNombre: "Colonia", destinoNombre: "Montevideo", horaSalida: "14:30", fecha: "2024-06-01", busMatricula: "SCD5678", estado: "PROGRAMADO" },
            ]);


        } catch (err) {
            setError('Error al cargar viajes programados.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOmnibusOperativos = async () => {
        setLoading(true);
        try {
            const response = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusOperativos(response.data || []);
        } catch (err) {
            setError('Error al cargar ómnibus operativos.');
            console.error(err);
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
            fetchViajesProgramados(); // Recargar viajes por si el estado cambió
            fetchOmnibusOperativos(); // Recargar ómnibus por si el estado cambió
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
                    <label htmlFor="viaje" style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Viaje a Reasignar:</label>
                    <select
                        id="viaje"
                        value={selectedViajeId}
                        onChange={(e) => {
                            setSelectedViajeId(e.target.value);
                            setError(null); // Limpiar error al cambiar
                            setSuccessMessage(''); // Limpiar mensaje de éxito
                        }}
                        required
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading}
                    >
                        <option value="">-- Seleccione un Viaje --</option>
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
                    </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="omnibus" style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Nuevo Ómnibus (OPERATIVO):</label>
                    <select
                        id="omnibus"
                        value={selectedOmnibusId}
                        onChange={(e) => {
                            setSelectedOmnibusId(e.target.value);
                            setError(null); // Limpiar error al cambiar
                            setSuccessMessage('');
                        }}
                        required
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading || !selectedViajeId} // Deshabilitar si no hay viaje seleccionado
                    >
                        <option value="">-- Seleccione un Nuevo Ómnibus --</option>
                        {omnibusOperativos.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                Matrícula: {omnibus.matricula} - Capacidad: {omnibus.capacidadAsientos} - Localidad: {omnibus.localidadActual?.nombre || 'N/A'}
                            </option>
                        ))}
                    </select>
                    {selectedViajeInfo && !omnibusOperativos.some(o => o.localidadActual?.id === selectedViajeInfo.origenId) && omnibusOperativos.length > 0 &&
                        <p style={{color: 'orange', fontSize: '0.9em', marginTop: '5px'}}>
                            Advertencia: Asegúrese de que el ómnibus seleccionado esté en la localidad de origen del viaje ({selectedViajeInfo.origenNombre}). El backend validará esto.
                        </p>
                    }
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