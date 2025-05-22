// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom'; // Opcional, para enlaces

const Home = () => {
    return (
        <div>
            <h1>Página de Inicio</h1>
            <p>Bienvenido a la aplicación.</p>
            <nav>
                <ul>
                    <li>
                        <Link to="/login">Iniciar Sesión</Link>
                    </li>
                    <li>
                        <Link to="/register">Registrarse</Link>
                    </li>
                    <li>
                        <Link to="/menu">Ir al Menú (Protegido)</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Home; // ¡MUY IMPORTANTE!