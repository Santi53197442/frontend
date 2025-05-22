// src/components/Login.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(""); // Para mostrar errores en el formulario

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Limpia errores anteriores
        if (!email || !contrasenia) {
            setError("Por favor, ingrese email y contraseña.");
            return;
        }
        setIsLoading(true);
        const success = await login({ email, contrasenia });
        setIsLoading(false);
        if (!success) {
            // El alert ya se muestra desde AuthContext, pero podríamos querer un error local también
            // setError("Credenciales incorrectas o error en el servidor.");
        }
        // La navegación ocurre dentro de la función login del AuthContext si es exitosa
    };

    return (
        <div>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={contrasenia}
                        onChange={(e) => setContrasenia(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Entrar"}
                </button>
            </form>
            <p>
                ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
        </div>
    );
};

export default Login;