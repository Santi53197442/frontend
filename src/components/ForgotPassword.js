// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api'; // Asumiendo que api.js está en src/services/
import './ForgotPasswordPage.css';

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
            const response = await apiClient.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar la solicitud. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <h2>Recuperar Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="tu@email.com"
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" className="login-link">Volver al Login</Link>
            </p>
        </div>
    );
}

export default ForgotPasswordPage;