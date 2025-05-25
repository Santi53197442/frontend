// src/pages/AdminUserListDeletePage/AdminUserListDeletePage.js (NUEVO ARCHIVO)

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta si es diferente
import './AdminUserListDeletePage.css'; // Importa el NUEVO archivo CSS

// Iconos para ordenamiento
const SortAscIcon = () => <span> ▲</span>;
const SortDescIcon = () => <span> ▼</span>;

// CAMBIAR EL NOMBRE DE LA FUNCIÓN
function AdminUserListDeletePage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS PARA ELIMINACIÓN ---
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState('');

    // Estado para el ordenamiento
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        setDeleteError(null);
        setDeleteSuccess('');
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

    useEffect(() => {
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
                    valA = valA ? new Date(valA) : null;
                    valB = valB ? new Date(valB) : null;
                    if (valA === null && valB === null) return 0;
                    if (valA === null) return sortConfig.direction === 'ascending' ? 1 : -1;
                    if (valB === null) return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                else if (typeof valA === 'number' && typeof valB === 'number') { /* ... */ }
                else if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                } else if (valA === null || valA === undefined) { return 1; }
                else if (valB === null || valB === undefined) { return -1; }


                if (valA < valB) { return sortConfig.direction === 'ascending' ? -1 : 1; }
                if (valA > valB) { return sortConfig.direction === 'ascending' ? 1 : -1; }
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

    const handleDeleteUser = async (userId, userName) => {
        setDeleteError(null);
        setDeleteSuccess('');

        if (userId === 1) { // Ejemplo de protección
            alert("No se puede eliminar al administrador principal (ID: 1).");
            setDeleteError("No se puede eliminar al administrador principal (ID: 1).");
            return;
        }

        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName} (ID: ${userId})? Esta acción no se puede deshacer.`)) {
            try {
                await apiClient.delete(`/admin/users/${userId}`);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                setDeleteSuccess(`Usuario ${userName} (ID: ${userId}) eliminado exitosamente.`);
                setTimeout(() => setDeleteSuccess(''), 5000);
            } catch (err) {
                console.error("Error al eliminar usuario:", err);
                const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar el usuario.';
                setDeleteError(errorMessage);
                setTimeout(() => setDeleteError(null), 7000);
            }
        }
    };

    if (loading) {
        return <div className="loading-message">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="user-list-delete-container"> {/* Puedes usar una clase específica si quieres */}
            <div className="user-list-title-wrapper">
                <h2>Administración de Usuarios (con Eliminación)</h2> {/* Título descriptivo */}
            </div>

            {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}
            {deleteError && <div className="error-message">Error al eliminar: {deleteError}</div>}

            {users.length === 0 ? (
                <p className="no-users-message">No hay usuarios para mostrar.</p>
            ) : (
                <div className="user-list-table-responsive">
                    <table className="user-list-table">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>ID {getSortIcon('id')}</th>
                            <th onClick={() => requestSort('nombre')} style={{ cursor: 'pointer' }}>Nombre {getSortIcon('nombre')}</th>
                            <th onClick={() => requestSort('apellido')} style={{ cursor: 'pointer' }}>Apellido {getSortIcon('apellido')}</th>
                            <th className="allow-wrap" onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>Email {getSortIcon('email')}</th>
                            <th onClick={() => requestSort('ci')} style={{ cursor: 'pointer' }}>CI {getSortIcon('ci')}</th>
                            <th onClick={() => requestSort('telefono')} style={{ cursor: 'pointer' }}>Teléfono {getSortIcon('telefono')}</th>
                            <th onClick={() => requestSort('fechaNac')} style={{ cursor: 'pointer' }}>Fecha Nac. {getSortIcon('fechaNac')}</th>
                            <th onClick={() => requestSort('rol')} style={{ cursor: 'pointer' }}>Rol {getSortIcon('rol')}</th>
                            <th>Acciones</th> {/* Columna de Acciones */}
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
                                <td>{user.fechaNac ? new Date(user.fechaNac).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <span className={`role-${(user.rol || 'desconocido').toLowerCase()}`}>
                                        {user.rol || 'DESCONOCIDO'}
                                    </span>
                                </td>
                                <td className="actions-cell"> {/* Celda de Acciones */}
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
            )}
        </div>
    );
}

// CAMBIAR LA EXPORTACIÓN
export default AdminUserListDeletePage;