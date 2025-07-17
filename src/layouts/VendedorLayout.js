// src/layouts/VendedorLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './VendedorLayout.css'; // Asegúrate de crear y poblar este archivo CSS

// Iconos (puedes usar los mismos que en AdminLayout o personalizarlos)
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

const VendedorLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Opcional: cerrar el menú si se hace clic en un enlace
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
        <div className={`vendedor-layout ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            {/* Botón de Hamburguesa para Móviles */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <aside className={`vendedor-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/vendedor/dashboard" className="sidebar-logo-link" onClick={handleNavLinkClick}>
                        <h3>Panel Vendedor</h3>
                    </NavLink>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <NavLink to="/vendedor/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/alta-localidad" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Alta de localidad</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/alta-masiva-localidades" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Alta masiva de localidades (CSV)</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/alta-omnibus" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Alta de ómnibus</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/alta-masiva-omnibus" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Alta masiva de ómnibus (CSV)</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/listar-omnibus" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Listado de ómnibus</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/cambiar-a-inactivo" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Marcar ómnibus como inactivo</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/cambiar-a-activo" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Marcar ómnibus como activo</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/alta-viaje" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Alta de nuevo viaje</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/reasignar-viaje" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Reasignación de un viaje</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/listar-viajes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Listado de viajes por ómnibus</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/vendedor/listar-viajes-compra" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={handleNavLinkClick}>
                                <span>Venta de pasaje</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/pasajes-por-viaje" // Nueva ruta para el componente unificado
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={handleNavLinkClick}
                            >
                                <span>Listado de pasajes vendidos por viaje</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/gestion-devoluciones"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={handleNavLinkClick}
                            >
                                <span>Gestión de devoluciones</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/estadisticas-viaje"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={handleNavLinkClick}
                            >
                                <span>Estadísticas de viajes</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/estadisticas-omnibus"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={handleNavLinkClick}
                            >
                                <span>Estadísticas de ómnibus</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/vendedor/estadisticas-ventas"
                                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                onClick={handleNavLinkClick}
                            >
                                <span>Estadísticas de ventas</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <p>© {new Date().getFullYear()} TuApp</p>
                </div>
            </aside>
            <main className="vendedor-content">
                <Outlet />
            </main>
        </div>
    );
};

export default VendedorLayout;