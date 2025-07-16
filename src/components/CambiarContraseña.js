// src/components/CambiarContraseña.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api'; // Asegúrate que la ruta sea correcta
import './CambiarContraseña.css'; // Crearemos este archivo CSS

const CambiarContraseña = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            // El DTO esperado por el backend es { currentPassword, newPassword }
            const response = await changePassword({ currentPassword, newPassword });
            setMessage(response.data || 'Contraseña actualizada exitosamente.'); // Asume que el backend devuelve un mensaje en response.data
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            // Opcional: redirigir después de un tiempo o mostrar un botón para volver
            // setTimeout(() => navigate('/ruta-deseada'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error al cambiar la contraseña.';
            setError(errorMessage);
            console.error("Error al cambiar contraseña:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cambiar-contraseña-container">
            <h2>Cambiar Contraseña</h2>
            <form onSubmit={handleSubmit} className="cambiar-contraseña-form">
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <div className="form-group">
                    <label htmlFor="currentPassword">Contraseña actual:</label>
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">Nueva contraseña:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength="8"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirmar nueva contraseña:</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        minLength="8"
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
            </form>
        </div>
    );
};

export default CambiarContraseña;