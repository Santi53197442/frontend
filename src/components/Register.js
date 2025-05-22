// src/components/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api"; // Asegúrate que esta función exista y funcione
import './Register.css'; // Importaremos este archivo CSS

// Puedes usar el mismo logo o uno diferente si lo deseas
const logoUrl = '/images/logo-omnibus.png';

const Register = () => {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        email: "",
        contrasenia: "",
        telefono: "",
        fechaNac: "",
        rol: "CLIENTE" // El backend espera "ROLE_CLIENTE", tu AuthController añade "ROLE_"
                       // Si el backend lo maneja, puedes enviar "CLIENTE" o "USER"
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
        setIsLoading(true);

        // Validación simple
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

        const payload = {
            ...form,
            // Asegurar que ci y telefono sean números si el backend espera Integer y si se ingresaron
            ci: form.ci ? parseInt(form.ci) : null,
            telefono: form.telefono ? parseInt(form.telefono) : null,
        };

        try {
            const response = await registerUser(payload); // Tu función de API
            setSuccessMessage(response.data || "Registro exitoso. Serás redirigido al login.");
            // alert(response.data || "Registro exitoso. Por favor, inicia sesión.");
            setTimeout(() => {
                navigate("/login");
            }, 2000); // Redirige después de 2 segundos para que el usuario vea el mensaje
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
        <div className="register-page-container"> {/* Contenedor para centrar en la página */}
            <div className="register-form-container">
                <h2>Crear Cuenta</h2>
                <img src={logoUrl} alt="Logo" className="register-logo" />

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-row"> {/* Para poner nombre y apellido en la misma fila */}
                        <div className="form-group half-width">
                            <label htmlFor="nombre">Nombre</label>
                            <input id="nombre" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required disabled={isLoading} />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="apellido">Apellido</label>
                            <input id="apellido" name="apellido" placeholder="Tu apellido" value={form.apellido} onChange={handleChange} required disabled={isLoading} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="ci">CI (Cédula de Identidad)</label>
                        <input id="ci" name="ci" type="text" placeholder="Ej: 12345678 (sin puntos ni guiones)" value={form.ci} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" name="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required disabled={isLoading} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contrasenia">Contraseña</label>
                        <input id="contrasenia" name="contrasenia" type="password" placeholder="Crea una contraseña" value={form.contrasenia} onChange={handleChange} required disabled={isLoading} />
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

                    {/* No se muestra el campo ROL si es siempre CLIENTE desde el frontend */}

                    <button type="submit" className="register-button" disabled={isLoading}>
                        {isLoading ? "Registrando..." : "Registrar Cuenta"}
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