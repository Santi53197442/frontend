// src/layouts/AdminLayout.js
import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom'; // NavLink para estilos activos
import './AdminLayout.css'; // Tus estilos para el layout

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Panel de Admin</h3>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/crear-usuario" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Crear Usuario
                            </NavLink>
                        </li>
                        {/* === ENLACE PARA CARGA MASIVA EN SIDEBAR === */}
                        <li>
                            <NavLink to="/admin/carga-masiva-usuarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Carga Masiva
                            </NavLink>
                        </li>
                        {/* ========================================== */}
                        {/* Otros enlaces */}
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet /> {/* Aquí se renderizarán las rutas hijas (Dashboard, CrearUsuario, CargaMasiva, etc.) */}
            </main>
        </div>
    );
};

export default AdminLayout;