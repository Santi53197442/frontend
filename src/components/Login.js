// src/components/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Asegúrate que esta ruta sea correcta
import './Login.css';

// Asume que tienes tu logo en public/images/logo-omnibus.png
const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png'; // Forma más robusta de referenciar assets en public

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const { login, error: authError, setError: setAuthError } = useAuth(); // Obtener error y setError de AuthContext
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(""); // Usaremos el error del AuthContext
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError(""); // Limpiar errores previos del contexto
        if (!email || !contrasenia) {
            setAuthError("Por favor, ingrese email y contraseña."); // Usar setError del contexto
            return;
        }
        setIsLoading(true);
        try {
            await login({ email, contrasenia }); // login en AuthContext ya debería manejar la navegación en caso de éxito
            // y setear el error en caso de fallo.
        } catch (err) {
            // Si login en AuthContext no propaga el error o quieres un fallback
            // (aunque lo ideal es que AuthContext maneje el error y lo exponga)
            // setAuthError("Ocurrió un error inesperado durante el login.");
            console.error("Error en handleLogin:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-container">
                <h2>Iniciar Sesión</h2>
                <img src={logoUrl} alt="Logo Omnibus" className="login-logo" /> {/* Mejor alt text */}
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
                            autoComplete="email"
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
                            autoComplete="current-password"
                        />
                    </div>
                    {/* Muestra el error del AuthContext si existe */}
                    {authError && <p className="error-message" style={{color: 'red'}}>{authError}</p>}
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </button>
                </form>
                <p className="forgot-password-link" style={{ marginTop: '10px', textAlign: 'center' }}> {/* Contenedor para el enlace */}
                    <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link> {/* <-- ENLACE AÑADIDO */}
                </p>
                <p className="register-link-text" style={{ marginTop: '10px', textAlign: 'center' }}>
                    ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;