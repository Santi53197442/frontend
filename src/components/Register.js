// src/components/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

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

        // Simple validación para CI y Teléfono (puedes mejorarla)
        if (isNaN(parseInt(form.ci)) || isNaN(parseInt(form.telefono))) {
            setError("CI y Teléfono deben ser números.");
            setIsLoading(false);
            return;
        }

        const payload = {
            ...form,
            ci: parseInt(form.ci), // Asegurar que sean números si el backend espera Integer
            telefono: parseInt(form.telefono)
        };

        try {
            const response = await registerUser(payload);
            setSuccessMessage(response.data || "Registro exitoso. Por favor, inicia sesión.");
            alert(response.data || "Registro exitoso. Por favor, inicia sesión."); // Puedes quitar el alert si prefieres solo el mensaje en UI
            navigate("/login");
        } catch (err) {
            const errorMessage = typeof err.response?.data === 'string'
                ? err.response.data
                : (err.response?.data?.message || "Error al registrar. Inténtalo de nuevo.");
            setError(errorMessage);
            console.error("Error en el registro:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            <form onSubmit={handleRegister}>
                {/* Inputs como los tenías, añadiendo disabled={isLoading} */}
                <div><input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required disabled={isLoading} /></div>
                <div><input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required disabled={isLoading} /></div>
                <div><input name="ci" type="text" placeholder="CI (solo números)" value={form.ci} onChange={handleChange} required disabled={isLoading} /></div>
                <div><input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={isLoading} /></div>
                <div><input name="contrasenia" type="password" placeholder="Contraseña" value={form.contrasenia} onChange={handleChange} required disabled={isLoading} /></div>
                <div><input name="telefono" type="text" placeholder="Teléfono (solo números)" value={form.telefono} onChange={handleChange} required disabled={isLoading} /></div>
                <div><input type="date" name="fechaNac" placeholder="Fecha de Nacimiento" value={form.fechaNac} onChange={handleChange} required disabled={isLoading} /></div>
                {/* No es necesario un input para el rol si siempre es "CLIENTE" por defecto desde el frontend */}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Registrar"}
                </button>
            </form>
            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
};

export default Register;