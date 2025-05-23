// src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [tokenValid, setTokenValid] = useState(null); // null: no verificado, true: válido, false: inválido

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setTokenValid(true); // Asumimos válido inicialmente hasta que el submit falle por token
        } else {
            setError('Token no encontrado o inválido. Por favor, usa el enlace de tu correo.');
            setTokenValid(false);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (!token) {
            setError('Token inválido o faltante. No se puede restablecer la contraseña.');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/auth/reset-password', {
                token,
                newPassword: password,
            });
            setMessage(response.data.message + " Serás redirigido al login en 3 segundos.");
            setTokenValid(true); // Marcamos como válido si el reset es exitoso
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.');
            setTokenValid(false); // Marcamos como inválido si el backend rechaza el token
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === null && location.search) { // Cargando o verificando token si hay query params
        return (
            <div className="reset-password-container">
                <p className="status-message">Verificando token...</p>
            </div>
        );
    }

    if (tokenValid === false) { // Si el token es explícitamente inválido (por falta de token en URL o por error del backend)
        return (
            <div className="reset-password-container">
                <h2 style={{ color: '#c0392b' }}>Enlace Inválido</h2>
                <p className="error-message">{error || 'El enlace de restablecimiento no es válido o ha expirado.'}</p>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/forgot-password" className="action-link">Solicitar nuevo enlace</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '10px' }}>
                    <Link to="/login" className="action-link">Volver al Login</Link>
                </p>
            </div>
        );
    }


    return (
        <div className="reset-password-container">
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="password">Nueva Contraseña:</label>
                    <input
                        type="password" id="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                        placeholder="Ingresa tu nueva contraseña"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
                    <input
                        type="password" id="confirmPassword" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"
                        placeholder="Confirma tu nueva contraseña"
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default ResetPasswordPage;