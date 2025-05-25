import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta si es diferente
import './AdminUserListPage.css'; // Importa el archivo CSS

// Iconos para ordenamiento (puedes usar SVGs, FontAwesome, etc.)
const SortAscIcon = () => <span> ▲</span>; // Triángulo hacia arriba
const SortDescIcon = () => <span> ▼</span>; // Triángulo hacia abajo

function AdminUserListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el ordenamiento
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/admin/users');
                setUsers(response.data);
            } catch (err) {
                console.error("Error al cargar usuarios:", err);
                if (err.response) {
                    if (err.response.status === 403) {
                        setError('Acceso denegado. No tiene permisos para ver esta lista o la ruta es incorrecta.');
                    } else if (err.response.status === 401) {
                        setError('Sesión expirada o inválida.');
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

    const sortedUsers = useMemo(() => {
        if (!users || users.length === 0) return [];
        let sortableUsers = [...users];
        if (sortConfig.key !== null) {
            sortableUsers.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (sortConfig.key === 'fechaNac') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }
                else if (typeof valA === 'number' && typeof valB === 'number') {
                    // No necesita conversión
                }
                else if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, sortConfig]);

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


    if (loading) {
        return <div className="loading-message">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="user-list-container">
            <div className="user-list-title-wrapper">
                <h2>Lista de Usuarios del Sistema</h2>
            </div>

            {users.length === 0 ? (
                <p className="no-users-message">No hay usuarios para mostrar.</p>
            ) : (
                <div className="user-list-table-responsive">
                    <table className="user-list-table">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>
                                ID {getSortIcon('id')}
                            </th>
                            <th onClick={() => requestSort('nombre')} style={{ cursor: 'pointer' }}>
                                Nombre {getSortIcon('nombre')}
                            </th>
                            <th onClick={() => requestSort('apellido')} style={{ cursor: 'pointer' }}>
                                Apellido {getSortIcon('apellido')}
                            </th>
                            <th className="allow-wrap" onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
                                Email {getSortIcon('email')}
                            </th>
                            <th onClick={() => requestSort('ci')} style={{ cursor: 'pointer' }}>
                                CI {getSortIcon('ci')}
                            </th>
                            <th onClick={() => requestSort('telefono')} style={{ cursor: 'pointer' }}>
                                Teléfono {getSortIcon('telefono')}
                            </th>
                            <th onClick={() => requestSort('fechaNac')} style={{ cursor: 'pointer' }}>
                                Fecha Nac. {getSortIcon('fechaNac')}
                            </th>
                            <th onClick={() => requestSort('rol')} style={{ cursor: 'pointer' }}>
                                Rol {getSortIcon('rol')}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombre}</td>
                                <td>{user.apellido}</td>
                                <td className="allow-wrap">{user.email}</td>
                                <td>{user.ci}</td>
                                <td>{user.telefono}</td>
                                <td>{new Date(user.fechaNac).toLocaleDateString()}</td>
                                <td>
                                        <span className={`role-${(user.rol || 'desconocido').toLowerCase()}`}>
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
    );
}

export default AdminUserListPage;