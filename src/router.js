// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// Componentes y Páginas existentes
import Login from "./components/Login";
import Register from "./components/Register";
// import Menu from "./components/Menu"; // Menu usualmente es parte del layout, no una ruta en sí misma
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";

// Nuevos componentes para recuperación de contraseña
// Asumo que los moviste a /components según tu captura de pantalla anterior
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';

// Páginas de ejemplo para diferentes roles (debes crearlas)
// import AdminDashboard from './pages/AdminDashboard';
// import VendedorPanel from './pages/VendedorPanel';
// import ClienteDashboard from './pages/ClienteDashboard'; // Podría ser Home o una específica
// import UnauthorizedPage from './pages/UnauthorizedPage'; // Para acceso denegado

const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}


            {/* --- Rutas que podrían ser públicas o protegidas según tu lógica --- */}
            {/* Si Home es para todos, incluso no logueados: */}
            <Route path="/" element={<Home />} />


            {/* --- Rutas Protegidas (Autenticación Requerida) --- */}
            <Route element={<ProtectedRoute />}>
                {/* Rutas comunes para cualquier usuario autenticado */}
                <Route path="/editar-perfil" element={<EditProfile />} />
                {/* Si Home fuera solo para usuarios logueados, iría aquí: */}
                {/* <Route path="/dashboard" element={<Home />} /> */}
                {/* <Route path="/cliente-dashboard" element={<ClienteDashboard />} /> */}
            </Route>

            {/* --- Rutas Protegidas por Rol Específico --- */}
            {/* Administrador */}
            <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
                {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                {/* <Route path="/admin/gestion-usuarios" element={<GestionUsuarios />} /> */}
                {/* Si tu Menu.js es una PÁGINA solo para admin y se accede por ruta /menu: */}
                {/* <Route path="/menu" element={<Menu />} /> */}
            </Route>

            {/* Vendedor */}
            <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
                {/* <Route path="/vendedor/panel" element={<VendedorPanel />} /> */}
                {/* <Route path="/vendedor/mis-productos" element={<MisProductosVendedor />} /> */}
            </Route>

            {/* Cliente (si tiene rutas específicas protegidas más allá de Home/Dashboard) */}
            {/* <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
                <Route path="/mis-compras" element={<MisCompras />} />
            </Route> */}


            {/* Ruta Catch-all: Redirige a Home o a una página 404 */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;