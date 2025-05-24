// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- Componentes y Páginas ---
// ... (tus imports existentes)
import AdminCreateUserPage from './components/AdminCreateUserPage'; // O donde esté
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserBatchUploadPage from './pages/admin/AdminUserBatchUploadPage'; // <-- IMPORTA LA NUEVA PÁGINA

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';

// ... (otros imports)

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
            </Route>

            {/* --- Rutas de Administración (Layout de Admin y Protección por Rol) --- */}
            <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
                <Route path="/admin" element={<AdminLayout />}> {/* Ruta padre para el layout de admin */}
                    <Route index element={<AdminDashboard />} /> {/* Ruta por defecto para /admin */}
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="crear-usuario" element={<AdminCreateUserPage />} />
                    {/* === NUEVA RUTA PARA CARGA MASIVA === */}
                    <Route path="carga-masiva-usuarios" element={<AdminUserBatchUploadPage />} />
                    {/* ==================================== */}
                    {/* <Route path="gestion-productos" element={<AdminGestionProductos />} /> */}
                    {/* Añade más rutas hijas de admin aquí */}
                </Route>
            </Route>

            {/* ... (tus otras rutas) ... */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;