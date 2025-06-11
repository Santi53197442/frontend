// src/pages/admin/AdminDashboard.js
import React from 'react';
import { NavLink } from 'react-router-dom'; // Usamos NavLink para obtener estilos en el enlace activo
import { useAuth } from '../../AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();

    // 1. Actualizamos el array para que coincida con las opciones de tu menú
    const adminMenuOptions = [
        {
            title: "Crear Usuario",
            link: "/admin/crear-usuario",
        },
        {
            title: "Carga Masiva",
            link: "/admin/carga-masiva-usuarios",
        },
        {
            title: "Listar Usuarios",
            link: "/admin/listar-usuarios",
        },
        {
            title: "Eliminar Usuarios",
            link: "/admin/eliminar-usuarios",
        },
        {
            title: "Estadísticas de Usuarios",
            link: "/admin/estadisticas", // Asegúrate de que esta ruta exista en tu App.js
        },
    ];

    return (
        <div className="admin-dashboard-container">
            <header className="admin-dashboard-header">
                <h1>Panel de Administración</h1>
                <p>Bienvenido, {user?.nombre || user?.email}!</p>
            </header>

            {/* 2. Reemplazamos la sección de "action cards" por una barra de navegación */}
            <nav className="admin-vertical-nav">
                <ul>
                    {adminMenuOptions.map((option, index) => (
                        <li key={index}>
                            <NavLink
                                to={option.link}
                                className="nav-link"
                                // El NavLink añade la clase 'active' automáticamente al enlace que coincide con la URL actual
                            >
                                {option.title}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default AdminDashboard;