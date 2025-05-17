import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://back-production-a1b0.up.railway.app";

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        contrasenia: "",
        email: "",
        telefono: "",
        fechaNac: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            alert("Registro exitoso");
            navigate("/login");
        } catch (err) {
            alert("Error al registrar");
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2>Registro</h2>
            <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
            <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
            <input name="ci" placeholder="CI" onChange={handleChange} required />
            <input name="contrasenia" placeholder="Contraseña" type="password" onChange={handleChange} required />
            <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
            <input name="telefono" placeholder="Teléfono" onChange={handleChange} required />
            <input name="fechaNac" type="date" onChange={handleChange} required />
            <button type="submit">Registrarse</button>
        </form>
    );
};

export default Register;
