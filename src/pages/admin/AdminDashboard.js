// src/pages/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Ajusta la ruta
import './AdminDashboard.css';
// No necesitas importar UserBatchUpload aquí ahora

const AdminDashboard = () => {
    const { user } = useAuth();

    const adminActions = [
        {
            title: "Crear Usuario",
            description: "Añadir nuevos administradores o vendedores individualmente.",
            link: "/admin/crear-usuario",
            color: "#2980b9"
        },
        // === NUEVA ACCIÓN PARA CARGA MASIVA ===
        {
            title: "Carga Masiva de Usuarios",
            description: "Subir un archivo CSV para crear múltiples usuarios.",
            link: "/admin/carga-masiva-usuarios", // Enlace a la nueva ruta
            color: "#8e44ad" // Morado, por ejemplo
        },
        // =====================================
        {
            title: "Gestionar Viajes",
            description: "Configurar rutas, horarios y disponibilidad de viajes.",
            link: "/admin/gestion-viajes",
            color: "#27ae60"
        },
        {
            title: "Ver Reportes",
            description: "Analizar estadísticas de ventas, usuarios y rendimiento.",
            link: "/admin/reportes",
            color: "#f39c12"
        },
    ];

    return (
        <div className="admin-dashboard-container">
            <header className="admin-dashboard-header">
                <h1>Dashboard de Administración</h1>
                <p>Bienvenido, {user?.nombre || user?.email}! Gestiona la plataforma desde aquí.</p>
            </header>

            <section className="admin-actions-grid">
                <h2>Acciones Rápidas</h2>
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

            {/* La sección de carga masiva ya no estará aquí directamente */}
        </div>
    );
};

export default AdminDashboard;