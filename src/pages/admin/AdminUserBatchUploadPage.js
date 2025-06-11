// src/pages/admin/AdminUserBatchUploadPage.js
import React, { useState } from 'react';
import apiClient from '../../services/api';
import './AdminUserBatchUploadPage.css'; // Importamos el nuevo archivo CSS

function AdminUserBatchUploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResponse, setUploadResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "text/csv" || file.name.endsWith(".csv")) {
                setSelectedFile(file);
                setError('');
                setUploadResponse(null);
            } else {
                setSelectedFile(null);
                setError('Por favor, selecciona un archivo CSV válido.');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo primero.');
            return;
        }

        setIsLoading(true);
        setError('');
        setUploadResponse(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await apiClient.post('/admin/create-privileged-batch', formData);
            setUploadResponse(response.data);
        } catch (err) {
            console.error("Error en la subida:", err.response || err);
            let errorMessage = 'Ocurrió un error desconocido durante la subida.';
            if (err.response && err.response.data) {
                if (err.response.data.failureDetails || err.response.data.totalProcessed !== undefined) {
                    setUploadResponse(err.response.data);
                    errorMessage = err.response.data.message || "Error en el procesamiento por lotes.";
                } else {
                    errorMessage = err.response.data.message || JSON.stringify(err.response.data);
                }
            } else if (err.message) {
                errorMessage = `Error de red o servidor: ${err.message}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="batch-upload-page-container">
            <h2>Carga Masiva de Usuarios Privilegiados</h2>

            <div className="upload-instructions">
                <p>
                    Asegúrate de que tu archivo <strong>CSV</strong> tenga los siguientes encabezados en la primera fila:
                </p>
                <code>nombre,apellido,ci,contrasenia,email,telefono,fechaNac,tipoRolACrear,areaResponsabilidad,codigoVendedor</code>
                <small>
                    <code>areaResponsabilidad</code> es para ADMINISTRADOR. <code>codigoVendedor</code> es para VENDEDOR. Deja la celda vacía si no aplica.
                </small>
            </div>

            <div className="upload-area">
                <div className="form-group">
                    <label htmlFor="csv-upload-input">Seleccionar archivo CSV</label>
                    <input
                        id="csv-upload-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="upload-button"
                >
                    {isLoading ? 'Subiendo...' : 'Subir y Procesar Archivo'}
                </button>
            </div>

            {/* Mensaje de error general (solo si no hay resultados detallados) */}
            {error && !uploadResponse?.failureDetails && <p className="form-error-message">{error}</p>}

            {/* Contenedor de resultados */}
            {uploadResponse && (
                <div className="upload-results">
                    <h4>Resultados de la Carga</h4>

                    {/* Mensaje de error específico del proceso por lotes */}
                    {error && uploadResponse.failureDetails && <p className="form-error-message">{error}</p>}

                    <div className="results-summary">
                        <p><strong>Total de Filas Procesadas:</strong> {uploadResponse.totalProcessed ?? 'N/A'}</p>
                        <p><strong>Creaciones Exitosas:</strong> {uploadResponse.successfulCreations ?? 'N/A'}</p>
                        <p><strong>Creaciones Fallidas:</strong> {uploadResponse.failedCreations ?? 'N/A'}</p>
                    </div>

                    {uploadResponse.successDetails?.length > 0 && (
                        <div className="results-details-section">
                            <h5>Detalles Exitosos ({uploadResponse.successDetails.length})</h5>
                            <ul className="details-list success-details">
                                {uploadResponse.successDetails.map((msg, index) => (
                                    <li key={`success-${index}`}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {uploadResponse.failureDetails?.length > 0 && (
                        <div className="results-details-section">
                            <h5>Detalles de Fallos ({uploadResponse.failureDetails.length})</h5>
                            <ul className="details-list failure-details">
                                {uploadResponse.failureDetails.map((fail, index) => (
                                    <li key={`fail-${index}`}>
                                        <strong>Fila CSV (aprox.): {fail.row}</strong>
                                        <span>Email: {fail.email || 'N/A'}</span>
                                        <span>Error: {fail.error}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminUserBatchUploadPage;