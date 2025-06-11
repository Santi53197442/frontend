// src/pages/Admin/AdminUserListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';
import './AdminUserListPage.css';

const SortAscIcon = () => <span> ▲</span>;
const SortDescIcon = () => <span> ▼</span>;

function AdminUserListPage() {
    // Estados de datos y UI
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const PAGE_SIZE = 20;

    // Estados para los campos de input (lo que el usuario ve al escribir)
    const [inputNombre, setInputNombre] = useState('');
    const [inputEmail, setInputEmail] = useState('');

    // Estados para los filtros que se envían a la API (solo se actualizan al buscar)
    const [activeFiltroNombre, setActiveFiltroNombre] = useState('');
    const [activeFiltroEmail, setActiveFiltroEmail] = useState('');

    // El filtro de Rol y el ordenamiento siguen siendo instantáneos
    const [filtroRol, setFiltroRol] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    const rolesUnicos = ["", "ADMINISTRADOR", "VENDEDOR", "CLIENTE"];

    // La función que llama a la API ahora depende de los filtros ACTIVOS
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
            if (err.response) {
                if (err.response.status === 403) setError('Acceso denegado.');
                else if (err.response.status === 401) setError('Sesión expirada.');
                else setError(err.response.data?.message || `Error ${err.response.status}.`);
            } else if (err.request) setError('Sin respuesta del servidor.');
            else setError('Error en la configuración de la solicitud.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortConfig, activeFiltroNombre, activeFiltroEmail, filtroRol]);

    // Efecto principal que llama a la API
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Efecto para volver a la página 1 cuando un filtro ACTIVO o el orden cambian
    useEffect(() => {
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFiltroNombre, activeFiltroEmail, filtroRol, sortConfig]);

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

    const requestSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }));
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

    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="admin-user-list-page">
            <div className="user-list-container">
                <div className="user-list-title-wrapper"><h2>Lista de Usuarios del Sistema</h2></div>
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
                                        <th onClick={() => requestSort('telefono')}>Teléfono{getSortIcon('telefono')}</th>
                                        <th onClick={() => requestSort('fechaNac')}>Fecha Nac.{getSortIcon('fechaNac')}</th>
                                        <th onClick={() => requestSort('rol')}>Rol{getSortIcon('rol')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map(user => {
                                        const rolOriginal = user.rol?.trim();
                                        const rolParaClase = (rolOriginal && rolOriginal !== "") ? rolOriginal.toLowerCase() : 'desconocido';
                                        let textoDelBadge = rolOriginal.toLowerCase() === 'administrador' ? 'Admin' : user.rol;
                                        return (
                                            <tr key={user.id}>
                                                <td>{user.id}</td><td>{user.nombre}</td><td>{user.apellido}</td><td className="allow-wrap">{user.email}</td><td>{user.ci}</td><td>{user.telefono || 'N/D'}</td><td>{user.fechaNac ? new Date(user.fechaNac).toLocaleDateString() : 'N/D'}</td><td><span className={`role-badge role-${rolParaClase}`}>{textoDelBadge}</span></td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination-controls">
                                <button onClick={() => handlePageChange(0)} disabled={currentPage === 0}>« Primera</button><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>‹ Anterior</button><span className="page-indicator">{currentPage + 1}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>Siguiente ›</button><button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1}>Última »</button>
                            </div>
                            <div className="pagination-summary">Página {currentPage + 1} de {totalPages} (Total: {totalItems} usuarios)</div>
                        </>
                    )
                )}
            </div>
        </div>
    );
}

export default AdminUserListPage;