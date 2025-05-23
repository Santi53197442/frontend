// src/pages/AdminCreateUserPage.js
import React, { useState } from 'react';
import apiClient from '../services/api'; // Tu apiClient
// import './AdminCreateUserPage.css'; // Tu CSS

const AdminCreateUserPage = () => {
    const [formData, setFormData] = useState({
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
    });
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

        // Prepara el payload según el tipo de rol
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
            if (!formData.codigoVendedor) {
                setError("El código de vendedor es obligatorio para el rol Vendedor.");
                setIsLoading(false);
                return;
            }
            payload.codigoVendedor = formData.codigoVendedor;
        } else if (formData.tipoRolACrear === 'ADMINISTRADOR') {
            // Si 'areaResponsabilidad' es opcional, puedes omitir esta validación
            // o manejarla como un valor por defecto en el backend
            payload.areaResponsabilidad = formData.areaResponsabilidad || "General";
        }


        try {
            const response = await apiClient.post('/api/admin/users/create-privileged', payload);
            setSuccessMessage(response.data.message || "Usuario creado exitosamente.");
            // Limpiar formulario o redirigir
            setFormData({ /* ...estado inicial... */
                nombre: '', apellido: '', ci: '', email: '', contrasenia: '', confirmarContrasenia: '',
                telefono: '', fechaNac: '', tipoRolACrear: 'VENDEDOR', codigoVendedor: '', areaResponsabilidad: ''
            });
        } catch (err) {
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object' && err.response.data.messageGeneral) {
                    // Errores de validación del backend
                    let validationErrors = Object.entries(err.response.data)
                        .filter(([key]) => key !== 'messageGeneral')
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n');
                    setError(`Error de validación:\n${validationErrors}`);
                } else {
                    setError(err.response.data.message || "Error al crear el usuario.");
                }
            } else {
                setError("Ocurrió un error inesperado.");
            }
            console.error("Error creando usuario privilegiado:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-create-user-container"> {/* Usa tus clases CSS */}
            <h2>Crear Usuario Administrador/Vendedor</h2>
            {error && <p className="error-message" style={{ whiteSpace: 'pre-line' }}>{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                {/* Campos comunes: nombre, apellido, ci, email, contraseña, telefono, fechaNac */}
                <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={isLoading} />
                </div>
                {/* ... (otros campos comunes como en tu Register.js) ... */}
                <div className="form-group">
                    <label htmlFor="apellido">Apellido:</label>
                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="ci">CI:</label>
                    <input type="text" name="ci" value={formData.ci} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="contrasenia">Contraseña:</label>
                    <input type="password" name="contrasenia" value={formData.contrasenia} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmarContrasenia">Confirmar Contraseña:</label>
                    <input type="password" name="confirmarContrasenia" value={formData.confirmarContrasenia} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono">Teléfono:</label>
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="fechaNac">Fecha de Nacimiento:</label>
                    <input type="date" name="fechaNac" value={formData.fechaNac} onChange={handleChange} required disabled={isLoading} />
                </div>


                <div className="form-group">
                    <label htmlFor="tipoRolACrear">Tipo de Rol a Crear:</label>
                    <select name="tipoRolACrear" value={formData.tipoRolACrear} onChange={handleChange} disabled={isLoading}>
                        <option value="VENDEDOR">Vendedor</option>
                        <option value="ADMINISTRADOR">Administrador</option>
                    </select>
                </div>

                {formData.tipoRolACrear === 'VENDEDOR' && (
                    <div className="form-group">
                        <label htmlFor="codigoVendedor">Código de Vendedor:</label>
                        <input type="text" name="codigoVendedor" value={formData.codigoVendedor} onChange={handleChange} disabled={isLoading} required />
                    </div>
                )}

                {formData.tipoRolACrear === 'ADMINISTRADOR' && (
                    <div className="form-group">
                        <label htmlFor="areaResponsabilidad">Área de Responsabilidad (Admin):</label>
                        <input type="text" name="areaResponsabilidad" value={formData.areaResponsabilidad} onChange={handleChange} disabled={isLoading} />
                    </div>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
            </form>
        </div>
    );
};

export default AdminCreateUserPage;