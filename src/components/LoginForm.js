import React, { useState } from "react";
import { login } from "../api";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await login({ email, contrasenia });
        setMsg(response.message || "Inicio de sesión exitoso");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Iniciar sesión</h2>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" onChange={(e) => setContrasenia(e.target.value)} />
            <button type="submit">Entrar</button>
            <p>{msg}</p>
        </form>
    );
}

export default LoginForm;
