// src/components/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import { useAuth } from "../AuthContext";
import './Login.css'; // Importa el archivo CSS que crearemos

// Asume que tienes tu logo en public/images/logo-omnibus.png (el mismo que en el header)
const logoUrl = '/images/logo-omnibus.png';

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Para la redirección

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !contrasenia) {
            setError("Por favor, ingrese email y contraseña.");
            return;
        }
        setIsLoading(true);
        const success = await login({ email, contrasenia });
        setIsLoading(false);
        if (!success) {
            // El mensaje de error ya se maneja en AuthContext
            // setError("Credenciales incorrectas o error en el servidor.");
        } else {
            // La navegación ya la maneja AuthContext.login si es exitoso
        }
    };

    return (
        <div className="login-page-container"> {/* Contenedor para centrar en la página */}
            <div className="login-form-container">
                <h2>Iniciar Sesión</h2>
                <img src={logoUrl} alt="Logo" className="login-logo" />
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Tu contraseña"
                            value={contrasenia}
                            onChange={(e) => setContrasenia(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </button>
                </form>
                <p className="register-link-text">
                    ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;