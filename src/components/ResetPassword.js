// src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; // Usa tu apiClient configurado
// import './ResetPassword.css'; // Si creas CSS específico

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token no encontrado o inválido. Por favor, usa el enlace de tu correo.');
            // Opcionalmente, redirigir si no hay token y no se está cargando nada
            // setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
    }, [location, navigate]);

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
            // Endpoint: /auth/reset-password
            const response = await apiClient.post('/auth/reset-password', {
                token,
                newPassword: password,
            });
            setMessage(response.data.message + " Serás redirigido al login en 3 segundos.");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    // Renderizado condicional inicial
    if (!location.search && !token && !error) { // Si no hay query params, no hay token y no hay error, probablemente la URL está mal
        return (
            <div className="reset-password-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
                <p style={{ color: 'red' }}>Enlace inválido. Falta el token de restablecimiento.</p>
            </div>
        );
    }
    if (!token && !error && location.search) { // Si hay query params pero el token aún no se ha seteado (esperando useEffect)
        return (
            <div className="reset-password-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
                <p>Verificando token...</p>
            </div>
        );
    }


    return (
        <div className="reset-password-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>Restablecer Contraseña</h2>
            {error && !token && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar error si el token no se pudo obtener */}
            {token && ( // Solo mostrar el formulario si tenemos un token
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="password">Nueva Contraseña:</label>
                        <input
                            type="password" id="password" value={password}
                            onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
                        <input
                            type="password" id="confirmPassword" value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{ padding: '10px 15px' }}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </form>
            )}
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && token && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>} {/* Mostrar error de submit si hay token */}
        </div>
    );
}

export default ResetPasswordPage;