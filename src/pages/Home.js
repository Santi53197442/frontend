// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const lugaresTuristicos = [
    {
        id: 1,
        nombre: "Colonia del Sacramento",
        descripcion: "Una ciudad histórica con calles empedradas y arquitectura colonial portuguesa y española. Su Barrio Histórico es Patrimonio de la Humanidad por la UNESCO, perfecto para perderse en el tiempo.",
        imagenUrl: '/images/colonia.png'
    },
    {
        id: 2,
        nombre: "Punta del Este",
        descripcion: "Famosa por sus playas glamorosas, vida nocturna vibrante y la icónica escultura de La Mano en Playa Brava. Un destino de verano por excelencia con opciones para todos los gustos.",
        imagenUrl: '/images/punta-del-este.png'
    },
    {
        id: 3,
        nombre: "Montevideo",
        descripcion: "La capital del país, una ciudad llena de cultura, historia y una hermosa rambla costanera. Desde el Mercado del Puerto hasta sus teatros y museos, Montevideo ofrece una rica experiencia urbana.",
        imagenUrl: '/images/montevideo.png'
    },
    {
        id: 4,
        nombre: "Rocha",
        descripcion: "Un departamento conocido por sus playas vírgenes, paisajes naturales y un ambiente más rústico y tranquilo. Ideal para los amantes de la naturaleza, el surf y la desconexión.",
        imagenUrl: '/images/rocha.png'
    }
];

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                {/* Ya no hay imagen de cabecera aquí */}
                <div className="header-content">
                    <h1>Descubre Uruguay</h1>
                    <p>Explora los destinos más encantadores de nuestro país.</p>
                    <nav className="home-nav">
                        <Link to="/login" className="nav-button">Iniciar Sesión</Link>
                        <Link to="/register" className="nav-button">Registrarse</Link>
                        <Link to="/menu" className="nav-button">Ir al Menú (Protegido)</Link>
                    </nav>
                </div>
            </header>

            <main className="lugares-section">
                <h2>Lugares Turísticos Destacados</h2>
                <div className="lugares-grid">
                    {lugaresTuristicos.map((lugar) => (
                        <div key={lugar.id} className="lugar-card">
                            {lugar.imagenUrl && (
                                <img
                                    src={lugar.imagenUrl}
                                    alt={lugar.nombre}
                                    className="lugar-imagen"
                                />
                            )}
                            <h3>{lugar.nombre}</h3>
                            <p>{lugar.descripcion}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="home-footer">
                <p>© {new Date().getFullYear()} TuAppDeViajes. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Home;