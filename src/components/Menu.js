// src/components/Menu.js (Ejemplo)
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Menu = () => {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Menú Principal</h1>
            {user && <p>Bienvenido, {user.email} (Rol: {user.rol || 'No especificado'})</p>}
            <nav>
                <ul>
                    <li><Link to="/menu">Inicio (Menú)</Link></li>
                    {/* Más enlaces del menú */}
                </ul>
            </nav>
            <button onClick={logout}>Cerrar Sesión</button>
        </div>
    );
};

export default Menu;