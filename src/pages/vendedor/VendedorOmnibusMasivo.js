// src/pages/vendedor/VendedorOmnibusMasivo.js
import React, { useState, useRef } from 'react';
import './VendedorOmnibusMasivo.css'; // Asegúrate de crear este archivo CSS
import { crearOmnibusBatch } from '../../services/api'; // Verifica la ruta a tu api.js

const VendedorOmnibusMasivo = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [previewError, setPreviewError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setPreviewError('');
        setUploadResult(null);

        if (file) {
            if (file.type === "text/csv" || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                setSelectedFile(null);
                setPreviewError("Por favor, selecciona un archivo CSV válido.");
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setPreviewError("Por favor, selecciona un archivo CSV para subir.");
            return;
        }

        setIsUploading(true);
        setUploadResult(null);
        setPreviewError('');

        try {
            const response = await crearOmnibusBatch(selectedFile); // Llama a la nueva función de API
            setUploadResult(response.data);
        } catch (error) {
            let errorMessage = "Error al procesar el archivo CSV de ómnibus.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setUploadResult({ error: errorMessage });
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="omnibus-masivo-page-container"> {/* Clase renombrada */}
            <div className="form-card">
                <h2 className="form-title">Carga Masiva de Ómnibus (CSV)</h2>
                <p className="upload-instructions">
                    Sube un archivo CSV con las columnas: <strong>matricula, marca, modelo, capacidadAsientos, estado, localidadActualId</strong>.
                    <br />
                    La primera fila debe contener estas cabeceras.
                    <br />
                    Valores para 'estado': OPERATIVO, EN_MANTENIMIENTO, FUERA_DE_SERVICIO, ASIGNADO_A_VIAJE.
                </p>

                <form onSubmit={handleSubmit} className="omnibus-masivo-form"> {/* Clase renombrada */}
                    <div className="form-group file-input-group">
                        <label htmlFor="csv-file-omnibus" className="file-input-label">
                            {selectedFile ? selectedFile.name : "Seleccionar archivo CSV de Ómnibus..."}
                        </label>
                        <input
                            type="file"
                            id="csv-file-omnibus" // ID cambiado para ómnibus
                            accept=".csv, text/csv"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            ref={fileInputRef}
                            className="file-input-hidden"
                        />
                    </div>
                    {previewError && <div className="message error-message preview-error">{previewError}</div>}

                    <button type="submit" className="submit-button" disabled={!selectedFile || isUploading}>
                        {isUploading ? (
                            <>
                                <span className="spinner" /> Subiendo y Procesando...
                            </>
                        ) : (
                            'Procesar Archivo de Ómnibus'
                        )}
                    </button>
                </form>

                {uploadResult && (
                    <div className="upload-results-container">
                        <h3>Resultados de la Carga Masiva de Ómnibus</h3>
                        {uploadResult.error && (
                            <div className="message error-message api-error">{uploadResult.error}</div>
                        )}

                        {!uploadResult.error && (
                            <>
                                <p><strong>Total de filas de datos procesadas:</strong> {uploadResult.totalDataRowsProcessed ?? 0}</p>
                                <p className="success-count"><strong>Creados exitosamente:</strong> {uploadResult.successfulCreations ?? 0}</p>
                                <p className="failure-count"><strong>Fallaron:</strong> {uploadResult.failedCreations ?? 0}</p>

                                {uploadResult.message && <p><em>{uploadResult.message}</em></p>}

                                {uploadResult.successDetails && uploadResult.successDetails.length > 0 && (
                                    <div className="details-section">
                                        <h4>Detalles de Éxitos:</h4>
                                        <ul>
                                            {uploadResult.successDetails.map((msg, index) => (
                                                <li key={`success-${index}`} className="success-detail">{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {uploadResult.failureDetails && uploadResult.failureDetails.length > 0 && (
                                    <div className="details-section">
                                        <h4>Detalles de Fallos:</h4>
                                        <ul className="failure-list">
                                            {uploadResult.failureDetails.map((err, index) => (
                                                // Ajustado para mostrar 'matricula' en lugar de 'nombreLocalidad'
                                                <li key={`failure-${index}`} className="failure-detail">
                                                    Fila {err.row}: Matrícula '{err.matricula || "N/A"}' - Error: {err.error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorOmnibusMasivo;