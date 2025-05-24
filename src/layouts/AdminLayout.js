// src/layouts/AdminLayout.js
import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom'; // NavLink para estilos activos
import './AdminLayout.css'; // Tus estilos para el layout

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                {/* ... (sidebar-header) ... */}
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                {/* <i className="icon fas fa-tachometer-alt"></i> */}
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/crear-usuario" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                {/* <i className="icon fas fa-user-plus"></i> */}
                                <span>Crear Usuario</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/carga-masiva-usuarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                {/* <i className="icon fas fa-upload"></i> */}
                                <span>Carga Masiva</span>
                            </NavLink>
                        </li>
                        {/* === NUEVO ENLACE PARA LISTA DE USUARIOS === */}
                        <li>
                            <NavLink to="/admin/lista-usuarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                {/* <i className="icon fas fa-users"></i> */}
                                <span>Lista de Usuarios</span>
                            </NavLink>
                        </li>
                        {/* ========================================== */}
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;