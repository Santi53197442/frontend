// src/pages/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './AdminDashboard.css'; // Usamos el mismo CSS que ya tenías

const AdminDashboard = () => {
    const { user } = useAuth();

    // 1. Actualizamos el array con las nuevas opciones, pero manteniendo la estructura para las tarjetas
    const adminActions = [
        {
            title: "Crear Usuario",
            description: "Añadir un nuevo administrador o vendedor de forma individual.",
            link: "/admin/crear-usuario",
            color: "#3498db" // Azul
        },
        {
            title: "Carga Masiva",
            description: "Crear múltiples usuarios a la vez subiendo un archivo CSV.",
            link: "/admin/carga-masiva-usuarios",
            color: "#9b59b6" // Morado
        },
        {
            title: "Listar Usuarios",
            description: "Ver, filtrar y ordenar todos los usuarios del sistema.",
            link: "/admin/listar-usuarios",
            color: "#1abc9c" // Turquesa
        },
        {
            title: "Eliminar Usuarios",
            description: "Administrar y eliminar usuarios existentes de la plataforma.",
            link: "/admin/eliminar-usuarios",
            color: "#e74c3c" // Rojo
        },
        {
            title: "Estadísticas de Usuarios",
            description: "Visualizar reportes y datos sobre la actividad de los usuarios.",
            link: "/admin/estadisticas-usuarios",
            color: "#f39c12" // Naranja
        },
    ];

    return (
        <div className="admin-dashboard-container">
            <header className="admin-dashboard-header">
                <h1>Dashboard de Administración</h1>
                <p>Bienvenido, {user?.nombre || user?.email}! Gestiona la plataforma desde aquí.</p>
            </header>

            {/* 2. Mantenemos la misma estructura de renderizado con la cuadrícula de acciones */}
            <section className="admin-actions-grid">
                <h2>Acciones de Administración</h2>
                <div className="actions-wrapper">
                    {adminActions.map((action, index) => (
                        <Link to={action.link} key={index} className="action-card-link">
                            <div className="action-card" style={{ '--action-color': action.color }}>
                                <div className="action-card-content">
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;