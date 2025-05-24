// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- IMPORTACIONES DE COMPONENTES Y PÁGINAS ---
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';

// --- PÁGINAS DE ADMIN ---
import AdminCreateUserPage from './pages/admin/AdminCreateUserPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserBatchUploadPage from './pages/admin/AdminUserBatchUploadPage';
import AdminUserListPage from './pages/admin/AdminUserListPage'; // <--- IMPORTA LA NUEVA PÁGINA

// ... (otras importaciones si las tienes) ...

const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* --- Rutas Protegidas (Autenticación General Requerida) --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/editar-perfil" element={<EditProfile />} />
                {/* <Route path="/mis-reservas" element={<ClienteMisReservas />} /> */}
            </Route>

            {/* --- Rutas de Administración (Layout de Admin y Protección por Rol) --- */}
            <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="crear-usuario" element={<AdminCreateUserPage />} />
                    <Route path="carga-masiva-usuarios" element={<AdminUserBatchUploadPage />} />
                    <Route path="lista-usuarios" element={<AdminUserListPage />} /> {/* <--- AÑADE LA RUTA AQUÍ */}
                    {/* <Route path="gestion-productos" element={<AdminGestionProductos />} /> */}
                </Route>
            </Route>

            {/* ... (otras rutas de roles si las tienes) ... */}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;