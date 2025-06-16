// src/components/Login.js
import React, { useState } from "react";
// --- 1. AÑADE useLocation ---
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Asegúrate que esta ruta sea correcta
import './Login.css';

// Asume que tienes tu logo en public/images/logo-omnibus.png
const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png';

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const { login, error: authError, setError: setAuthError } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // --- 2. OBTENEMOS LA UBICACIÓN Y EL DESTINO ORIGINAL ---
    const location = useLocation();
    // Si ProtectedRoute nos envió una ubicación, la usamos. Si no, vamos a la página principal.
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError("");
        if (!email || !contrasenia) {
            setAuthError("Por favor, ingrese email y contraseña.");
            return;
        }
        setIsLoading(true);
        try {
            // --- 3. ¡CAMBIO CLAVE! ---
            // La función `login` del contexto ahora nos debe devolver si fue exitoso o no.
            // Le pasamos las credenciales y el destino al que debe redirigir.
            const loginExitoso = await login({ email, contrasenia }, from);

            // Si el login en el contexto no maneja la navegación, la hacemos aquí.
            // (Es mejor que la maneje el contexto, pero esto es un fallback).
            if (loginExitoso) {
                // Esta navegación solo se ejecutará si tu función `login` en el contexto
                // no navega por sí misma y devuelve `true`.
                navigate(from, { replace: true });
            }

        } catch (err) {
            // El error ya debería ser manejado y expuesto por el AuthContext,
            // por lo que este bloque puede que no sea necesario.
            console.error("Error en el componente Login:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-container">
                <h2>Iniciar Sesión</h2>
                <img src={logoUrl} alt="Logo Omnibus" className="login-logo" />
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
                    {authError && <p className="error-message" style={{color: 'red'}}>{authError}</p>}
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </button>
                </form>
                <p className="forgot-password-link" style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                </p>
                <p className="register-link-text" style={{ marginTop: '10px', textAlign: 'center' }}>
                    ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;