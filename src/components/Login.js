// src/components/Login.js
import React, { useState } from "react";
import { Link } from "react-router-dom"; // useNavigate se manejará desde AuthContext
import { useAuth } from "../AuthContext"; // Importa el hook useAuth

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const { login } = useAuth(); // Obtiene la función login del contexto

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !contrasenia) {
            alert("Por favor, ingrese email y contraseña.");
            return;
        }
        // La función login del contexto ahora maneja la lógica de API y redirección
        await login({ email, contrasenia });
        // No necesitas hacer nada más aquí, login() en AuthContext se encarga
    };

    return (
        <div>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={contrasenia}
                    onChange={(e) => setContrasenia(e.target.value)}
                    required
                />
                <button type="submit">Entrar</button>
            </form>
            <p>
                ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
        </div>
    );
};

export default Login;