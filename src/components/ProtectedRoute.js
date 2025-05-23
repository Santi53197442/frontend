// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Asegúrate que la ruta sea correcta

const ProtectedRoute = ({ allowedRoles }) => {
    // allowedRoles es un array opcional de strings de roles permitidos, ej. ['administrador', 'vendedor']
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Muestra un loader mientras se verifica el estado de autenticación
        return <div>Cargando...</div>; // O un componente Spinner más elaborado
    }

    if (!isAuthenticated) {
        // Si no está autenticado, redirige al login
        // Guardar la ubicación actual para redirigir de vuelta después del login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si se especifican roles permitidos y el usuario no tiene uno de ellos
    if (allowedRoles && allowedRoles.length > 0) {
        const userRol = user?.rol?.toLowerCase(); // Obtener el rol del usuario en minúsculas
        if (!userRol || !allowedRoles.includes(userRol)) {
            // Si el rol del usuario no está en la lista de roles permitidos, redirige
            console.warn(`Acceso denegado a ${location.pathname}. Rol del usuario: ${userRol}. Roles permitidos: ${allowedRoles.join(', ')}`);
            return <Navigate to="/unauthorized" replace />; // O a '/', o a una página específica de "Acceso Denegado"
        }
    }

    // Si está autenticado y (si se especifican roles) tiene un rol permitido, renderiza el contenido
    return <Outlet />;
};

export default ProtectedRoute;