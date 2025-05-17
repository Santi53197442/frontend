import React, { useState } from "react";
import { register } from "../api";

function RegisterForm() {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        contrasenia: "",
        email: "",
        telefono: "",
        fechaNac: "",
    });

    const [msg, setMsg] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await register(form);
        setMsg(response.message || "Registro exitoso");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Registro</h2>
            <input name="nombre" placeholder="Nombre" onChange={handleChange} />
            <input name="apellido" placeholder="Apellido" onChange={handleChange} />
            <input name="ci" placeholder="CI" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="contrasenia" placeholder="Contraseña" onChange={handleChange} />
            <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
            <input name="fechaNac" type="date" onChange={handleChange} />
            <button type="submit">Registrar</button>
            <p>{msg}</p>
        </form>
    );
}

export default RegisterForm;
