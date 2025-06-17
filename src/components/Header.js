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
        setUserMenuOpen(false);
    };

    const toggleMainMenu = () => {
        setMainMenuOpen(!mainMenuOpen);
        setUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        setMainMenuOpen(false);
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
        if (user?.nombre && user?.apellido && user.nombre !== "null" && user.apellido !== "null") {
            return `${user.nombre} ${user.apellido}`;
        }
        return user?.email || 'Usuario';
    };

    const esCliente = isAuthenticated && user?.rol?.toLowerCase() === 'cliente';
    const esAdmin = isAuthenticated && user?.rol?.toLowerCase() === 'administrador';

    return (
        <header className="app-header">
            {/* Div agrupador para la parte izquierda y central */}
            <div className="header-main-nav">
                <div className="header-left">
                    <Link to="/" className="logo-link">
                        <img src={logoUrl} alt="Logo Sistema" className="logo-image" />
                        <h1>Sistema de Ómnibus</h1>
                    </Link>
                </div>

                <nav className="header-center-nav">
                    {/* Botón público */}
                    <Link to="/tarifas-horarios" className="header-nav-button">Tarifas y Horarios</Link>

                    {/* Botones solo para clientes logueados */}
                    {esCliente && (
                        <Link to="/mis-pasajes" className="header-nav-button">Mis Pasajes</Link>
                    )}
                </nav>
            </div>

            {/* Contenedor para la parte derecha, que será empujado por el layout */}
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

                {esAdmin && (
                    <div className="main-menu-button-container" ref={mainMenuRef}>
                        <button onClick={toggleMainMenu} className="main-menu-button">
                            Menú Admin <span className={`arrow ${mainMenuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        {mainMenuOpen && (
                            <div className="dropdown-menu main-dropdown">
                                <Link to="/crear-usuario" onClick={() => setMainMenuOpen(false)}>Crear Usuario</Link>
                                <Link to="/eliminar-usuario" onClick={() => setMainMenuOpen(false)}>Eliminar Usuario</Link>
                                <Link to="/listar-usuarios" onClick={() => setMainMenuOpen(false)}>Listar Usuarios</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;