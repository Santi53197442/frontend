// src/pages/Admin/AdminUserListPage.js
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta si es diferente
import './AdminUserListPage.css'; // Importa el archivo CSS

const SortAscIcon = () => <span> ▲</span>; // Triángulo hacia arriba con espacio
const SortDescIcon = () => <span> ▼</span>; // Triángulo hacia abajo con espacio

function AdminUserListPage() {
    const [usersOriginal, setUsersOriginal] = useState([]); // Lista original sin filtrar
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    // Estados para los filtros
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroEmail, setFiltroEmail] = useState('');
    const [filtroRol, setFiltroRol] = useState(''); // 'Cualquiera' o el rol específico

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/admin/users'); // Asegúrate que esta ruta es correcta
                setUsersOriginal(response.data || []);
            } catch (err) {
                console.error("Error al cargar usuarios:", err);
                if (err.response) {
                    if (err.response.status === 403) {
                        setError('Acceso denegado. No tiene permisos para ver esta lista.');
                    } else if (err.response.status === 401) {
                        setError('Sesión expirada o inválida. Por favor, inicie sesión nuevamente.');
                    } else {
                        setError(err.response.data?.message || err.message || `Error ${err.response.status} al cargar los usuarios.`);
                    }
                } else if (err.request) {
                    setError('No se pudo conectar con el servidor. Verifique su conexión.');
                } else {
                    setError('Ocurrió un error inesperado al configurar la solicitud.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Opciones para el desplegable de roles (derivadas de la lista completa)
    const rolesUnicos = useMemo(() => {
        if (!usersOriginal || usersOriginal.length === 0) return [];
        const roles = new Set(usersOriginal.map(u => u.rol).filter(Boolean));
        return ["", ...Array.from(roles).sort()]; // "" para "Cualquiera"
    }, [usersOriginal]);

    const filteredAndSortedUsers = useMemo(() => {
        if (!usersOriginal || usersOriginal.length === 0) return [];
        let items = [...usersOriginal];

        // Aplicar filtros
        if (filtroNombre) {
            items = items.filter(user =>
                (user.nombre.toLowerCase() + ' ' + user.apellido.toLowerCase()).includes(filtroNombre.toLowerCase()) ||
                user.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                user.apellido.toLowerCase().includes(filtroNombre.toLowerCase())
            );
        }
        if (filtroEmail) {
            items = items.filter(user =>
                user.email.toLowerCase().includes(filtroEmail.toLowerCase())
            );
        }
        if (filtroRol) {
            items = items.filter(user => user.rol === filtroRol);
        }

        // Aplicar ordenamiento
        if (sortConfig.key !== null) {
            items.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (sortConfig.key === 'fechaNac') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                } else if (typeof valA === 'number' && typeof valB === 'number') {
                    // No necesita conversión
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [usersOriginal, filtroNombre, filtroEmail, filtroRol, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <SortAscIcon /> : <SortDescIcon />;
        }
        return null;
    };

    const limpiarFiltros = () => {
        setFiltroNombre('');
        setFiltroEmail('');
        setFiltroRol('');
    };

    if (loading) {
        return <div className="loading-message">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="admin-user-list-page"> {/* Clase contenedora principal específica para la página */}
            <div className="user-list-container"> {/* Contenedor para el contenido, como en tu CSS */}
                <div className="user-list-title-wrapper">
                    <h2>Lista de Usuarios del Sistema</h2>
                </div>

                {/* Sección de Filtros */}
                <section className="filtros-usuarios-container">
                    <h3>Filtrar Usuarios</h3>
                    <div className="filtros-grid">
                        <div className="filtro-item">
                            <label htmlFor="filtro-nombre">Nombre/Apellido:</label>
                            <input
                                type="text"
                                id="filtro-nombre"
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                placeholder="Buscar por nombre o apellido"
                            />
                        </div>
                        <div className="filtro-item">
                            <label htmlFor="filtro-email">Email:</label>
                            <input
                                type="text"
                                id="filtro-email"
                                value={filtroEmail}
                                onChange={(e) => setFiltroEmail(e.target.value)}
                                placeholder="Buscar por email"
                            />
                        </div>
                        <div className="filtro-item">
                            <label htmlFor="filtro-rol">Rol:</label>
                            <select
                                id="filtro-rol"
                                value={filtroRol}
                                onChange={(e) => setFiltroRol(e.target.value)}
                            >
                                <option value="">Cualquiera</option>
                                {rolesUnicos.slice(1).map(rol => ( // slice(1) para no repetir el ""
                                    <option key={rol} value={rol}>{rol}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filtro-acciones">
                            <button type="button" onClick={limpiarFiltros} className="btn-limpiar-filtros">
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </section>


                {filteredAndSortedUsers.length === 0 ? (
                    <p className="no-users-message">
                        {usersOriginal.length > 0 ? "No hay usuarios que coincidan con los filtros." : "No hay usuarios para mostrar."}
                    </p>
                ) : (
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
                            {filteredAndSortedUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.nombre}</td>
                                    <td>{user.apellido}</td>
                                    <td className="allow-wrap">{user.email}</td>
                                    <td>{user.ci}</td>
                                    <td>{user.telefono || 'N/D'}</td>
                                    <td>{user.fechaNac ? new Date(user.fechaNac).toLocaleDateString() : 'N/D'}</td>
                                    <td>
                                        {/* La clase CSS será por ejemplo: role-admin, role-vendedor */}
                                        <span className={`role-badge role-${(user.rol || 'desconocido').toLowerCase()}`}>
                                            {user.rol || 'DESCONOCIDO'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUserListPage;