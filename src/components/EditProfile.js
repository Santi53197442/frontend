// src/components/EditProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import apiClient from '../services/api';
import './EditProfile.css';

const EditProfile = () => {
    const { user, updateUserContext, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        ci: '',
        email: '',
        telefono: '',
        fechaNac: '' // Espera YYYY-MM-DD
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !user) {
                navigate('/login');
            } else {
                // Cargar datos del usuario en el formulario
                // Los datos del 'user' en AuthContext ya deberían estar formateados si es necesario
                setFormData({
                    nombre: user.nombre || '',
                    apellido: user.apellido || '',
                    ci: user.ci || '', // user.ci ya es string desde AuthContext
                    email: user.email || '',
                    telefono: user.telefono || '', // user.telefono ya es string desde AuthContext
                    fechaNac: user.fechaNac || '' // user.fechaNac ya es string YYYY-MM-DD desde AuthContext
                });
            }
        }
    }, [user, isAuthenticated, authLoading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (formData.ci && (isNaN(parseInt(formData.ci)) || String(formData.ci).length < 7 || String(formData.ci).length > 8) ) {
            setError("CI debe ser un número de 7 u 8 dígitos.");
            setIsLoading(false);
            return;
        }
        if (formData.telefono && isNaN(parseInt(formData.telefono))) {
            setError("Teléfono debe ser un número.");
            setIsLoading(false);
            return;
        }

        // El payload para UpdateUserDTO del backend
        const payload = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            ci: formData.ci, // Enviar como string, el backend lo parseará
            email: formData.email,
            telefono: formData.telefono, // Enviar como string
            fechaNac: formData.fechaNac // Enviar como string YYYY-MM-DD
        };

        try {
            const response = await apiClient.put('/user/profile', payload); // O '/auth/profile' si esa es tu ruta

            setSuccessMessage('¡Datos actualizados con éxito!');

            if (response.data) { // response.data es UserProfileDTO del backend
                updateUserContext(response.data);
            }

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (err) {
            const errorMessage = typeof err.response?.data === 'string'
                ? err.response.data
                : (err.response?.data?.message || 'Error al actualizar los datos. Inténtalo de nuevo.');
            setError(errorMessage);
            console.error("Error al actualizar perfil:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || (!authLoading && !user)) {
        return <div className="loading-container">Cargando datos del usuario...</div>;
    }

    return (
        <div className="edit-profile-page-container">
            <div className="edit-profile-form-container">
                <h2>Editar mis datos</h2>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input id="apellido" name="apellido" type="text" placeholder="Tu apellido" value={formData.apellido} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ci">CI</label>
                        <input id="ci" name="ci" type="text" value={formData.ci} readOnly className="readonly-input"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input id="telefono" name="telefono" type="text" placeholder="Tu número de teléfono" value={formData.telefono} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaNac">Fecha de nacimiento</label>
                        <input id="fechaNac" name="fechaNac" type="date" value={formData.fechaNac} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;