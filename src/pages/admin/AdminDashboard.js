// src/pages/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Ajusta la ruta si AuthContext está en ../../AuthContext
import './AdminDashboard.css'; // Crearemos este archivo CSS

// Podrías importar iconos si usas una librería como FontAwesome o Material Icons
// import { FaUsersCog, FaUserPlus, FaBoxOpen, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useAuth();

    const adminActions = [
        {
            title: "Crear Usuario",
            description: "Añadir nuevos administradores o vendedores al sistema.",
            link: "/admin/crear-usuario",
            // icon: <FaUserPlus size={30} />, // Ejemplo con icono
            color: "#2980b9" // Azul
        },
        {
            title: "Gestionar Viajes",
            description: "Configurar rutas, horarios y disponibilidad de viajes.",
            link: "/admin/gestion-viajes", // Debes crear esta ruta y componente
            // icon: <FaBoxOpen size={30} />, // Ejemplo con icono
            color: "#27ae60" // Verde
        },
        {
            title: "Ver Reportes",
            description: "Analizar estadísticas de ventas, usuarios y rendimiento.",
            link: "/admin/reportes", // Debes crear esta ruta y componente
            // icon: <FaChartBar size={30} />, // Ejemplo con icono
            color: "#f39c12" // Naranja
        },
        // Añade más acciones aquí
    ];

    return (
        <div className="admin-dashboard-container">
            <header className="admin-dashboard-header">
                <h1>Dashboard de Administración</h1>
                <p>Bienvenido, {user?.nombre || user?.email}! Gestiona la plataforma desde aquí.</p>
            </header>

            {/* Podrías tener una sección de estadísticas o KPIs aquí */}
            {/*
            <section className="admin-stats-overview">
                <div className="stat-card">
                    <h4>Usuarios Totales</h4>
                    <p>150</p>
                </div>
                <div className="stat-card">
                    <h4>Ventas Hoy</h4>
                    <p>$1,230</p>
                </div>
                <div className="stat-card">
                    <h4>Viajes Activos</h4>
                    <p>25</p>
                </div>
            </section>
            */}

            <section className="admin-actions-grid">
                <h2>Acciones Rápidas</h2>
                <div className="actions-wrapper">
                    {adminActions.map((action, index) => (
                        <Link to={action.link} key={index} className="action-card-link">
                            <div className="action-card" style={{ '--action-color': action.color }}>
                                <div className="action-card-icon">
                                    {/* Renderizar el icono si lo tienes */}
                                    {/* action.icon || <FaUsersCog size={30} /> */}
                                </div>
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