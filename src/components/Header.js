// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Header.css';

const logoUrl = '/images/logo-omnibus.png'; // Asegúrate que esta ruta sea correcta

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mainMenuOpen, setMainMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const mainMenuRef = useRef(null);
    const userMenuRef = useRef(null);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false); // También cierra el menú de usuario al hacer logout
    };

    const toggleMainMenu = () => {
        setMainMenuOpen(!mainMenuOpen);
        setUserMenuOpen(false); // Cierra el otro menú si está abierto
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        setMainMenuOpen(false); // Cierra el otro menú si está abierto
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mainMenuRef.current && !mainMenuRef.current.contains(event.target)) {
                setMainMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getDisplayName = () => {
        if (user && user.nombre && user.apellido && user.nombre !== "null" && user.apellido !== "null") {
            return `${user.nombre} ${user.apellido}`;
        } else if (user && user.email) {
            return user.email;
        }
        return 'Usuario';
    };

    return (
        <header className="app-header">
            <div className="header-left">
                {/* Mantengo el comportamiento original del logo que tenías */}
                <Link to={isAuthenticated ? (user?.rol === 'admin' ? "/menu" : "/") : "/"} className="logo-link">
                    <img src={logoUrl} alt="Logo Sistema" className="logo-image" />
                    <h1>Sistema de Ómnibus</h1>
                </Link>
            </div>

            <div className="header-right">
                {isAuthenticated && user ? (
                    <div className="user-actions" ref={userMenuRef}>
                        <button onClick={toggleUserMenu} className="user-menu-button">
                            {getDisplayName()}
                            <span className={`arrow ${userMenuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        {userMenuOpen && (
                            <div className="dropdown-menu user-dropdown">
                                <Link to="/editar-perfil" onClick={() => setUserMenuOpen(false)}>Editar Mis Datos</Link>
                                {/* --- ENLACE A CAMBIAR CONTRASEÑA AÑADIDO AQUÍ --- */}
                                <Link to="/cambiar-contraseña" onClick={() => setUserMenuOpen(false)}>Cambiar Contraseña</Link>
                                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-links">
                        <Link to="/login" className="header-nav-button">Iniciar Sesión</Link>
                        <Link to="/register" className="header-nav-button register">Registrarse</Link>
                    </div>
                )}

                {/* Menú principal (ej. para admin) - Mantenido como lo tenías */}
                {isAuthenticated && user && user.rol === 'admin' && (
                    <div className="main-menu-button-container" ref={mainMenuRef}>
                        <button onClick={toggleMainMenu} className="main-menu-button">
                            Menú Admin <span className={`arrow ${mainMenuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        {mainMenuOpen && (
                            <div className="dropdown-menu main-dropdown">
                                <Link to="/crear-usuario" onClick={() => setMainMenuOpen(false)}>Crear Usuario</Link>
                                <Link to="/eliminar-usuario" onClick={() => setMainMenuOpen(false)}>Eliminar Usuario</Link>
                                <Link to="/listar-usuarios" onClick={() => setMainMenuOpen(false)}>Listar Usuarios</Link>
                                {/* Agrega aquí más enlaces para el admin si es necesario */}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;