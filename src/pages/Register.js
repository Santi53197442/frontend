import React, { useState } from "react";
import { registerUser } from "../services/api";

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        ci: "",
        contrasenia: "",
        email: "",
        telefono: "",
        fechaNac: "",
        rol: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await registerUser(formData);
            alert(res.data);
        } catch (err) {
            alert("Error al registrarse: " + err.response.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Inputs aquí */}
            <input name="email" onChange={handleChange} placeholder="Email" />
            <input name="contrasenia" type="password" onChange={handleChange} placeholder="Contraseña" />
            <button type="submit">Registrarse</button>
        </form>
    );
};

export default Register;
