// src/pages/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Ajusta la ruta si es necesario

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="admin-dashboard">
            <h2>Dashboard de Administración</h2>
            <p>Bienvenido, Administrador {user?.nombre || user?.email}!</p>
            <p>Desde aquí puedes gestionar diferentes aspectos de la aplicación.</p>
            <div style={{ marginTop: '20px' }}>
                <p>Acciones rápidas:</p>
                <ul>
                    <li>
                        <Link to="/admin/crear-usuario">Crear Nuevo Usuario (Admin/Vendedor)</Link>
                    </li>
                    <li>
                        {/* <Link to="/admin/gestion-productos">Gestionar Productos</Link> */}
                    </li>
                    {/* Más enlaces a otras secciones del admin */}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;