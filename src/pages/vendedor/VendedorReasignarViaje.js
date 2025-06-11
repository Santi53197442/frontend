// src/components/Vendedor/VendedorReasignarViaje.js
import React, { useState, useEffect } from 'react';
import {
    obtenerViajesPorEstado,
    obtenerOmnibusPorEstado,
    reasignarViaje
} from '../../services/api';
import './VendedorReasignarViaje.css'; // Importamos el nuevo archivo CSS

const VendedorReasignarViaje = () => {
    const [viajesProgramados, setViajesProgramados] = useState([]);
    const [omnibusOperativos, setOmnibusOperativos] = useState([]);
    const [selectedViajeId, setSelectedViajeId] = useState('');
    const [selectedOmnibusId, setSelectedOmnibusId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchViajesProgramados = async () => {
        setLoading(true); setError(null);
        try {
            const response = await obtenerViajesPorEstado('PROGRAMADO');
            setViajesProgramados(response.data || response || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar viajes programados.');
            setViajesProgramados([]);
        } finally { setLoading(false); }
    };

    const fetchOmnibusOperativos = async () => {
        setLoading(true); setError(null);
        try {
            const response = await obtenerOmnibusPorEstado('OPERATIVO');
            setOmnibusOperativos(response.data || response || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar ómnibus operativos.');
            setOmnibusOperativos([]);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchViajesProgramados();
        fetchOmnibusOperativos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMessage('');

        if (!selectedViajeId || !selectedOmnibusId) {
            setError('Por favor, seleccione un viaje y un nuevo ómnibus.');
            return;
        }

        setLoading(true);
        try {
            const response = await reasignarViaje(selectedViajeId, selectedOmnibusId);
            setSuccessMessage(`Viaje ID ${response.data.id} reasignado exitosamente al ómnibus con matrícula ${response.data.busMatricula}.`);
            setSelectedViajeId('');
            setSelectedOmnibusId('');
            fetchViajesProgramados();
            fetchOmnibusOperativos();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al reasignar el viaje.');
        } finally { setLoading(false); }
    };

    const selectedViajeInfo = viajesProgramados.find(v => v.id === parseInt(selectedViajeId));
    const selectedOmnibusInfo = omnibusOperativos.find(o => o.id === parseInt(selectedOmnibusId));
    const showWarning = selectedViajeInfo && selectedOmnibusInfo && selectedOmnibusInfo.localidadActual?.id !== selectedViajeInfo.origenId;

    return (
        <div className="reasignar-container">
            <h2 className="reasignar-title">Reasignar Ómnibus a un Viaje</h2>

            <div className="messages-container">
                {error && <p className="message-error">{error}</p>}
                {successMessage && <p className="message-success">{successMessage}</p>}
            </div>

            <form onSubmit={handleSubmit} className="reasignar-form">
                <div className="form-group">
                    <label htmlFor="viaje">1. Seleccione el Viaje a Reasignar</label>
                    <select id="viaje" value={selectedViajeId} onChange={(e) => setSelectedViajeId(e.target.value)} required disabled={loading}>
                        <option value="">-- Seleccione un Viaje --</option>
                        {viajesProgramados.map((viaje) => (
                            <option key={viaje.id} value={viaje.id}>
                                ID: {viaje.id} | {viaje.origenNombre} → {viaje.destinoNombre} ({viaje.fecha})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedViajeInfo && (
                    <div className="info-panel">
                        <h4>Información del Viaje</h4>
                        <p><strong>Ruta:</strong> {selectedViajeInfo.origenNombre} → {selectedViajeInfo.destinoNombre}</p>
                        <p><strong>Fecha y Hora:</strong> {selectedViajeInfo.fecha} {selectedViajeInfo.horaSalida}</p>
                        <p><strong>Ómnibus Actual:</strong> {selectedViajeInfo.busMatricula || 'No asignado'}</p>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="omnibus">2. Seleccione el Nuevo Ómnibus</label>
                    <select id="omnibus" value={selectedOmnibusId} onChange={(e) => setSelectedOmnibusId(e.target.value)} required disabled={loading || !selectedViajeId}>
                        <option value="">-- Seleccione un Ómnibus Operativo --</option>
                        {omnibusOperativos.map((omnibus) => (
                            <option key={omnibus.id} value={omnibus.id}>
                                Matrícula: {omnibus.matricula} | Capacidad: {omnibus.capacidadAsientos} | En: {omnibus.localidadActual?.nombre || 'N/A'}
                            </option>
                        ))}
                    </select>
                    {showWarning && (
                        <p className="message-warning">
                            Advertencia: El ómnibus seleccionado ({selectedOmnibusInfo.matricula}) no se encuentra en la localidad de origen del viaje ({selectedViajeInfo.origenNombre}).
                        </p>
                    )}
                </div>

                <button type="submit" className="submit-button" disabled={loading || !selectedViajeId || !selectedOmnibusId}>
                    {loading ? 'Reasignando...' : 'Confirmar Reasignación'}
                </button>
            </form>
        </div>
    );
};

export default VendedorReasignarViaje;