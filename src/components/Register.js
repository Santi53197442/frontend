// src/components/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api"; // Asegúrate que esta función exista y funcione
import './Register.css'; // Importaremos este archivo CSS

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
        rol: "CLIENTE"
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
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        if (form.ci && isNaN(parseInt(form.ci))) {
            setError("CI debe ser un número.");
            setIsLoading(false);
            return;
        }
        if (form.telefono && isNaN(parseInt(form.telefono))) {
            setError("Teléfono debe ser un número.");
            setIsLoading(false);
            return;
        }

        const { confirmarContrasenia, ...payloadToSubmit } = form;

        const finalPayload = {
            ...payloadToSubmit,
            ci: form.ci ? parseInt(form.ci) : null,
            telefono: form.telefono ? parseInt(form.telefono) : null,
        };

        try {
            const response = await registerUser(finalPayload);
            setSuccessMessage(response.data || "Registro exitoso. Serás redirigido al login.");
            setTimeout(() => {
                navigate("/login");
            }, 2500);
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
                <h2>Crear Cuenta</h2>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-group"> {/* Nombre en su propio renglón */}
                        <label htmlFor="nombre">Nombre</label>
                        <input id="nombre" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required disabled={isLoading} />
                    </div>
                    <div className="form-group"> {/* Apellido en su propio renglón */}
                        <label htmlFor="apellido">Apellido</label>
                        <input id="apellido" name="apellido" placeholder="Tu apellido" value={form.apellido} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ci">CI (Cédula de Identidad)</label>
                        <input id="ci" name="ci" type="text" placeholder="Ej: 12345678" value={form.ci} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contrasenia">Contraseña</label>
                        <input id="contrasenia" name="contrasenia" type="password" placeholder="Crea una contraseña" value={form.contrasenia} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmarContrasenia">Confirmar Contraseña</label>
                        <input id="confirmarContrasenia" name="confirmarContrasenia" type="password" placeholder="Vuelve a escribir la contraseña" value={form.confirmarContrasenia} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="telefono">Teléfono</label>
                            <input id="telefono" name="telefono" type="text" placeholder="Ej: 099123456" value={form.telefono} onChange={handleChange} required disabled={isLoading} />
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