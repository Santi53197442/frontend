// src/pages/admin/AdminUserBatchUploadPage.js
import React, { useState } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta si api.js está en una ubicación diferente

// Opcional: Si quieres añadir estilos específicos para esta página
// import './AdminUserBatchUploadPage.css';

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
            // La ruta es relativa a apiClient.defaults.baseURL (que ahora es https://.../api)
            // Esta llamada irá a: https://web-production-2443c.up.railway.app/api/admin/create-privileged-batch
            const response = await apiClient.post('/admin/create-privileged-batch', formData);
            setUploadResponse(response.data);
        } catch (err) {
            console.error("Error en la subida:", err.response || err); // Muestra el error completo de Axios
            let errorMessage = 'Ocurrió un error desconocido durante la subida.';
            if (err.response && err.response.data) {
                // Si el backend devuelve un objeto con detalles de la carga (incluso en error)
                if (err.response.data.failureDetails || err.response.data.totalProcessed !== undefined) {
                    setUploadResponse(err.response.data); // Muestra los resultados parciales si los hay
                    errorMessage = err.response.data.message || "Error en el procesamiento por lotes."; // Mensaje general del error
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

    // Estilos (puedes moverlos a un archivo .css si prefieres)
    const pageContainerStyle = { padding: '20px' };
    const containerStyle = { marginTop: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' };
    const inputStyle = { display: 'block', marginBottom: '15px' };
    const buttonStyle = { marginLeft: '10px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' };
    const errorStyle = { color: 'red', marginTop: '10px', whiteSpace: 'pre-line' };
    const resultsStyle = { marginTop: '20px', border: '1px dashed #ccc', padding: '15px', backgroundColor: '#fff' };
    const listStyle = { maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', listStyleType: 'none', margin: 0 };
    const errorListStyle = { ...listStyle, border: '1px solid #f00' };
    const listItemStyle = { borderBottom: '1px solid #eee', padding: '5px 0' };


    return (
        <div style={pageContainerStyle}>
            <h2>Carga Masiva de Usuarios Privilegiados</h2>
            <div style={containerStyle}>
                <p>
                    Asegúrate de que el CSV tenga las siguientes columnas (con encabezado en la primera fila):<br />
                    <code>nombre,apellido,ci,contrasenia,email,telefono,fechaNac,tipoRolACrear,areaResponsabilidad,codigoVendedor</code><br/>
                    <small><code>areaResponsabilidad</code> es para ADMINISTRADOR, <code>codigoVendedor</code> para VENDEDOR. Deja la celda vacía si no aplica.</small>
                </p>
                <input type="file" accept=".csv" onChange={handleFileChange} disabled={isLoading} style={inputStyle} />
                <button onClick={handleUpload} disabled={!selectedFile || isLoading} style={buttonStyle}>
                    {isLoading ? 'Subiendo...' : 'Subir Archivo CSV'}
                </button>

                {error && !uploadResponse?.failureDetails && <p style={errorStyle}>{error}</p>} {/* Solo muestra error general si no hay detalles de fallo */}


                {uploadResponse && (
                    <div style={resultsStyle}>
                        <h4>Resultados de la Carga:</h4>
                        <p><strong>Total de Filas Procesadas:</strong> {uploadResponse.totalProcessed ?? 'N/A'}</p>
                        <p><strong>Creaciones Exitosas:</strong> {uploadResponse.successfulCreations ?? 'N/A'}</p>
                        <p><strong>Creaciones Fallidas:</strong> {uploadResponse.failedCreations ?? 'N/A'}</p>
                        {/* Muestra el error general del backend si existe y hay detalles de fallos */}
                        {error && uploadResponse.failureDetails && <p style={errorStyle}>{error}</p>}


                        {uploadResponse.successDetails && uploadResponse.successDetails.length > 0 && (
                            <div>
                                <h5>Detalles Exitosos ({uploadResponse.successDetails.length}):</h5>
                                <ul style={listStyle}>
                                    {uploadResponse.successDetails.map((msg, index) => (
                                        <li key={`success-${index}`} style={listItemStyle}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {uploadResponse.failureDetails && uploadResponse.failureDetails.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                                <h5>Detalles de Fallos ({uploadResponse.failureDetails.length}):</h5>
                                <ul style={errorListStyle}>
                                    {uploadResponse.failureDetails.map((fail, index) => (
                                        <li key={`fail-${index}`} style={listItemStyle}>
                                            <strong>Fila CSV (aprox.): {fail.row}</strong><br />
                                            Email: {fail.email || 'N/A'}<br />
                                            Error: {fail.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUserBatchUploadPage;