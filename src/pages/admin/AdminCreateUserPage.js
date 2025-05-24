// src/pages/admin/AdminCreateUserPage.js
import React, { useState } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta si api.js está en una ubicación diferente
import './AdminCreateUserPage.css'; // Asegúrate de tener este archivo CSS o quita la importación

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
        tipoRolACrear: 'VENDEDOR',
        codigoVendedor: '',
        areaResponsabilidad: ''
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
        setIsLoading(true);

        if (formData.contrasenia !== formData.confirmarContrasenia) {
            setError("Las contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }
        if (formData.contrasenia.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            setIsLoading(false);
            return;
        }

        const payload = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            // El backend espera String para CI y Teléfono según tu DTO CreatePrivilegedUserDTO
            // y los convierte a Integer en el método processPrivilegedUserCreation.
            // Si tu DTO realmente espera Integer, entonces el parseInt aquí es correcto.
            // Si tu DTO espera String para que el backend lo parsee, envía como String.
            // Voy a asumir que el backend espera String para CI y Teléfono y los parsea internamente.
            ci: formData.ci.trim(),
            email: formData.email,
            contrasenia: formData.contrasenia,
            telefono: formData.telefono.trim(),
            fechaNac: formData.fechaNac, // Asegúrate de que el formato YYYY-MM-DD sea enviado
            tipoRolACrear: formData.tipoRolACrear,
        };

        if (formData.tipoRolACrear === 'VENDEDOR') {
            if (!formData.codigoVendedor.trim()) {
                setError("El código de vendedor es obligatorio para el rol Vendedor.");
                setIsLoading(false);
                return;
            }
            payload.codigoVendedor = formData.codigoVendedor.trim();
        } else if (formData.tipoRolACrear === 'ADMINISTRADOR') {
            payload.areaResponsabilidad = formData.areaResponsabilidad.trim() || "General";
        }

        try {
            // La ruta es relativa a apiClient.defaults.baseURL (que ahora es https://.../api)
            // Esta llamada irá a: https://web-production-2443c.up.railway.app/api/admin/users/create-privileged
            const response = await apiClient.post('/admin/create-privileged', payload);
            setSuccessMessage(response.data.message || "Usuario creado exitosamente.");
            setFormData(initialFormData);
        } catch (err) {
            let errorMessage = "Ocurrió un error inesperado.";
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object' && err.response.data.messageGeneral) {
                    errorMessage = "Por favor corrige los siguientes errores:\n";
                    for (const key in err.response.data) {
                        if (key !== 'messageGeneral') {
                            errorMessage += `- ${err.response.data[key]}\n`;
                        }
                    }
                    errorMessage = errorMessage.trim();
                } else {
                    errorMessage = err.response.data.message || "Error al crear el usuario.";
                }
            } else if (err.message) {
                errorMessage = `Error de red o servidor: ${err.message}`;
            }
            setError(errorMessage);
            console.error("Error creando usuario privilegiado:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-create-user-page-container">
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
                        <input type="text" id="ci" name="ci" placeholder="Ej: 12345678" value={formData.ci} onChange={handleChange} required disabled={isLoading} pattern="\d+" title="Solo números" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" placeholder="usuario@ejemplo.com" value={formData.email} onChange={handleChange} required disabled={isLoading} autoComplete="new-password" />
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
                        <input type="tel" id="telefono" name="telefono" placeholder="Ej: 099123456" value={formData.telefono} onChange={handleChange} required disabled={isLoading} pattern="\d+" title="Solo números" />
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