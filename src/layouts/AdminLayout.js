// src/layouts/AdminLayout.js
import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Ajusta la ruta si es necesario
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>; // O un spinner más elaborado
    }

    // Doble chequeo, aunque ProtectedRoute debería prevenir acceso no autorizado
    if (!isAuthenticated || !user || user.rol !== 'administrador') {
        console.warn("Intento de acceso no autorizado a AdminLayout o usuario no es admin.");
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h3>Panel de Admin</h3>
                <nav className="admin-sidebar-nav">
                    <ul>
                        <li>
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/crear-usuario"
                                className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}
                            >
                                Crear Usuario
                            </NavLink>
                        </li>
                        {/* Ejemplo de más enlaces de administración
                        <li>
                            <NavLink
                                to="/admin/gestion-viajes"
                                className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}
                            >
                                Gestionar Viajes
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/reportes"
                                className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}
                            >
                                Reportes
                            </NavLink>
                        </li>
                        */}
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet /> {/* Aquí se renderizarán las rutas hijas */}
            </main>
        </div>
    );
};

export default AdminLayout;