// src/components/Menu.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Menu.css'; // Asume que tienes un Menu.css para este header

const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png';

const Menu = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="app-header">
            <Link to="/" className="logo-link">
                <img src={logoUrl} alt="Omnibus Logo" className="app-logo" />
                <span className="app-title">Omnibus Tour</span> {/* Opcional: Nombre de la App */}
            </Link>
            <nav className="main-nav">
                {isAuthenticated && user ? (
                    <>
                        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Inicio</NavLink>

                        {user.rol === 'administrador' && (
                            <NavLink
                                to="/admin/dashboard" // Enlace a la entrada del panel de admin
                                className={({isActive}) => {
                                    // Considerar activo si está en cualquier ruta /admin/*
                                    const isAdminRoute = window.location.pathname.startsWith('/admin');
                                    return isActive || isAdminRoute ? "nav-item active" : "nav-item";
                                }}
                            >
                                Panel Admin
                            </NavLink>
                        )}
                        {/* Aquí podrías tener un enlace similar para Vendedores si tienen su propio panel */}
                        {/* {user.rol === 'vendedor' && (
                            <NavLink to="/vendedor/panel" className={...}>Panel Vendedor</NavLink>
                        )} */}

                        <NavLink to="/editar-perfil" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mi Perfil</NavLink>

                        <div className="user-info-logout">
                            <span className="user-email-display">
                                {user.nombre || user.email} ({user.rol})
                            </span>
                            <button onClick={logout} className="nav-item logout-button">Cerrar Sesión</button>
                        </div>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Iniciar Sesión</NavLink>
                        <NavLink to="/register" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Registrarse</NavLink>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Menu;