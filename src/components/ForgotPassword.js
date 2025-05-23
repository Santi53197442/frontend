// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api'; // Usa tu apiClient configurado
// import './ForgotPassword.css'; // Si creas CSS específico

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.');
            setLoading(false);
            return;
        }
        try {
            // Endpoint: /auth/forgot-password
            const response = await apiClient.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar la solicitud. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>Recuperar Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '10px 15px' }}>
                    {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            <p style={{ marginTop: '20px' }}>
                <Link to="/login">Volver al Login</Link>
            </p>
        </div>
    );
}

export default ForgotPasswordPage;