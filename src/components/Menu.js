// src/components/Menu.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Menu.css'; // Asume que tienes un Menu.css

const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png';

const Menu = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="app-header">
            <Link to="/" className="logo-link">
                <img src={logoUrl} alt="Omnibus Logo" className="app-logo" />
            </Link>
            <nav className="main-nav">
                {isAuthenticated && user ? ( // Menú para usuarios autenticados
                    <>
                        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Inicio</NavLink>

                        {/* Enlaces específicos por rol */}
                        {user.rol === 'administrador' && (
                            <>
                                {/* <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Dashboard Admin</NavLink> */}
                                {/* <NavLink to="/admin/gestion-usuarios" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Gestionar Usuarios</NavLink> */}
                                <NavLink to="/admin/crear-usuario" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Crear Admin/Vendedor</NavLink> {/* <-- NUEVO ENLACE */}
                            </>
                        )}

                        {user.rol === 'vendedor' && (
                            <>
                                {/* <NavLink to="/vendedor/panel" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Panel Vendedor</NavLink> */}
                                {/* <NavLink to="/vendedor/mis-productos" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mis Productos</NavLink> */}
                            </>
                        )}

                        {/* Enlaces comunes para usuarios logueados (ejemplo) */}
                        {/* <NavLink to="/mis-reservas" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mis Reservas</NavLink> */}
                        <NavLink to="/editar-perfil" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mi Perfil</NavLink>

                        <div className="user-info-logout">
                            <span className="user-email-display">({user.email} - {user.rol})</span>
                            <button onClick={logout} className="nav-item logout-button">Cerrar Sesión</button>
                        </div>
                    </>
                ) : ( // Menú para usuarios NO autenticados
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