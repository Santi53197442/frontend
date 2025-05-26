// src/pages/vendedor/VendedorListarOmnibusPage.js
import React, { useState, useEffect } from 'react';
import { obtenerTodosLosOmnibus } from '../../services/api'; // Ajusta la ruta a tu api.js
import './VendedorListarOmnibusPage.css'; // Crea este archivo CSS para estilos

const VendedorListarOmnibusPage = () => {
    const [omnibusLista, setOmnibusLista] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarOmnibus = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await obtenerTodosLosOmnibus();
                setOmnibusLista(response.data || []); // Asumimos que la lista está en response.data
            } catch (err) {
                console.error("Error cargando la lista de ómnibus:", err);
                setError(err.response?.data?.message || "No se pudo cargar la lista de ómnibus. Intente más tarde.");
                setOmnibusLista([]); // Limpiar en caso de error
            } finally {
                setIsLoading(false);
            }
        };

        cargarOmnibus();
    }, []); // El array vacío asegura que se ejecute solo al montar el componente

    if (isLoading) {
        return <div className="loading-container"><p className="loading-message">Cargando ómnibus...</p></div>;
    }

    if (error) {
        return <div className="error-container"><p className="mensaje-error">{error}</p></div>;
    }

    return (
        <div className="vendedor-listar-omnibus-page">
            <header className="page-header">
                <h2>Listado de Ómnibus Registrados</h2>
            </header>

            {omnibusLista.length === 0 ? (
                <p className="mensaje-informativo">No hay ómnibus registrados en el sistema.</p>
            ) : (
                <section className="tabla-omnibus-container">
                    <table className="tabla-omnibus">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Matrícula</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Capacidad</th>
                            <th>Estado</th>
                            <th>Localidad Actual</th>
                            {/* Podrías añadir más columnas o acciones aquí */}
                        </tr>
                        </thead>
                        <tbody>
                        {omnibusLista.map((omnibus) => (
                            <tr key={omnibus.id}>
                                <td>{omnibus.id}</td>
                                <td>{omnibus.matricula}</td>
                                <td>{omnibus.marca}</td>
                                <td>{omnibus.modelo}</td>
                                <td>{omnibus.capacidadAsientos}</td>
                                <td>{omnibus.estado}</td>
                                {/* Asumimos que 'localidadActual' es un objeto con 'nombre' */}
                                <td>{omnibus.localidadActual ? omnibus.localidadActual.nombre : 'N/A'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}
        </div>
    );
};

export default VendedorListarOmnibusPage;