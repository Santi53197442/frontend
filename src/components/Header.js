// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react'; // Importa useRef
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Header.css';

const logoUrl = '/images/logo-omnibus.png'; // Cambia esto a la ruta de tu logo si es diferente

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mainMenuOpen, setMainMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Referencias a los menús para detectar clics fuera
    const mainMenuRef = useRef(null);
    const userMenuRef = useRef(null);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        // navigate('/login'); // logout ya navega
    };

    const toggleMainMenu = () => {
        setMainMenuOpen(!mainMenuOpen);
        setUserMenuOpen(false); // Cierra el otro menú si está abierto
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        setMainMenuOpen(false); // Cierra el otro menú si está abierto
    };

    // Hook para cerrar menús al hacer clic fuera
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
    }, []); // Solo se ejecuta al montar y desmontar

    const getDisplayName = () => {
        if (user && user.nombre && user.apellido && user.nombre !== "null" && user.apellido !== "null") {
            // Verifica que no sean la cadena "null" si localStorage guarda "null" como string
            return `${user.nombre} ${user.apellido}`;
        } else if (user && user.email) {
            return user.email;
        }
        return 'Usuario'; // Fallback si no hay datos o el usuario es null
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <Link to={isAuthenticated ? (user?.rol === 'admin' ? "/menu" : "/home-cliente") : "/"} className="logo-link">
                    <img src={logoUrl} alt="Logo Sistema" className="logo-image" />
                    <h1>Sistema de Ómnibus</h1>
                </Link>
            </div>

            <div className="header-right">
                {isAuthenticated && user ? (
                    <div className="user-actions" ref={userMenuRef}> {/* Añade ref */}
                        <button onClick={toggleUserMenu} className="user-menu-button">
                            {getDisplayName()}
                            <span className={`arrow ${userMenuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        {userMenuOpen && (
                            <div className="dropdown-menu user-dropdown">
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

                {/* Menú principal (ej. para admin) */}
                {isAuthenticated && user && user.rol === 'admin' && (
                    <div className="main-menu-button-container" ref={mainMenuRef}> {/* Añade ref */}
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