// src/layouts/VendedorLayout.js
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom'; // NavLink para estilos activos
import './VendedorLayout.css'; // Asegúrate de crear este archivo y que la ruta sea correcta

const VendedorLayout = () => {
    return (
        <div className="vendedor-layout">
            <aside className="vendedor-sidebar">
                <div className="sidebar-header">
                    {/* Podrías poner un logo o un título más genérico si es multimarca */}
                    <NavLink to="/vendedor/dashboard" className="sidebar-logo-link">
                        <h3>Panel Vendedor</h3>
                    </NavLink>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink
                                to="/vendedor/dashboard"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                {/* <i className="icon fas fa-tachometer-alt"></i>  Si usas Font Awesome */}
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/alta-localidad"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                {/* <i className="icon fas fa-map-marker-alt"></i> */}
                                <span>Alta de Localidad</span>
                            </NavLink>
                        </li>
                        {/* Ejemplo de otros enlaces que podrías tener */}
                        <li>
                            <NavLink
                                to="/vendedor/mis-ventas" // Necesitarás crear esta ruta/página
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                {/* <i className="icon fas fa-dollar-sign"></i> */}
                                <span>Mis Ventas</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/horarios" // Necesitarás crear esta ruta/página
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                {/* <i className="icon fas fa-clock"></i> */}
                                <span>Consultar Horarios</span>
                            </NavLink>
                        </li>
                        {/* Separador opcional si tienes muchas secciones */}
                        {/* <li className="menu-separator-container"><hr className="menu-separator" /></li> */}
                        <li>
                            <NavLink
                                to="/editar-perfil" // Ruta general de edición de perfil
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                            >
                                {/* <i className="icon fas fa-user-edit"></i> */}
                                <span>Editar Perfil</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    {/* Podrías poner un enlace de "Cerrar Sesión" o info del usuario aquí */}
                    <p>© {new Date().getFullYear()} TuApp</p>
                </div>
            </aside>
            <main className="vendedor-content">
                <Outlet /> {/* Aquí se renderizarán las rutas hijas */}
            </main>
        </div>
    );
};

export default VendedorLayout;