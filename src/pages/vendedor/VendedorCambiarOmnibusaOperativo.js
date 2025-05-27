// src/pages/vendedor/VendedorCambiarOmnibusaOperativo.js
import React, { useState, useEffect, useCallback } from 'react';
import { obtenerOmnibusPorEstado, marcarOmnibusOperativo } from '../../services/api'; // Ajusta la ruta
import './VendedorCambiarOmnibusaOperativo.css'; // Importa el archivo CSS

const ESTADO_BUSQUEDA = "INACTIVO";

const VendedorCambiarOmnibusaOperativo = () => {
    const [omnibusInactivos, setOmnibusInactivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedOmnibus, setSelectedOmnibus] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchOmnibusInactivos = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            const response = await obtenerOmnibusPorEstado(ESTADO_BUSQUEDA);
            if (response.status === 204) {
                setOmnibusInactivos([]);
            } else if (response.data) {
                setOmnibusInactivos(response.data);
            } else {
                setOmnibusInactivos([]);
            }
        } catch (err) {
            console.error("Error al cargar ómnibus inactivos:", err);
            setError(err.response?.data?.message || "No se pudieron cargar los ómnibus inactivos. Intente más tarde.");
            setOmnibusInactivos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOmnibusInactivos();
    }, [fetchOmnibusInactivos]);

    const handleMarcarOperativoClick = (omnibus) => {
        setSelectedOmnibus(omnibus);
        setIsModalVisible(true);
    };

    const handleConfirmMarcarOperativo = async () => {
        if (!selectedOmnibus) return;
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        setIsModalVisible(false);
        try {
            await marcarOmnibusOperativo(selectedOmnibus.id);
            setSuccessMessage(`El ómnibus con matrícula ${selectedOmnibus.matricula} (ID: ${selectedOmnibus.id}) ha sido marcado como OPERATIVO exitosamente.`);
            setSelectedOmnibus(null);
            fetchOmnibusInactivos();
        } catch (err) {
            console.error("Error al marcar ómnibus como operativo:", err);
            setError(err.response?.data?.message || `No se pudo marcar el ómnibus ${selectedOmnibus.matricula} como operativo.`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setSelectedOmnibus(null);
    };

    if (loading && !omnibusInactivos.length && !error && !successMessage) {
        return <div className="spinner-container"><p>Cargando ómnibus inactivos...</p></div>;
    }

    return (
        <div className="vceo-container"> {/* vceo: VendedorCambiarEstadoOmnibus */}
            <h3 className="vceo-title">Marcar Ómnibus Inactivo como Operativo</h3>
            <p className="vceo-text">
                Aquí se listan los ómnibus que actualmente se encuentran en estado "{ESTADO_BUSQUEDA}".
                Seleccione un ómnibus para cambiar su estado a "OPERATIVO".
            </p>

            {error && (
                <div className="vceo-alert vceo-alert-error">
                    <strong>Error:</strong> {error}
                    <button onClick={() => setError(null)} className="vceo-alert-close">×</button>
                </div>
            )}
            {successMessage && (
                <div className="vceo-alert vceo-alert-success">
                    <strong>Éxito:</strong> {successMessage}
                    <button onClick={() => setSuccessMessage('')} className="vceo-alert-close">×</button>
                </div>
            )}

            {loading && omnibusInactivos.length > 0 && <p className="vceo-loading-update">Actualizando lista...</p>}

            {omnibusInactivos.length === 0 && !loading && <p className="vceo-empty-message">No hay ómnibus en estado INACTIVO.</p>}

            {omnibusInactivos.length > 0 && (
                <table className="vceo-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Matrícula</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Capacidad</th>
                        <th>Localidad Actual</th>
                        <th>Estado Actual</th>
                        <th>Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {omnibusInactivos.map((omnibus) => (
                        <tr key={omnibus.id}>
                            <td>{omnibus.id}</td>
                            <td>{omnibus.matricula}</td>
                            <td>{omnibus.marca}</td>
                            <td>{omnibus.modelo}</td>
                            <td>{omnibus.capacidadAsientos}</td>
                            <td>
                                {omnibus.localidadActual?.nombre || 'N/A'}
                                {omnibus.localidadActual?.departamento ? ` (${omnibus.localidadActual.departamento})` : ''}
                            </td>
                            <td className={omnibus.estado === 'INACTIVO' ? 'vceo-estado-inactivo' : ''}>
                                {omnibus.estado}
                            </td>
                            <td>
                                <button
                                    className={`vceo-button ${loading ? 'vceo-button-disabled' : ''}`}
                                    onClick={() => handleMarcarOperativoClick(omnibus)}
                                    disabled={loading}
                                >
                                    Marcar Operativo
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {isModalVisible && selectedOmnibus && (
                <div className="vceo-modal-overlay">
                    <div className="vceo-modal-content">
                        <h4>Confirmar Acción</h4>
                        <p>
                            ¿Está seguro de que desea marcar el ómnibus con matrícula <strong>{selectedOmnibus.matricula}</strong> (ID: {selectedOmnibus.id}) como <strong>OPERATIVO</strong>?
                        </p>
                        <p>Estado actual: <span className="vceo-estado-inactivo">{selectedOmnibus.estado}</span></p>
                        <div className="vceo-modal-actions">
                            <button
                                className={`vceo-button ${loading ? 'vceo-button-disabled' : ''}`}
                                onClick={handleConfirmMarcarOperativo}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Confirmar'}
                            </button>
                            <button
                                className="vceo-button vceo-button-cancel"
                                onClick={handleCancelModal}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendedorCambiarOmnibusaOperativo;