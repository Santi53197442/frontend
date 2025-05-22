// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Asumiendo que tu AuthContext está aquí
import './Header.css'; // Crearemos este archivo para los estilos

// Asume que tienes un logo en public/images/logo.png o similar
const logoUrl = '/images/logo-omnibus.png'; // Cambia esto a la ruta de tu logo

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false); // Cierra el menú de usuario
        navigate('/login');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    // Cierra los menús si se hace clic fuera de ellos (opcional pero buena UX)
    // Esto es un ejemplo simple, podrías necesitar algo más robusto para producción
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest('.main-menu-button-container')) {
                setMenuOpen(false);
            }
            if (userMenuOpen && !event.target.closest('.user-actions')) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen, userMenuOpen]);


    return (
        <header className="app-header">
            <div className="header-left">
                <Link to="/" className="logo-link">
                    <img src={logoUrl} alt="Logo Sistema" className="logo-image" />
                    <h1>Sistema de Ómnibus</h1>
                </Link>
            </div>

            <div className="header-right">
                {isAuthenticated && user ? (
                    <div className="user-actions">
                        <button onClick={toggleUserMenu} className="user-menu-button">
                            Bienvenido, {user.email || 'Usuario'} {/* Asume que user.email existe */}
                            <span className={`arrow ${userMenuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        {userMenuOpen && (
                            <div className="dropdown-menu user-dropdown">
                                {/* <Link to="/perfil" onClick={() => setUserMenuOpen(false)}>Mi Perfil</Link> */}
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

                {/* Menú principal si es necesario (como el de la imagen) */}
                {isAuthenticated && ( // Solo muestra el menú si está autenticado
                    <div className="main-menu-button-container">
                        <button onClick={toggleMenu} className="main-menu-button">
                            Menú <span className={`arrow ${menuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        {menuOpen && (
                            <div className="dropdown-menu main-dropdown">
                                <Link to="/crear-usuario" onClick={() => setMenuOpen(false)}>Crear Usuario</Link>
                                <Link to="/eliminar-usuario" onClick={() => setMenuOpen(false)}>Eliminar Usuario</Link>
                                <Link to="/listar-usuarios" onClick={() => setMenuOpen(false)}>Listar Usuarios</Link>
                                {/* Más opciones del menú aquí */}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;