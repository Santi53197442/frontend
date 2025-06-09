// src/pages/vendedor/VendedorGestionDevolucionesPage.js

import React, { useState } from 'react';
// Asumimos que las funciones de API se crearán en el siguiente paso
import { buscarPasajeParaDevolucion, procesarDevolucionPasaje } from '../../services/api'; 
import './VendedorGestionDevoluciones.css'; // Crearemos este archivo CSS

const VendedorGestionDevolucionesPage = () => {
    const [pasajeIdInput, setPasajeIdInput] = useState('');
    const [pasajeEncontrado, setPasajeEncontrado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleBuscarPasaje = async (e) => {
        e.preventDefault();
        if (!pasajeIdInput.trim()) {
            setError('Por favor, ingrese un ID de pasaje.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        setPasajeEncontrado(null);
        try {
            // Usamos la nueva función del API service
            const response = await buscarPasajeParaDevolucion(pasajeIdInput);
            setPasajeEncontrado(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'No se encontró el pasaje o ocurrió un error.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmarDevolucion = async () => {
        if (!pasajeEncontrado) return;

        const montoReembolso = (pasajeEncontrado.precio - (pasajeEncontrado.precio * 0.10)).toFixed(2);
        const confirmacion = window.confirm(
            `¿Está seguro que desea procesar la devolución de este pasaje?\n\n` +
            `- Cliente: ${pasajeEncontrado.clienteNombre}\n` +
            `- Viaje: ${pasajeEncontrado.origenViaje} -> ${pasajeEncontrado.destinoViaje}\n` +
            `- Monto a reembolsar: $${montoReembolso}\n\n` +
            `Esta acción es irreversible y realizará un reembolso a través de PayPal.`
        );

        if (!confirmacion) return;

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Usamos la nueva función del API service
            const response = await procesarDevolucionPasaje(pasajeEncontrado.id);
            setSuccessMessage(response.data.message);
            setPasajeEncontrado(null); 
            setPasajeIdInput('');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'El proceso de devolución falló.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-panel-container">
            <h2>Gestión de Devoluciones de Pasajes</h2>

            <form onSubmit={handleBuscarPasaje} className="search-form">
                <div className="form-group">
                    <label htmlFor="pasajeId">Buscar Pasaje por ID:</label>
                    <input
                        id="pasajeId"
                        type="number"
                        value={pasajeIdInput}
                        onChange={(e) => setPasajeIdInput(e.target.value)}
                        placeholder="Ingrese el ID numérico del pasaje"
                    />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Buscando...' : 'Buscar Pasaje'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {pasajeEncontrado && (
                <div className="details-card">
                    <h3>Detalles del Pasaje a Devolver</h3>
                    <p><strong>ID Pasaje:</strong> {pasajeEncontrado.id}</p>
                    <p><strong>Cliente:</strong> {pasajeEncontrado.clienteNombre} (Email: {pasajeEncontrado.clienteEmail})</p>
                    <p><strong>Viaje:</strong> {pasajeEncontrado.origenViaje} → {pasajeEncontrado.destinoViaje}</p>
                    <p><strong>Fecha Salida:</strong> {new Date(pasajeEncontrado.fechaViaje + 'T' + pasajeEncontrado.horaSalidaViaje).toLocaleString()}</p>
                    <p><strong>Precio Pagado:</strong> ${pasajeEncontrado.precio.toFixed(2)}</p>
                    <p><strong>Estado Actual:</strong> <span className={`status-${pasajeEncontrado.estado.toLowerCase()}`}>{pasajeEncontrado.estado}</span></p>
                    
                    {pasajeEncontrado.estado === 'VENDIDO' ? (
                        <div className="devolucion-calculo">
                            <h4>Cálculo del Reembolso</h4>
                            <p>Penalización (10%): -${(pasajeEncontrado.precio * 0.10).toFixed(2)}</p>
                            <p><strong>Monto a Reembolsar: ${(pasajeEncontrado.precio * 0.90).toFixed(2)}</strong></p>
                            <button onClick={handleConfirmarDevolucion} disabled={loading} className="btn-danger">
                                {loading ? 'Procesando Reembolso...' : 'Confirmar y Reembolsar'}
                            </button>
                        </div>
                    ) : (
                        <p className="warning-message">
                            <strong>Este pasaje no se puede devolver.</strong>
                            <br />
                            Motivo: El pasaje no está en estado 'VENDIDO'.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VendedorGestionDevolucionesPage;
