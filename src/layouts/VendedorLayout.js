// src/layouts/VendedorLayout.js
import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom'; // Importa NavLink
import './VendedorLayout.css'; // Asegúrate de crear este archivo y descomentar esta línea

const VendedorLayout = () => {
    return (
        <div className="vendedor-layout">
            <header className="vendedor-header">
                <h1>Panel de Vendedor</h1>
                {/* Podrías añadir aquí un logo o el nombre del usuario si lo tienes */}
            </header>
            <div className="vendedor-main-content">
                <aside className="vendedor-sidebar">
                    <nav className="vendedor-nav">
                        {/* Usamos NavLink para estilos de enlace activo */}
                        <NavLink
                            to="/vendedor/dashboard"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/vendedor/alta-localidad"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            Alta de Localidad
                        </NavLink>
                        {/* <NavLink
                            to="/vendedor/mis-localidades"
                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        >
                            Mis Localidades
                        </NavLink> */}
                    </nav>
                </aside>
                <main className="vendedor-page-content">
                    <Outlet /> {/* Aquí se renderizarán las páginas hijas */}
                </main>
            </div>
            <footer className="vendedor-footer">
                <p>© {new Date().getFullYear()} Tu Nombre de Aplicación. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default VendedorLayout;