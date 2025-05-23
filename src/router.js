// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- Componentes y Páginas ---
// Públicos
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPasswordPage from './components/ForgotPassword'; // Asumiendo que está en components
import ResetPasswordPage from './components/ResetPassword';   // Asumiendo que está en components
import Home from "./pages/Home"; // Página de inicio pública


// Autenticados Genéricos
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
// import UserDashboard from './pages/UserDashboard'; // Si tienes un dashboard común para logueados

// Específicos de Administrador (debes crear estos componentes)
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminGestionUsuarios from './pages/admin/AdminGestionUsuarios';
import AdminCreateUserPage from './components/AdminCreateUserPage'; // Página para crear Admin/Vendedor

// Específicos de Vendedor (debes crear estos componentes)
// import VendedorPanel from './pages/vendedor/VendedorPanel';
// import VendedorMisProductos from './pages/vendedor/VendedorMisProductos';

// Específicos de Cliente (debes crear estos componentes)
// import MisReservasPage from './pages/cliente/MisReservasPage';

// Otros
// import UnauthorizedPage from './pages/UnauthorizedPage';
// import NotFoundPage from './pages/NotFoundPage';


const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<Home />} /> {/* Página de inicio pública */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}

            {/* --- Rutas Protegidas (Autenticación General Requerida) --- */}
            <Route element={<ProtectedRoute />}>
                {/* Rutas comunes para CUALQUIER usuario autenticado */}
                <Route path="/editar-perfil" element={<EditProfile />} />
                {/* Ejemplo: Si /dashboard es un inicio común para usuarios logueados */}
                {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
                {/* Ejemplo: Ruta para "Mis Reservas", accesible por todos los roles logueados */}
                {/* <Route path="/mis-reservas" element={<MisReservasPage />} /> */}
            </Route>

            {/* --- Rutas Protegidas por Rol Específico --- */}

            {/* Rutas de Administrador */}
            <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
                {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                {/* <Route path="/admin/gestion-usuarios" element={<AdminGestionUsuarios />} /> */}
                <Route path="/admin/crear-usuario" element={<AdminCreateUserPage />} /> {/* <-- NUEVA RUTA AÑADIDA */}
            </Route>

            {/* Rutas de Vendedor */}
            <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
                {/* <Route path="/vendedor/panel" element={<VendedorPanel />} /> */}
                {/* <Route path="/vendedor/mis-productos" element={<VendedorMisProductos />} /> */}
            </Route>

            {/* Rutas de Cliente (si hay rutas específicas que no sean el dashboard general) */}
            {/* <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
                 <Route path="/cliente/mis-compras-especificas" element={<ClienteMisCompras />} />
            </Route> */}


            {/* Ruta Catch-all: Idealmente a una página 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} /> {/* O redirige a Home */}
        </Routes>
    );
};

export default AppRouter;