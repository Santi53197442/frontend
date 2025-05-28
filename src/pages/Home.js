// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css'; // Asegúrate que esta importación exista y sea correcta

const lugaresTuristicos = [
    {
        id: 1,
        nombre: "Colonia del Sacramento",
        descripcion: "Una ciudad histórica con calles empedradas y arquitectura colonial portuguesa y española. Su Barrio Histórico es Patrimonio de la Humanidad por la UNESCO, perfecto para perderse en el tiempo.",
        imagenUrl: process.env.PUBLIC_URL + '/images/colonia.png'
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
        nombre: "Cabo Polonio",
        descripcion: "Un pueblo bohemio y rústico entre dunas, famoso por su faro, la reserva de lobos marinos y su ambiente desconectado sin electricidad. Una experiencia única en la costa de Rocha.",
        imagenUrl: process.env.PUBLIC_URL + '/images/cabo_polonio.png'
    },
    {
        id: 5,
        nombre: "Punta del Diablo",
        descripcion: "Pueblo de pescadores con un encanto rústico, playas ideales para el surf y un ambiente relajado. Sus casas coloridas y su estilo bohemio atraen a visitantes que buscan tranquilidad y naturaleza.",
        imagenUrl: process.env.PUBLIC_URL + '/images/punta_del_diablo.png'
    },
    {
        id: 6,
        nombre: "Piriápolis",
        descripcion: "Encantadora ciudad balnearia fundada por Francisco Piria, con una hermosa rambla, cerros con vistas panorámicas (como el Cerro San Antonio) y el místico Castillo de Piria. Ofrece una mezcla de historia y playa.",
        imagenUrl: process.env.PUBLIC_URL + '/images/piriapolis.png'
    }
];

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <main className="home-page-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Descubre Uruguay con Carpibus</h1>
                </div>
                {isAuthenticated && user && (
                    <div className="admin-home-actions"> {/* Puedes renombrar esta clase si es más general */}
                        {user.rol === 'administrador' && (
                            <Link to="/admin/dashboard" className="admin-dashboard-button">
                                Ir al Panel de Administración
                            </Link>
                        )}
                        {user.rol === 'vendedor' && (
                            <Link to="/vendedor/dashboard" className="admin-dashboard-button"> {/* Puedes usar la misma clase o crear una nueva si el estilo es diferente */}
                                Ir al Panel de Vendedor
                            </Link>
                        )}
                    </div>
                )}
            </section>

            <section className="lugares-section">
                <h2 className="section-title">Lugares Turísticos Destacados</h2>
                <div className="lugares-grid">
                    {lugaresTuristicos.map((lugar) => (
                        <div key={lugar.id} className="lugar-card">
                            {lugar.imagenUrl && (
                                <div className="lugar-imagen-container">
                                    <img
                                        src={lugar.imagenUrl}
                                        alt={lugar.nombre}
                                        className="lugar-imagen"
                                    />
                                </div>
                            )}
                            <div className="lugar-card-content">
                                <h3>{lugar.nombre}</h3>
                                <p>{lugar.descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Home;