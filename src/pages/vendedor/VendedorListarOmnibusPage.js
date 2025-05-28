import React, { useState, useEffect, useMemo } from 'react';
import { obtenerTodosLosOmnibus } from '../../services/api'; // Ajusta la ruta
import './VendedorListarOmnibusPage.css'; // Asegúrate de crear y poblar este archivo CSS

const VendedorListarOmnibusPage = () => {
    const [omnibusLista, setOmnibusLista] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' }); // 'id', 'matricula', 'marca', 'modelo', 'capacidadAsientos', 'estado', 'localidadActual.nombre'

    useEffect(() => {
        const cargarOmnibus = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await obtenerTodosLosOmnibus();
                setOmnibusLista(response.data || []);
            } catch (err) {
                console.error("Error cargando la lista de ómnibus:", err);
                setError(err.response?.data?.message || "No se pudo cargar la lista de ómnibus. Intente más tarde.");
                setOmnibusLista([]);
            } finally {
                setIsLoading(false);
            }
        };

        cargarOmnibus();
    }, []);

    const sortedOmnibus = useMemo(() => {
        let sortableItems = [...omnibusLista];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Manejar propiedades anidadas como 'localidadActual.nombre'
                if (sortConfig.key.includes('.')) {
                    const keys = sortConfig.key.split('.');
                    aValue = keys.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : null), a);
                    bValue = keys.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : null), b);
                }

                // Asegurar que los valores nulos o indefinidos se manejen consistentemente
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';


                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                } else {
                    // Para strings y otros tipos, usar localeCompare
                    const strA = String(aValue).toLowerCase();
                    const strB = String(bValue).toLowerCase();
                    if (strA < strB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (strA > strB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }
        return sortableItems;
    }, [omnibusLista, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
        }
        return ''; // Podrías poner un ícono neutral o nada
    };


    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div><p className="loading-message">Cargando ómnibus...</p></div>;
    }

    if (error) {
        return <div className="error-container"><p className="mensaje-error">⚠️ {error}</p></div>;
    }

    return (
        <div className="vendedor-listar-omnibus-page">
            <header className="page-header">
                <h1>Listado de Ómnibus</h1>
                <p>Gestiona y visualiza la flota de ómnibus registrados en el sistema.</p>
            </header>

            {sortedOmnibus.length === 0 && !isLoading ? (
                <div className="empty-state">
                    <span className="empty-state-icon">🚌</span>
                    <p className="mensaje-informativo">Aún no hay ómnibus registrados.</p>
                    {/* Podrías agregar un botón para "Agregar Ómnibus" aquí si es relevante */}
                </div>
            ) : (
                <section className="tabla-omnibus-container">
                    <div className="table-responsive">
                        <table className="tabla-omnibus">
                            <thead>
                            <tr>
                                <th onClick={() => requestSort('id')} className="sortable">
                                    ID{getSortIndicator('id')}
                                </th>
                                <th onClick={() => requestSort('matricula')} className="sortable">
                                    Matrícula{getSortIndicator('matricula')}
                                </th>
                                <th onClick={() => requestSort('marca')} className="sortable">
                                    Marca{getSortIndicator('marca')}
                                </th>
                                <th onClick={() => requestSort('modelo')} className="sortable">
                                    Modelo{getSortIndicator('modelo')}
                                </th>
                                <th onClick={() => requestSort('capacidadAsientos')} className="sortable">
                                    Capacidad{getSortIndicator('capacidadAsientos')}
                                </th>
                                <th onClick={() => requestSort('estado')} className="sortable">
                                    Estado{getSortIndicator('estado')}
                                </th>
                                <th onClick={() => requestSort('localidadActual.nombre')} className="sortable">
                                    Localidad Actual{getSortIndicator('localidadActual.nombre')}
                                </th>
                                {/* <th>Acciones</th> */}
                            </tr>
                            </thead>
                            <tbody>
                            {sortedOmnibus.map((omnibus) => (
                                <tr key={omnibus.id}>
                                    <td>{omnibus.id}</td>
                                    <td>{omnibus.matricula}</td>
                                    <td>{omnibus.marca}</td>
                                    <td>{omnibus.modelo}</td>
                                    <td className="text-center">{omnibus.capacidadAsientos}</td>
                                    <td>
                                        <span className={`status-badge status-${String(omnibus.estado).toLowerCase()}`}>
                                            {omnibus.estado}
                                        </span>
                                    </td>
                                    <td>{omnibus.localidadActual ? omnibus.localidadActual.nombre : 'N/D'}</td>
                                    {/*
                                    <td>
                                        <button className="btn-accion btn-editar">Editar</button>
                                        <button className="btn-accion btn-ver">Ver</button>
                                    </td>
                                    */}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default VendedorListarOmnibusPage;