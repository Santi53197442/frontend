import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta si es diferente
import './AdminUserListPage.css'; // Importa el archivo CSS

function AdminUserListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                // La URL correcta para el endpoint de listar usuarios del AdminController
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
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th className="allow-wrap">Email</th> {/* Clase para permitir salto de línea */}
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
                                <td className="allow-wrap">{user.email}</td> {/* Clase para permitir salto de línea */}
                                <td>{user.ci}</td>
                                <td>{user.telefono}</td>
                                <td>{new Date(user.fechaNac).toLocaleDateString()}</td>
                                <td>
                                    {/* Estilizando el rol con un span y clase dinámica */}
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