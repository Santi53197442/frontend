import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://back-production-a1b0.up.railway.app"; // Ajustá si usás /api

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                contrasenia,
            });

            localStorage.setItem("token", res.data.token);
            navigate("/menu");
        } catch (err) {
            alert("Credenciales inválidas");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={contrasenia} onChange={(e) => setContrasenia(e.target.value)} placeholder="Contraseña" required />
            <button type="submit">Ingresar</button>
        </form>
    );
};

export default Login;
