import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch("${process.env.REACT_APP_API_URL}/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, contrasenia }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token); // Si usás JWT, por ejemplo
            navigate("/menu");
        } else {
            alert("Login fallido");
        }
    };

    return (
        <div>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleLogin}>
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Contraseña" type="password" value={contrasenia} onChange={(e) => setContrasenia(e.target.value)} />
                <button type="submit">Entrar</button>
            </form>
            <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        </div>
    );
};

export default Login;
