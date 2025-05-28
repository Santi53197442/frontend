// src/pages/Vendedor/VendedorListarOmnibusPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { obtenerTodosLosOmnibus } from '../../services/api'; // Ajusta la ruta
import './VendedorListarOmnibusPage.css'; // Asegúrate que el nombre del archivo CSS coincida

const VendedorListarOmnibusPage = () => {
    const [omnibusListaCompleta, setOmnibusListaCompleta] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    const [filtroMatricula, setFiltroMatricula] = useState('');
    const [filtroMarca, setFiltroMarca] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroCapacidadMin, setFiltroCapacidadMin] = useState('');

    useEffect(() => {
        const cargarOmnibus = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await obtenerTodosLosOmnibus();
                setOmnibusListaCompleta(response.data || []);
            } catch (err) {
                console.error("Error cargando la lista de ómnibus:", err);
                setError(err.response?.data?.message || "No se pudo cargar la lista de ómnibus. Intente más tarde.");
                setOmnibusListaCompleta([]);
            } finally {
                setIsLoading(false);
            }
        };
        cargarOmnibus();
    }, []);

    const marcasUnicas = useMemo(() => {
        const marcas = new Set(omnibusListaCompleta.map(o => o.marca).filter(Boolean));
        return ["", ...Array.from(marcas).sort()];
    }, [omnibusListaCompleta]);

    const estadosUnicos = useMemo(() => {
        const estados = new Set(omnibusListaCompleta.map(o => o.estado).filter(Boolean));
        return ["", ...Array.from(estados).sort()];
    }, [omnibusListaCompleta]);

    const filteredAndSortedOmnibus = useMemo(() => {
        let items = [...omnibusListaCompleta];

        if (filtroMatricula) {
            items = items.filter(o =>
                o.matricula.toLowerCase().includes(filtroMatricula.toLowerCase())
            );
        }
        if (filtroMarca) {
            items = items.filter(o => o.marca === filtroMarca);
        }
        if (filtroEstado) {
            items = items.filter(o => o.estado === filtroEstado);
        }
        if (filtroCapacidadMin) {
            const capacidadMin = parseInt(filtroCapacidadMin, 10);
            if (!isNaN(capacidadMin)) {
                items = items.filter(o => o.capacidadAsientos >= capacidadMin);
            }
        }

        if (sortConfig.key !== null) {
            items.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key.includes('.')) {
                    const keys = sortConfig.key.split('.');
                    aValue = keys.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), a);
                    bValue = keys.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), b);
                }

                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                } else {
                    const strA = String(aValue).toLowerCase();
                    const strB = String(bValue).toLowerCase();
                    if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
            });
        }
        return items;
    }, [omnibusListaCompleta, filtroMatricula, filtroMarca, filtroEstado, filtroCapacidadMin, sortConfig]);

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
        return '';
    };

    const limpiarFiltros = () => {
        setFiltroMatricula('');
        setFiltroMarca('');
        setFiltroEstado('');
        setFiltroCapacidadMin('');
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

            <section className="filtros-omnibus-container">
                <h2>Filtrar Ómnibus</h2>
                <div className="filtros-grid">
                    <div className="filtro-item">
                        <label htmlFor="filtro-matricula">Matrícula:</label>
                        <input
                            type="text"
                            id="filtro-matricula"
                            value={filtroMatricula}
                            onChange={(e) => setFiltroMatricula(e.target.value)}
                            placeholder="Ej: SAB1234"
                        />
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="filtro-marca">Marca:</label>
                        <select id="filtro-marca" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}>
                            <option value="">Cualquiera</option>
                            {marcasUnicas.slice(1).map(marca => (<option key={marca} value={marca}>{marca}</option>))}
                        </select>
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="filtro-estado">Estado:</label>
                        <select id="filtro-estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Cualquiera</option>
                            {estadosUnicos.slice(1).map(estado => (<option key={estado} value={estado}>{estado}</option> ))}
                        </select>
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="filtro-capacidad">Capacidad Mínima:</label>
                        <input type="number" id="filtro-capacidad" value={filtroCapacidadMin} onChange={(e) => setFiltroCapacidadMin(e.target.value)} placeholder="Ej: 30" min="0"/>
                    </div>
                    <div className="filtro-acciones">
                        <button type="button" onClick={limpiarFiltros} className="btn-limpiar-filtros">Limpiar Filtros</button>
                    </div>
                </div>
            </section>

            {filteredAndSortedOmnibus.length === 0 && !isLoading ? (
                <div className="empty-state">
                    <span className="empty-state-icon">🚌</span>
                    <p className="mensaje-informativo">
                        {omnibusListaCompleta.length > 0 ? "No hay ómnibus que coincidan con los filtros aplicados." : "Aún no hay ómnibus registrados."}
                    </p>
                </div>
            ) : (
                <section className="tabla-omnibus-container">
                    <div className="table-responsive">
                        <table className="tabla-omnibus">
                            <thead>
                            <tr>
                                <th onClick={() => requestSort('id')} className="sortable">ID{getSortIndicator('id')}</th>
                                <th onClick={() => requestSort('matricula')} className="sortable">Matrícula{getSortIndicator('matricula')}</th>
                                <th onClick={() => requestSort('marca')} className="sortable">Marca{getSortIndicator('marca')}</th>
                                <th onClick={() => requestSort('modelo')} className="sortable">Modelo{getSortIndicator('modelo')}</th>
                                <th onClick={() => requestSort('capacidadAsientos')} className="sortable text-center">Capacidad{getSortIndicator('capacidadAsientos')}</th>
                                <th onClick={() => requestSort('estado')} className="sortable">Estado{getSortIndicator('estado')}</th>
                                <th onClick={() => requestSort('localidadActual.nombre')} className="sortable">Localidad Actual{getSortIndicator('localidadActual.nombre')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAndSortedOmnibus.map((omnibus) => {
                                const estadoOriginal = omnibus.estado;
                                const claseCssEstado = `status-${String(estadoOriginal || '').toLowerCase().replace(/\s+/g, '-')}`;

                                return (
                                    <tr key={omnibus.id}>
                                        <td>{omnibus.id}</td>
                                        <td>{omnibus.matricula}</td>
                                        <td>{omnibus.marca}</td>
                                        <td>{omnibus.modelo}</td>
                                        <td className="text-center">{omnibus.capacidadAsientos}</td>
                                        <td>
                                            <span className={`status-badge ${claseCssEstado}`}>
                                                {estadoOriginal || 'N/D'}
                                            </span>
                                        </td>
                                        <td>{omnibus.localidadActual ? omnibus.localidadActual.nombre : 'N/D'}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default VendedorListarOmnibusPage;