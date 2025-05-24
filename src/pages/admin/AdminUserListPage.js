// src/pages/admin/AdminUserListPage.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta
import './AdminUserListPage.css'; // Crearemos este archivo CSS

const AdminUserListPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError('');
            try {
                // La ruta es relativa a apiClient.defaults.baseURL (que es https://.../api)
                // Esta llamada irá a: https://web-production-2443c.up.railway.app/api/admin/users
                const response = await apiClient.get('/admin/users');
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching users:", err.response || err);
                setError(err.response?.data?.message || err.message || 'Error al cargar los usuarios.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) {
        return <div className="loading-spinner">Cargando usuarios...</div>; // O un spinner real
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="admin-user-list-page">
            <h2>Lista de Usuarios del Sistema</h2>
            {users.length === 0 ? (
                <p>No se encontraron usuarios.</p>
            ) : (
                <table className="users-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>CI</th>
                        <th>Teléfono</th>
                        <th>Fecha Nac.</th>
                        <th>Rol</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.nombre}</td>
                            <td>{user.apellido}</td>
                            <td>{user.email}</td>
                            <td>{user.ci}</td>
                            <td>{user.telefono}</td>
                            <td>{user.fechaNac ? new Date(user.fechaNac).toLocaleDateString() : 'N/A'}</td>
                            <td>{user.rol}</td>
                            {/* Podrías añadir un botón de acciones aquí (editar, eliminar, etc.) */}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminUserListPage;