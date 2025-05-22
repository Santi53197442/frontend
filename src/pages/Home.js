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
        imagenUrl: '/images/punta_del_este.png'
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
        // ... (header se mantiene)
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
                        <div className="lugar-card-content"> {/* <<-- NUEVO DIV ENVOLVENTE */}
                            <h3>{lugar.nombre}</h3>
                            <p>{lugar.descripcion}</p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
        // ... (footer se mantiene)
    );
};

export default Home;