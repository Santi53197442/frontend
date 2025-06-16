// src/components/Login.js
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import './Login.css';

const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png';

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const { login, error: authError, setError: setAuthError } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Hooks para la redirección
    const navigate = useNavigate(); // Aunque la navegación la hace el contexto, es bueno tenerlo por si acaso.
    const location = useLocation();

    // Obtenemos la ruta a la que el usuario quería ir antes de ser redirigido aquí.
    // Si no hay ninguna, el destino por defecto será la página principal "/".
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError(""); // Limpiamos errores anteriores
        if (!email || !contrasenia) {
            setAuthError("Por favor, ingrese email y contraseña.");
            return;
        }
        setIsLoading(true);
        try {
            // Pasamos las credenciales Y el destino de redirección a la función del contexto.
            // El contexto se encargará de navegar al lugar correcto.
            await login({ email, contrasenia }, from);
        } catch (err) {
            // El error ya es manejado por el contexto, pero este log es útil para depurar.
            console.error("Error capturado en el componente Login:", err);
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