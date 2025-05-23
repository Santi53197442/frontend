// src/components/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api"; // Asumiendo que api.js exporta registerUser
import './Register.css'; // Importa tu CSS

const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png';

const Register = () => {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        email: "",
        contrasenia: "",
        confirmarContrasenia: "",
        telefono: "",
        fechaNac: "",
        // 'rol' ya no se maneja aquí, el backend asignará 'CLIENTE'
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (form.contrasenia !== form.confirmarContrasenia) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        // Mover validaciones numéricas antes de setIsLoading(true)
        if (form.ci && isNaN(parseInt(form.ci))) {
            setError("CI debe ser un número válido.");
            return;
        }
        if (form.telefono && isNaN(parseInt(form.telefono))) {
            setError("Teléfono debe ser un número válido.");
            return;
        }
        // Validar longitud de contraseña
        if (form.contrasenia.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }


        setIsLoading(true);

        // Excluir confirmarContrasenia del payload. 'rol' ya no está en el estado 'form'.
        const { confirmarContrasenia, ...payloadToSubmit } = form;

        const finalPayload = {
            ...payloadToSubmit,
            ci: form.ci ? parseInt(form.ci) : null, // Asegurar que ci se envíe como número o null
            telefono: form.telefono ? parseInt(form.telefono) : null, // Asegurar que telefono se envíe como número o null
        };

        try {
            // registerUser es la función importada de api.js
            const response = await registerUser(finalPayload);
            // Asumimos que response.data es un objeto con un campo 'message' o un string directamente
            const message = typeof response.data === 'string' ? response.data : response.data?.message;
            setSuccessMessage(message || "Registro exitoso. Serás redirigido al login.");
            setTimeout(() => {
                navigate("/login");
            }, 3000); // Aumentar un poco el tiempo para leer el mensaje
        } catch (err) {
            const errorMessage = typeof err.response?.data === 'string'
                ? err.response.data
                : (err.response?.data?.message || "Error al registrar. Verifica los datos e inténtalo de nuevo.");
            setError(errorMessage);
            console.error("Error en el registro:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-form-container">
                <img src={logoUrl} alt="Logo Omnibus" className="register-logo" />
                <h2>Crear Cuenta</h2>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleRegister} className="register-form">
                    {/* Nombre */}
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    {/* Apellido */}
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input id="apellido" name="apellido" type="text" placeholder="Tu apellido" value={form.apellido} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    {/* CI */}
                    <div className="form-group">
                        <label htmlFor="ci">CI (Cédula)</label>
                        <input id="ci" name="ci" type="text" placeholder="Ej: 12345678 (sin puntos ni guiones)" value={form.ci} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required disabled={isLoading} autoComplete="email" />
                    </div>
                    {/* Contraseña */}
                    <div className="form-group">
                        <label htmlFor="contrasenia">Contraseña</label>
                        <input id="contrasenia" name="contrasenia" type="password" placeholder="Mínimo 6 caracteres" value={form.contrasenia} onChange={handleChange} required disabled={isLoading} autoComplete="new-password" />
                    </div>
                    {/* Confirmar Contraseña */}
                    <div className="form-group">
                        <label htmlFor="confirmarContrasenia">Confirmar Contraseña</label>
                        <input id="confirmarContrasenia" name="confirmarContrasenia" type="password" placeholder="Vuelve a escribir la contraseña" value={form.confirmarContrasenia} onChange={handleChange} required disabled={isLoading} autoComplete="new-password"/>
                    </div>
                    {/* Teléfono y Fecha Nac en una fila si tienes CSS para .form-row */}
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="telefono">Teléfono</label>
                            <input id="telefono" name="telefono" type="tel" placeholder="Ej: 099123456" value={form.telefono} onChange={handleChange} required disabled={isLoading} />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="fechaNac">Fecha de Nacimiento</label>
                            <input id="fechaNac" type="date" name="fechaNac" value={form.fechaNac} onChange={handleChange} required disabled={isLoading} />
                        </div>
                    </div>

                    <button type="submit" className="register-button" disabled={isLoading}>
                        {isLoading ? "Registrando..." : "Crear Mi Cuenta"}
                    </button>
                </form>
                <p className="login-link-text">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;