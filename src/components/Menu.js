import React from "react";

const Menu = () => {
    return (
        <div>
            <h1>Bienvenido al menú principal</h1>
            <p>Has iniciado sesión correctamente.</p>
        </div>
    );
};

const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};


export default Menu;
