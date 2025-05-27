// src/components/Vendedor/VendedorCambiarOmnibusaOperativo.js (versión sin antd)
import React, { useState, useEffect, useCallback } from 'react';
import { obtenerOmnibusPorEstado, marcarOmnibusOperativo } from '../../services/api'; // Ajusta la ruta

// Estilos básicos en línea (considera moverlos a un archivo CSS)
const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '24px', marginBottom: '10px' },
    text: { marginBottom: '20px', display: 'block' },
    alert: {
        padding: '10px',
        marginBottom: '20px',
        border: '1px solid transparent',
        borderRadius: '4px',
    },
    alertError: { color: '#a94442', backgroundColor: '#f2dede', borderColor: '#ebccd1' },
    alertSuccess: { color: '#3c763d', backgroundColor: '#dff0d8', borderColor: '#d6e9c6' },
    spinnerContainer: { textAlign: 'center', margin: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' },
    button: {
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    buttonDisabled: { backgroundColor: '#ccc', cursor: 'not-allowed' },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '300px',
        textAlign: 'center',
    },
    modalActions: { marginTop: '20px' }
};

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
            // const response = await marcarOmnibusOperativo(selectedOmnibus.id); // Quitamos la asignación
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
        return <div style={styles.spinnerContainer}><p>Cargando ómnibus inactivos...</p></div>;
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Marcar Ómnibus Inactivo como Operativo</h3>
            <p style={styles.text}>
                Aquí se listan los ómnibus que actualmente se encuentran en estado "{ESTADO_BUSQUEDA}".
                Seleccione un ómnibus para cambiar su estado a "OPERATIVO".
            </p>

            {error && (
                <div style={{ ...styles.alert, ...styles.alertError }}>
                    <strong>Error:</strong> {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}
            {successMessage && (
                <div style={{ ...styles.alert, ...styles.alertSuccess }}>
                    <strong>Éxito:</strong> {successMessage}
                    <button onClick={() => setSuccessMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {loading && omnibusInactivos.length > 0 && <p>Actualizando lista...</p>}

            {omnibusInactivos.length === 0 && !loading && <p>No hay ómnibus en estado INACTIVO.</p>}

            {omnibusInactivos.length > 0 && (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Matrícula</th>
                        <th style={styles.th}>Marca</th>
                        <th style={styles.th}>Modelo</th>
                        <th style={styles.th}>Capacidad</th>
                        <th style={styles.th}>Localidad Actual</th>
                        <th style={styles.th}>Estado Actual</th>
                        <th style={styles.th}>Acción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {omnibusInactivos.map((omnibus) => (
                        <tr key={omnibus.id}>
                            <td style={styles.td}>{omnibus.id}</td>
                            <td style={styles.td}>{omnibus.matricula}</td>
                            <td style={styles.td}>{omnibus.marca}</td>
                            <td style={styles.td}>{omnibus.modelo}</td>
                            <td style={styles.td}>{omnibus.capacidadAsientos}</td>
                            <td style={styles.td}>
                                {omnibus.localidadActual?.nombre || 'N/A'}
                                {omnibus.localidadActual?.departamento ? ` (${omnibus.localidadActual.departamento})` : ''}
                            </td>
                            <td style={{ ...styles.td, color: omnibus.estado === 'INACTIVO' ? 'red' : 'inherit' }}>
                                {omnibus.estado}
                            </td>
                            <td style={styles.td}>
                                <button
                                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
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
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h4>Confirmar Acción</h4>
                        <p>
                            ¿Está seguro de que desea marcar el ómnibus con matrícula <strong>{selectedOmnibus.matricula}</strong> (ID: {selectedOmnibus.id}) como <strong>OPERATIVO</strong>?
                        </p>
                        <p>Estado actual: <span style={{ color: 'red' }}>{selectedOmnibus.estado}</span></p>
                        <div style={styles.modalActions}>
                            <button
                                style={loading ? { ...styles.button, ...styles.buttonDisabled, marginRight: '10px' } : { ...styles.button, marginRight: '10px' }}
                                onClick={handleConfirmMarcarOperativo}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : 'Confirmar'}
                            </Button>
                            <button
                                style={{...styles.button, backgroundColor: '#6c757d'}}
                                onClick={handleCancelModal}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendedorCambiarOmnibusaOperativo;