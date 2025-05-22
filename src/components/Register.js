// src/components/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api"; // Importa la función de api.js

const Register = () => {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        email: "",
        contrasenia: "",
        telefono: "",
        fechaNac: "",
        rol: "CLIENTE" // O el rol por defecto que desees enviar, o un campo para seleccionarlo
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            // Asegúrate que todos los campos necesarios por tu backend estén aquí
            // Y que los nombres coincidan (ej. 'contrasenia' vs 'password')
            const response = await registerUser(form);
            // El backend devuelve "Registro exitoso" o similar
            setSuccess(response.data || "Registro exitoso. Por favor, inicia sesión.");
            // No es necesario `await response.json()` porque axios ya lo hace
            alert(response.data || "Registro exitoso. Por favor, inicia sesión.");
            navigate("/login");
        } catch (err) {
            // Axios envuelve el error, el mensaje del backend suele estar en err.response.data
            const errorMessage = err.response?.data || "Error al registrar. Inténtalo de nuevo.";
            setError(errorMessage);
            alert(errorMessage);
            console.error("Error en el registro:", err.response || err);
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleRegister}>
                <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
                <input name="ci" placeholder="CI" value={form.ci} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="contrasenia" type="password" placeholder="Contraseña" value={form.contrasenia} onChange={handleChange} required />
                <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
                <input type="date" name="fechaNac" placeholder="Fecha de Nacimiento (YYYY-MM-DD)" value={form.fechaNac} onChange={handleChange} required />
                {/* Podrías añadir un selector de rol si es necesario */}
                <button type="submit">Registrar</button>
            </form>
            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
};

export default Register;