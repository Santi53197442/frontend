// src/pages/admin/AdminCreateUserPage.js
import React, { useState } from 'react';
import apiClient from '../services/api'; // Ajusta la ruta si api.js está en src/services/
import './AdminCreateUserPage.css'; // Crearemos este archivo CSS

const AdminCreateUserPage = () => {
    const initialFormData = {
        nombre: '',
        apellido: '',
        ci: '',
        email: '',
        contrasenia: '',
        confirmarContrasenia: '',
        telefono: '',
        fechaNac: '',
        tipoRolACrear: 'VENDEDOR', // Valor por defecto
        codigoVendedor: '',      // Específico para VENDEDOR
        areaResponsabilidad: ''  // Específico para ADMINISTRADOR
    };
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (formData.contrasenia !== formData.confirmarContrasenia) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (formData.contrasenia.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        // Podrías añadir más validaciones de frontend aquí (ej. formato de CI, teléfono)

        setIsLoading(true);

        const payload = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            ci: formData.ci ? parseInt(formData.ci) : null,
            email: formData.email,
            contrasenia: formData.contrasenia,
            telefono: formData.telefono ? parseInt(formData.telefono) : null,
            fechaNac: formData.fechaNac,
            tipoRolACrear: formData.tipoRolACrear,
        };

        if (formData.tipoRolACrear === 'VENDEDOR') {
            if (!formData.codigoVendedor.trim()) { // trim() para evitar espacios en blanco
                setError("El código de vendedor es obligatorio para el rol Vendedor.");
                setIsLoading(false);
                return;
            }
            payload.codigoVendedor = formData.codigoVendedor.trim();
        } else if (formData.tipoRolACrear === 'ADMINISTRADOR') {
            payload.areaResponsabilidad = formData.areaResponsabilidad.trim() || "General"; // Valor por defecto si está vacío
        }

        try {
            const response = await apiClient.post('/api/admin/users/create-privileged', payload);
            setSuccessMessage(response.data.message || "Usuario creado exitosamente.");
            setFormData(initialFormData); // Resetear el formulario
        } catch (err) {
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object' && err.response.data.messageGeneral) {
                    let validationErrors = "Por favor corrige los siguientes errores:\n";
                    for (const key in err.response.data) {
                        if (key !== 'messageGeneral') {
                            validationErrors += `- ${err.response.data[key]}\n`;
                        }
                    }
                    setError(validationErrors.trim());
                } else {
                    setError(err.response.data.message || "Error al crear el usuario.");
                }
            } else {
                setError("Ocurrió un error inesperado. Revisa la consola para más detalles.");
            }
            console.error("Error creando usuario privilegiado:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-create-user-page-container"> {/* Clase específica para la página */}
            <h2>Crear Nuevo Usuario (Admin/Vendedor)</h2>

            {successMessage && <p className="form-success-message">{successMessage}</p>}
            {error && <p className="form-error-message" style={{ whiteSpace: 'pre-line' }}>{error}</p>}

            <form onSubmit={handleSubmit} className="create-user-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre:</label>
                        <input type="text" id="nombre" name="nombre" placeholder="Ej: Juan" value={formData.nombre} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido:</label>
                        <input type="text" id="apellido" name="apellido" placeholder="Ej: Pérez" value={formData.apellido} onChange={handleChange} required disabled={isLoading} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="ci">CI (Cédula):</label>
                        <input type="text" id="ci" name="ci" placeholder="Ej: 12345678 (sin puntos ni guiones)" value={formData.ci} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" placeholder="usuario@ejemplo.com" value={formData.email} onChange={handleChange} required disabled={isLoading} autoComplete="new-password" /> {/* new-password para evitar autofill de login */}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contrasenia">Contraseña:</label>
                        <input type="password" id="contrasenia" name="contrasenia" placeholder="Mínimo 6 caracteres" value={formData.contrasenia} onChange={handleChange} required disabled={isLoading} autoComplete="new-password" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmarContrasenia">Confirmar Contraseña:</label>
                        <input type="password" id="confirmarContrasenia" name="confirmarContrasenia" placeholder="Repetir contraseña" value={formData.confirmarContrasenia} onChange={handleChange} required disabled={isLoading} autoComplete="new-password"/>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono:</label>
                        <input type="tel" id="telefono" name="telefono" placeholder="Ej: 099123456" value={formData.telefono} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaNac">Fecha de Nacimiento:</label>
                        <input type="date" id="fechaNac" name="fechaNac" value={formData.fechaNac} onChange={handleChange} required disabled={isLoading} />
                    </div>
                </div>

                <hr className="form-divider" />

                <div className="form-group">
                    <label htmlFor="tipoRolACrear">Tipo de Rol a Crear:</label>
                    <select id="tipoRolACrear" name="tipoRolACrear" value={formData.tipoRolACrear} onChange={handleChange} disabled={isLoading}>
                        <option value="VENDEDOR">Vendedor</option>
                        <option value="ADMINISTRADOR">Administrador</option>
                    </select>
                </div>

                {formData.tipoRolACrear === 'VENDEDOR' && (
                    <div className="form-group">
                        <label htmlFor="codigoVendedor">Código de Vendedor:</label>
                        <input type="text" id="codigoVendedor" name="codigoVendedor" placeholder="Ej: VEN001" value={formData.codigoVendedor} onChange={handleChange} disabled={isLoading} required={formData.tipoRolACrear === 'VENDEDOR'} />
                    </div>
                )}

                {formData.tipoRolACrear === 'ADMINISTRADOR' && (
                    <div className="form-group">
                        <label htmlFor="areaResponsabilidad">Área de Responsabilidad (Admin):</label>
                        <input type="text" id="areaResponsabilidad" name="areaResponsabilidad" placeholder="Ej: Sistemas, Operaciones" value={formData.areaResponsabilidad} onChange={handleChange} disabled={isLoading} />
                    </div>
                )}

                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Creando Usuario...' : 'Crear Usuario'}
                </button>
            </form>
        </div>
    );
};

export default AdminCreateUserPage;