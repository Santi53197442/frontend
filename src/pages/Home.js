// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // <-- 1. IMPORTAR useAuth
import './Home.css';

const lugaresTuristicos = [
    {
        id: 1,
        nombre: "Colonia del Sacramento",
        descripcion: "Una ciudad histórica con calles empedradas y arquitectura colonial portuguesa y española. Su Barrio Histórico es Patrimonio de la Humanidad por la UNESCO, perfecto para perderse en el tiempo.",
        imagenUrl: process.env.PUBLIC_URL + '/images/colonia.png' // Usar PUBLIC_URL
    },
    {
        id: 2,
        nombre: "Punta del Este",
        descripcion: "Famosa por sus playas glamorosas, vida nocturna vibrante y la icónica escultura de La Mano en Playa Brava. Un destino de verano por excelencia con opciones para todos los gustos.",
        imagenUrl: process.env.PUBLIC_URL + '/images/punta_del_este.png'
    },
    {
        id: 3,
        nombre: "Montevideo",
        descripcion: "La capital del país, una ciudad llena de cultura, historia y una hermosa rambla costanera. Desde el Mercado del Puerto hasta sus teatros y museos, Montevideo ofrece una rica experiencia urbana.",
        imagenUrl: process.env.PUBLIC_URL + '/images/montevideo.png'
    },
    {
        id: 4,
        nombre: "Rocha",
        descripcion: "Un departamento conocido por sus playas vírgenes, paisajes naturales y un ambiente más rústico y tranquilo. Ideal para los amantes de la naturaleza, el surf y la desconexión.",
        imagenUrl: process.env.PUBLIC_URL + '/images/rocha.png'
    }
];


const Home = () => {
    const { user, isAuthenticated } = useAuth(); // <-- 2. OBTENER DATOS DEL USUARIO DEL CONTEXTO

    return (
        <main className="home-page-container"> {/* Clase contenedora principal para la página */}
            <section className="hero-section">
                <h1>Descubre Uruguay con Omnibus Tour</h1>
                <p>Tu aventura comienza aquí. Explora los destinos más maravillosos que nuestro país tiene para ofrecer.</p>
                {/* 3. RENDERIZADO CONDICIONAL DEL ENLACE DE ADMINISTRADOR */}
                {isAuthenticated && user && user.rol === 'administrador' && (
                    <div className="admin-home-actions">
                        <Link to="/admin/dashboard" className="admin-dashboard-button">
                            Ir al Panel de Administración
                        </Link>
                    </div>
                )}
            </section>

            <section className="lugares-section">
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
                            <div className="lugar-card-content">
                                <h3>{lugar.nombre}</h3>
                                <p>{lugar.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            {/* Aquí podrías añadir más secciones a tu página Home si quieres */}
        </main>
    );
};

export default Home;