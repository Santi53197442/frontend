// src/components/Menu.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // NavLink para estilos activos
import { useAuth } from '../AuthContext';
import './Menu.css'; // Asume que tienes un Menu.css

const logoUrl = process.env.PUBLIC_URL + '/images/logo-omnibus.png'; // O tu ruta al logo

const Menu = () => {
    const { user, isAuthenticated, logout } = useAuth();

    // No renderizar el menú si no está autenticado, o mostrar un menú diferente
    // if (!isAuthenticated) {
    //     return null; // O un menú para usuarios no logueados
    // }

    return (
        <header className="app-header">
            <Link to="/" className="logo-link">
                <img src={logoUrl} alt="Omnibus Logo" className="app-logo" />
            </Link>
            <nav className="main-nav">
                {isAuthenticated && user ? (
                    <>
                        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Inicio</NavLink>

                        {/* Enlaces específicos por rol */}
                        {user.rol === 'administrador' && (
                            <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Dashboard Admin</NavLink>
                        )}
                        {user.rol === 'administrador' && (
                            <NavLink to="/admin/gestion-usuarios" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Usuarios</NavLink>
                        )}

                        {user.rol === 'vendedor' && (
                            <NavLink to="/vendedor/panel" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Panel Vendedor</NavLink>
                        )}
                        {user.rol === 'vendedor' && (
                            <NavLink to="/vendedor/productos" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mis Productos</NavLink>
                        )}

                        {/* Enlaces comunes para usuarios logueados */}
                        {(user.rol === 'cliente' || user.rol === 'vendedor' || user.rol === 'administrador') && (
                            <NavLink to="/mis-reservas" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mis Reservas</NavLink>
                        )}
                        <NavLink to="/editar-perfil" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Mi Perfil</NavLink>

                        <button onClick={logout} className="nav-item logout-button">Cerrar Sesión ({user.email})</button>
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