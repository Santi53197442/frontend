// src/layouts/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './AdminLayout.css'; // Tus estilos para el layout

// Un simple icono de hamburguesa (puedes usar SVGs o una librería de iconos)
const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


const AdminLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Opcional: cerrar el menú si se hace clic en un enlace (para SPA)
    const handleNavLinkClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    // Opcional: cerrar el menú si se redimensiona la ventana a un tamaño mayor
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMobileMenuOpen) { // 768px es un breakpoint común
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileMenuOpen]);


    return (
        <div className={`admin-layout ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            {/* Botón de Hamburguesa para Móviles */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Panel de admin</h3>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/crear-usuario" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                Alta individual de usuario
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/carga-masiva-usuarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                Alta masiva de usuarios (CSV)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/listar-usuarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                Listado de usuarios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/eliminar-usuarios" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                Baja de usuario
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/admin/estadisticas-usuarios"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={handleNavLinkClick}
                            >
                                <span>Estadísticas de usuarios</span>
                            </NavLink>
                        </li>
                        {/* Otros enlaces */}
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