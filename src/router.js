// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- Componentes y Páginas ---
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout'; // <-- IMPORTAR ADMIN LAYOUT

// --- PÁGINAS DE ADMIN ---
import AdminCreateUserPage from './components/AdminCreateUserPage';
import AdminDashboard from './pages/admin/AdminDashboard';     // Debes crear este componente

// --- PÁGINAS DE OTROS ROLES (Ejemplos, debes crearlas si las necesitas) ---
// import VendedorPanel from './pages/vendedor/VendedorPanel';
// import ClienteMisReservas from './pages/cliente/ClienteMisReservas';

// --- PÁGINAS ADICIONALES ---
// import UnauthorizedPage from './pages/UnauthorizedPage';
// import NotFoundPage from './pages/NotFoundPage';

const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}

            {/* --- Rutas Protegidas (Autenticación General Requerida) --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/editar-perfil" element={<EditProfile />} />
                {/* <Route path="/mis-reservas" element={<ClienteMisReservas />} /> */}
            </Route>

            {/* --- Rutas de Administración (Layout de Admin y Protección por Rol) --- */}
            <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
                <Route path="/admin" element={<AdminLayout />}> {/* Ruta padre para el layout de admin */}
                    <Route index element={<AdminDashboard />} /> {/* Ruta por defecto para /admin */}
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="crear-usuario" element={<AdminCreateUserPage />} />
                    {/* <Route path="gestion-productos" element={<AdminGestionProductos />} /> */}
                    {/* Añade más rutas hijas de admin aquí */}
                </Route>
            </Route>

            {/* --- Rutas de Vendedor (Ejemplo si tuvieran su propio layout o sección) --- */}
            {/*
            <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}> // Si tuvieras VendedorLayout
                    <Route index element={<VendedorPanel />} />
                    <Route path="panel" element={<VendedorPanel />} />
                </Route>
            </Route>
            */}

            {/* Ruta Catch-all */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;