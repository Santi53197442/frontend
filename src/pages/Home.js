import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { obtenerTodasLasLocalidades } from '../services/api';
import './Home.css';
import heroBackgroundImage from './uruu.png'; // Asegúrate que esta imagen esté en src/pages/

// Esta constante se puede mover a un archivo de datos si crece mucho
const lugaresTuristicos = [
    {
        id: 1,
        nombre: "Colonia del Sacramento",
        descripcion: "Una ciudad histórica con calles empedradas y arquitectura colonial portuguesa y española. Su Barrio Histórico es Patrimonio de la Humanidad por la UNESCO.",
        imagenUrl: process.env.PUBLIC_URL + '/images/colonia.png'
    },
    {
        id: 2,
        nombre: "Punta del Este",
        descripcion: "Famosa por sus playas glamorosas, vida nocturna vibrante y la icónica escultura de La Mano en Playa Brava. Un destino de verano por excelencia.",
        imagenUrl: process.env.PUBLIC_URL + '/images/punta_del_este.png'
    },
    {
        id: 3,
        nombre: "Montevideo",
        descripcion: "La capital del país, una ciudad llena de cultura, historia y una hermosa rambla costanera. Ofrece una rica experiencia urbana.",
        imagenUrl: process.env.PUBLIC_URL + '/images/montevideo.png'
    },
    {
        id: 4,
        nombre: "Cabo Polonio",
        descripcion: "Un pueblo bohemio y rústico entre dunas, famoso por su faro, la reserva de lobos marinos y su ambiente desconectado sin electricidad.",
        imagenUrl: process.env.PUBLIC_URL + '/images/cabo_polonio.png'
    },
    {
        id: 5,
        nombre: "Punta del Diablo",
        descripcion: "Pueblo de pescadores con un encanto rústico, playas ideales para el surf y un ambiente relajado. Atrae a visitantes que buscan tranquilidad y naturaleza.",
        imagenUrl: process.env.PUBLIC_URL + '/images/punta_del_diablo.png'
    },
    {
        id: 6,
        nombre: "Piriápolis",
        descripcion: "Encantadora ciudad balnearia con una hermosa rambla y cerros con vistas panorámicas como el Cerro San Antonio. Ofrece una mezcla de historia y playa.",
        imagenUrl: process.env.PUBLIC_URL + '/images/piriapolis.png'
    }
];

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Estados para el formulario de búsqueda
    const [origenId, setOrigenId] = useState('');
    const [destinoId, setDestinoId] = useState('');
    const [fecha, setFecha] = useState('');
    const [pasajeros, setPasajeros] = useState(1);
    const [localidades, setLocalidades] = useState([]);
    const [errorFormulario, setErrorFormulario] = useState('');

    useEffect(() => {
        const cargarLocalidades = async () => {
            try {
                const response = await obtenerTodasLasLocalidades();
                setLocalidades(response.data || []);
            } catch (err) {
                console.error("Error al cargar las localidades:", err);
                setErrorFormulario('No se pudieron cargar los destinos.');
            }
        };
        cargarLocalidades();
    }, []); // Se ejecuta solo una vez al montar el componente

    // Maneja el envío del formulario de búsqueda
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!origenId || !destinoId || !fecha) {
            alert('Por favor, complete los campos de Origen, Destino y Fecha.');
            return;
        }
        // Construye los parámetros de búsqueda para la URL
        const queryParams = new URLSearchParams({ origenId, destinoId, fecha, pasajeros });
        navigate(`/viajes?${queryParams.toString()}`);
    };

    // Detectar roles para mostrar enlaces a los paneles de control
    const esAdmin = isAuthenticated && user?.rol?.toLowerCase() === 'administrador';
    const esVendedor = isAuthenticated && user?.rol?.toLowerCase() === 'vendedor';

    const heroStyle = {
        backgroundImage: `linear-gradient(rgba(45, 34, 107, 0.7), rgba(45, 34, 107, 0.8)), url(${heroBackgroundImage})`
    };

    // Función para obtener la fecha mínima para el input (hoy)
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <main className="home-page-main-content">
            <section className="hero-section" style={heroStyle}>
                <div className="hero-content">
                    <h1 className="hero-title-main">Comprá tus pasajes online acá.</h1>

                    <form className="search-form-home" onSubmit={handleSearchSubmit}>
                        <div className="form-group-home">
                            <label htmlFor="origen">Origen</label>
                            <select id="origen" value={origenId} onChange={(e) => setOrigenId(e.target.value)} required>
                                <option value="" disabled>Seleccione origen...</option>
                                {localidades.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-home">
                            <label htmlFor="destino">Destino</label>
                            <select id="destino" value={destinoId} onChange={(e) => setDestinoId(e.target.value)} required>
                                <option value="" disabled>Seleccione destino...</option>
                                {localidades
                                    // Filtra el origen seleccionado de la lista de destinos
                                    .filter(loc => loc.id !== parseInt(origenId))
                                    .map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group-home">
                            <label htmlFor="fecha">Fecha</label>
                            <input
                                type="date"
                                id="fecha"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                min={getTodayDate()} // Evita que se seleccionen fechas pasadas
                                required
                            />
                        </div>

                        <div className="form-group-home form-group-pasajeros">
                            <label htmlFor="pasajeros">Pasajeros</label>
                            <input
                                type="number"
                                id="pasajeros"
                                value={pasajeros}
                                onChange={(e) => setPasajeros(e.target.value)}
                                min="1"
                                max="10"
                                required
                            />
                        </div>

                        <button type="submit" className="search-button-home">
                            <i className="fa fa-search" aria-hidden="true"></i>
                            Buscar
                        </button>
                    </form>
                    {errorFormulario && <p className="error-message">{errorFormulario}</p>}

                    <p className="hero-subtitle">
                        Descubre Uruguay con Carpibus. Tu aventura por los rincones más bellos del país comienza aquí.
                    </p>
                </div>

                {/* Enlaces a los paneles de control para Admin y Vendedor */}
                {(esAdmin || esVendedor) && (
                    <div className="user-specific-actions">
                        {esAdmin && <Link to="/admin/dashboard" className="admin-dashboard-button">Panel de Administración</Link>}
                        {esVendedor && <Link to="/vendedor/dashboard" className="admin-dashboard-button">Panel de Vendedor</Link>}
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
                                    <img src={lugar.imagenUrl} alt={lugar.nombre} className="lugar-imagen" />
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