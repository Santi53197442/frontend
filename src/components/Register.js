import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        email: "",
        contrasenia: "",
        telefono: "",
        fechaNac: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await fetch("https://back-production-7af9.up.railway.app/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (response.ok) {
            alert("Registro exitoso");
            navigate("/login");
        } else {
            alert("Error al registrar");
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleRegister}>
                <input name="nombre" placeholder="Nombre" onChange={handleChange} />
                <input name="apellido" placeholder="Apellido" onChange={handleChange} />
                <input name="ci" placeholder="CI" onChange={handleChange} />
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input name="contrasenia" type="password" placeholder="Contraseña" onChange={handleChange} />
                <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
                <input name="fechaNac" placeholder="Fecha de Nacimiento (YYYY-MM-DD)" onChange={handleChange} />
                <button type="submit">Registrar</button>
            </form>
            <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
    );
};

export default Register;
