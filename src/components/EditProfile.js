// src/components/EditProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Asegúrate que la ruta sea correcta
import apiClient from '../services/api'; // Tu instancia de Axios
import './EditProfile.css'; // Crearemos este archivo CSS

const EditProfile = () => {
    const { user, updateUserContext, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        ci: '',
        email: '',
        telefono: '',
        fechaNac: ''
    });
    const [isLoading, setIsLoading] = useState(false); // Para el submit del formulario
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!authLoading) { // Espera a que el contexto de autenticación termine de cargar
            if (!isAuthenticated || !user) {
                navigate('/login'); // Redirige si no está autenticado o no hay datos de usuario
            } else {
                // Cargar datos del usuario en el formulario
                setFormData({
                    nombre: user.nombre || '',
                    apellido: user.apellido || '',
                    ci: user.ci || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    fechaNac: user.fechaNac ? (typeof user.fechaNac === 'string' ? user.fechaNac.split('T')[0] : '') : '' // Formato YYYY-MM-DD
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

        // Validaciones básicas (puedes expandirlas)
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

        const payload = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            ci: formData.ci ? parseInt(formData.ci) : null,
            email: formData.email, // Considera si el backend permite cambiar email y cómo lo maneja
            telefono: formData.telefono ? parseInt(formData.telefono) : null,
            fechaNac: formData.fechaNac // En formato YYYY-MM-DD
        };

        try {
            // Endpoint PUT para actualizar perfil
            const response = await apiClient.put('/api/user/profile', payload);

            setSuccessMessage('¡Datos actualizados con éxito!');

            if (response.data) {
                updateUserContext(response.data); // Actualiza AuthContext con los datos del backend
            }

            setTimeout(() => {
                setSuccessMessage('');
                // Opcional: navigate('/perfil-usuario') o a donde desees
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

    // Muestra un estado de carga mientras el AuthContext se inicializa
    // o si el usuario no está disponible aún.
    if (authLoading || (!authLoading && !user)) {
        return <div className="loading-container">Cargando datos del usuario...</div>;
    }

    return (
        <div className="edit-profile-page-container">
            <div className="edit-profile-form-container">
                <h2>Editar Mis Datos</h2>
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
                        <input id="ci" name="ci" type="text" placeholder="Tu Cédula de Identidad" value={formData.ci} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                        {/* Podrías añadir una nota aquí si cambiar el email tiene implicaciones o deshabilitarlo */}
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input id="telefono" name="telefono" type="text" placeholder="Tu número de teléfono" value={formData.telefono} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaNac">Fecha de Nacimiento</label>
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