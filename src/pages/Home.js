// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Asegúrate que esta ruta sea correcta
import './Home.css';

const lugaresTuristicos = [
    // ... (tu array de lugaresTuristicos se mantiene igual)
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

    const esCliente = isAuthenticated && user && user.rol && user.rol.toLowerCase() === 'cliente';
    const esAdmin = isAuthenticated && user && user.rol && user.rol.toLowerCase() === 'administrador';
    const esVendedor = isAuthenticated && user && user.rol && user.rol.toLowerCase() === 'vendedor';

    return (
        <main className="home-page-main-content">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Descubre Uruguay con Carpibus</h1>
                    <p className="hero-subtitle">
                        Tu aventura por los rincones más bellos del país comienza aquí.
                        Encuentra tu próximo destino y viaja con nosotros.
                    </p>
                    {/* Botones para clientes */}
                    {esCliente && (
                        <div className="cliente-actions-home"> {/* Contenedor para los botones del cliente */}
                            <Link to="/viajes" className="cta-button cliente-ver-viajes-button">
                                Ver Viajes Disponibles
                            </Link>
                            {/* NUEVO BOTÓN PARA HISTORIAL DE PASAJES */}
                            <Link to="/mis-pasajes" className="cta-button cliente-mis-pasajes-button">
                                Mis Pasajes
                            </Link>
                        </div>
                    )}
                </div>
                {/* Botones para Admin y Vendedor (si están logueados) */}
                {(esAdmin || esVendedor) && (
                    <div className="user-specific-actions">
                        {esAdmin && (
                            <Link to="/admin/dashboard" className="admin-dashboard-button">
                                Panel de Administración
                            </Link>
                        )}
                        {esVendedor && (
                            <Link to="/vendedor/dashboard" className="admin-dashboard-button">
                                Panel de Vendedor
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