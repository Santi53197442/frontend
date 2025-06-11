// src/pages/AdminUserListDeletePage/AdminUserListDeletePage.js

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';
import './AdminUserListDeletePage.css';

const SortAscIcon = () => <span> ▲</span>;
const SortDescIcon = () => <span> ▼</span>;

function AdminUserListDeletePage() {
    // --- ESTADOS ---
    // Datos y UI
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mensajes de eliminación
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const PAGE_SIZE = 20;

    // Filtros de input (lo que se escribe)
    const [inputNombre, setInputNombre] = useState('');
    const [inputEmail, setInputEmail] = useState('');

    // Filtros activos (lo que se envía a la API)
    const [activeFiltroNombre, setActiveFiltroNombre] = useState('');
    const [activeFiltroEmail, setActiveFiltroEmail] = useState('');
    const [filtroRol, setFiltroRol] = useState('');

    // Ordenamiento
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    const rolesUnicos = ["", "ADMINISTRADOR", "VENDEDOR", "CLIENTE"];

    // --- LÓGICA DE DATOS ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                size: PAGE_SIZE,
                sort: `${sortConfig.key},${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`
            });

            if (activeFiltroNombre) params.append('nombre', activeFiltroNombre);
            if (activeFiltroEmail) params.append('email', activeFiltroEmail);
            if (filtroRol) params.append('rol', filtroRol);

            const response = await apiClient.get(`/admin/users?${params.toString()}`);

            setUsers(response.data.content || []);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalItems);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            // ... (manejo de errores de carga)
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortConfig, activeFiltroNombre, activeFiltroEmail, filtroRol]);

    // Efecto principal para cargar/recargar los datos
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Efecto para volver a la página 1 cuando los filtros o el orden cambian
    useEffect(() => {
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFiltroNombre, activeFiltroEmail, filtroRol, sortConfig]);

    // --- MANEJADORES DE EVENTOS ---
    const handleBuscar = (e) => {
        e.preventDefault();
        setActiveFiltroNombre(inputNombre);
        setActiveFiltroEmail(inputEmail);
    };

    const limpiarFiltros = () => {
        setInputNombre('');
        setInputEmail('');
        setFiltroRol('');
        setActiveFiltroNombre('');
        setActiveFiltroEmail('');
    };

    const handleDeleteUser = async (userId, userName) => {
        setDeleteError(null);
        setDeleteSuccess('');

        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName} (ID: ${userId})? Esta acción no se puede deshacer.`)) {
            try {
                await apiClient.delete(`/admin/users/${userId}`);
                setDeleteSuccess(`Usuario ${userName} (ID: ${userId}) eliminado exitosamente.`);

                // IMPORTANTE: Volvemos a llamar a fetchUsers para recargar la lista actualizada del servidor.
                // Si eliminamos el último usuario de una página, esto la manejará correctamente.
                fetchUsers();

                setTimeout(() => setDeleteSuccess(''), 5000);
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Error desconocido al eliminar.';
                setDeleteError(errorMessage);
                setTimeout(() => setDeleteError(null), 7000);
            }
        }
    };

    const requestSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />;
        }
        return null;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    }

    if (error) return <div className="error-message">Error de carga: {error}</div>;

    // --- RENDERIZADO ---
    return (
        <div className="user-list-delete-page-container"> {/* Clase contenedora principal */}
            <div className="user-list-title-wrapper">
                <h2>Administración de Usuarios</h2>
            </div>

            {/* Mensajes de feedback para la eliminación */}
            {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}
            {deleteError && <div className="error-message">Error al eliminar: {deleteError}</div>}

            {/* Sección de filtros (copiada del otro componente para consistencia) */}
            <section className="filtros-usuarios-container">
                <h3>Filtrar Usuarios</h3>
                <form className="filtros-grid" onSubmit={handleBuscar}>
                    <div className="filtro-item">
                        <label htmlFor="filtro-nombre">Nombre/Apellido:</label>
                        <input type="text" id="filtro-nombre" value={inputNombre} onChange={(e) => setInputNombre(e.target.value)} placeholder="Buscar por nombre o apellido"/>
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="filtro-email">Email:</label>
                        <input type="text" id="filtro-email" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} placeholder="Buscar por email"/>
                    </div>
                    <div className="filtro-item">
                        <label htmlFor="filtro-rol">Rol:</label>
                        <select id="filtro-rol" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                            {rolesUnicos.map(rol => (<option key={rol} value={rol}>{rol || 'Cualquiera'}</option>))}
                        </select>
                    </div>
                    <div className="filtro-acciones-agrupadas">
                        <button type="submit" className="btn-buscar">Buscar</button>
                        <button type="button" onClick={limpiarFiltros} className="btn-limpiar-filtros">Limpiar</button>
                    </div>
                </form>
            </section>

            {/* Lógica de renderizado de la tabla y paginación */}
            {loading ? <div className="loading-message">Cargando usuarios...</div> : (
                users.length === 0 ? (
                    <p className="no-users-message">{totalItems > 0 ? "No hay usuarios que coincidan con los filtros." : "No hay usuarios registrados."}</p>
                ) : (
                    <>
                        <div className="user-list-table-responsive">
                            <table className="user-list-table">
                                <thead>
                                <tr>
                                    <th onClick={() => requestSort('id')}>ID{getSortIcon('id')}</th>
                                    <th onClick={() => requestSort('nombre')}>Nombre{getSortIcon('nombre')}</th>
                                    <th onClick={() => requestSort('apellido')}>Apellido{getSortIcon('apellido')}</th>
                                    <th className="allow-wrap" onClick={() => requestSort('email')}>Email{getSortIcon('email')}</th>
                                    <th onClick={() => requestSort('ci')}>CI{getSortIcon('ci')}</th>
                                    <th onClick={() => requestSort('rol')}>Rol{getSortIcon('rol')}</th>
                                    <th>Acciones</th> {/* Columna de acciones */}
                                </tr>
                                </thead>
                                <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.nombre}</td>
                                        <td>{user.apellido}</td>
                                        <td className="allow-wrap">{user.email}</td>
                                        <td>{user.ci || 'N/A'}</td>
                                        <td><span className={`role-badge role-${(user.rol || 'desconocido').toLowerCase()}`}>{user.rol || 'DESCONOCIDO'}</span></td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => handleDeleteUser(user.id, `${user.nombre} ${user.apellido}`)}
                                                className="delete-button"
                                                title={`Eliminar a ${user.nombre} ${user.apellido}`}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Controles de paginación */}
                        <div className="pagination-controls">
                            <button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>« Primera</button>
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>‹ Anterior</button>
                            <span className="page-indicator">{currentPage + 1}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>Siguiente ›</button>
                            <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>Última »</button>
                        </div>
                        <div className="pagination-summary">
                            Página {currentPage + 1} de {totalPages} (Total: {totalItems} usuarios)
                        </div>
                    </>
                )
            )}
        </div>
    );
}

export default AdminUserListDeletePage;