// src/pages/vendedor/VendedorDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Asumiendo que AuthContext está en esa ruta
import './VendedorDashboard.css'; // Crearemos este archivo

const VendedorDashboard = () => {
    const { user } = useAuth(); // Para mostrar el nombre/email del vendedor

    // Define las acciones disponibles para el Vendedor
    const vendedorActions = [
        {
            title: "Alta de Localidad",
            description: "Registrar una nueva localidad donde opera la empresa.",
            link: "/vendedor/alta-localidad",
            color: "#1abc9c" // Un color verde azulado, por ejemplo
        },
        {
            title: "Gestionar Mis Ventas",
            description: "Ver historial de ventas y gestionar transacciones.",
            link: "/vendedor/mis-ventas", // Deberás crear esta ruta y página
            color: "#3498db" // Un azul
        },
        {
            title: "Ver Horarios de Viaje",
            description: "Consultar los horarios y rutas disponibles.",
            link: "/vendedor/horarios", // Deberás crear esta ruta y página
            color: "#e67e22" // Un naranja
        },
        {
            title: "Mi Perfil",
            description: "Actualizar tu información personal y contraseña.",
            link: "/editar-perfil", // Reutilizando la ruta de edición de perfil general
            color: "#9b59b6" // Un morado
        },
    ];

    return (
        <div className="vendedor-dashboard-container">
            <header className="vendedor-dashboard-header">
                <h1>Dashboard del Vendedor</h1>
                <p>Bienvenido, {user?.nombre || user?.email}! Desde aquí puedes gestionar tus actividades.</p>
            </header>

            <section className="vendedor-actions-grid">
                <h2>Acciones Comunes</h2>
                <div className="actions-wrapper">
                    {vendedorActions.map((action, index) => (
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

            {/* Puedes añadir más secciones aquí, como un resumen de ventas recientes, notificaciones, etc. */}
            {/*
            <section className="vendedor-quick-stats">
                <h2>Estadísticas Rápidas</h2>
                <div className="stats-overview">
                    <div className="stat-card">
                        <h4>Ventas Hoy</h4>
                        <p>5</p>
                    </div>
                    <div className="stat-card">
                        <h4>Localidades Registradas</h4>
                        <p>12</p>
                    </div>
                </div>
            </section>
            */}
        </div>
    );
};

export default VendedorDashboard;