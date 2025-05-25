// src/pages/vendedor/VendedorLocalidadMasivo.js
import React, { useState, useRef } from 'react';
import './VendedorLocalidadMasivo.css'; // <--- CAMBIO AQUÍ
import { crearLocalidadesBatch } from '../../services/api';


const VendedorLocalidadMasivo = () => {
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
            const response = await crearLocalidadesBatch(selectedFile);
            setUploadResult(response.data);
        } catch (error) {
            let errorMessage = "Error al procesar el archivo CSV.";
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

    // El JSX del return permanece igual, solo las clases CSS si las cambiaste
    // en el archivo VendedorLocalidadMasivo.css.
    // Las clases principales como "batch-upload-page-container" y "form-card"
    // pueden mantenerse si los estilos en VendedorLocalidadMasivo.css las usan.
    return (
        <div className="localidad-masivo-page-container"> {/* Podrías cambiar esta clase si quieres */}
            <div className="form-card">
                <h2 className="form-title">Carga Masiva de Localidades (CSV)</h2>
                <p className="upload-instructions">
                    Sube un archivo CSV con las columnas: <strong>nombre, departamento, direccion</strong>.
                    La primera fila debe contener estas cabeceras.
                </p>

                <form onSubmit={handleSubmit} className="localidad-masivo-form"> {/* Podrías cambiar esta clase */}
                    <div className="form-group file-input-group">
                        <label htmlFor="csv-file-localidades" className="file-input-label">
                            {selectedFile ? selectedFile.name : "Seleccionar archivo CSV..."}
                        </label>
                        <input
                            type="file"
                            id="csv-file-localidades"
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
                            'Procesar Archivo'
                        )}
                    </button>
                </form>

                {uploadResult && (
                    <div className="upload-results-container">
                        <h3>Resultados de la Carga Masiva</h3>
                        {uploadResult.error && (
                            <div className="message error-message api-error">{uploadResult.error}</div>
                        )}

                        {!uploadResult.error && (
                            <>
                                <p><strong>Total de filas de datos procesadas:</strong> {uploadResult.totalDataRowsProcessed ?? 0}</p>
                                <p className="success-count"><strong>Creadas exitosamente:</strong> {uploadResult.successfulCreations ?? 0}</p>
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
                                                <li key={`failure-${index}`} className="failure-detail">
                                                    Fila {err.row}: {err.nombreLocalidad} - Error: {err.error}
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

export default VendedorLocalidadMasivo;