// src/pages/admin/AdminUserListPage.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api'; // Ajusta la ruta a tu api.js

function AdminUserListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                // Tu apiClient ya incluye el token y el BASE_URL con /api
                // El endpoint es '/users' relativo a BASE_URL
                const response = await apiClient.get('/admin/users');

                setUsers(response.data); // response.data debería ser List<UserViewDTO>

            } catch (err) {
                console.error("Error al cargar usuarios:", err);
                if (err.response) {
                    if (err.response.status === 403) {
                        setError('Acceso denegado. No tiene permisos para ver esta lista.');
                    } else if (err.response.status === 401) {
                        // El interceptor de apiClient ya maneja el log y podría redirigir
                        setError('Sesión expirada o inválida.');
                    } else {
                        setError(err.response.data?.message || err.message || 'Ocurrió un error al cargar los usuarios.');
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
    }, []); // El interceptor se encarga del token, por lo que no es dependencia aquí

    if (loading) {
        return <div className="text-center p-4">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="alert alert-danger" role="alert">Error: {error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Lista de Usuarios del Sistema</h2>
            {users.length === 0 ? (
                <p className="mt-3">No hay usuarios para mostrar.</p>
            ) : (
                <div className="table-responsive mt-3">
                    <table className="table table-striped table-hover">
                        <thead className="thead-dark">
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
                                <td>{new Date(user.fechaNac).toLocaleDateString()}</td>
                                <td>{user.rol}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Futuro: Botones para acciones como crear, editar, etc. */}
        </div>
    );
}

export default AdminUserListPage;