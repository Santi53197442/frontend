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
import VendedorLayout from './layouts/VendedorLayout'; // <-- NUEVO: Importar VendedorLayout

// --- PÁGINAS DE ADMIN ---
import AdminCreateUserPage from './pages/admin/AdminCreateUserPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserBatchUploadPage from './pages/admin/AdminUserBatchUploadPage';
import AdminUserListPage from "./pages/admin/AdminUserListPage";
import AdminUserListDeletePage from './pages/admin/AdminUserListDeletePage';

// --- PÁGINAS DE VENDEDOR ---
import VendedorDashboard from './pages/vendedor/VendedorDashboard';         // <-- NUEVO
import VendedorAltaLocalidadPage from './pages/vendedor/VendedorAltaLocalidadPage'; // <-- NUEVO
// import VendedorMisLocalidadesPage from './pages/vendedor/VendedorMisLocalidadesPage'; // Si la creas

// --- PÁGINAS ADICIONALES (Ejemplos, descomenta e importa si los creas) ---
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
            {/* Si ProtectedRoute sin allowedRoles solo verifica si está autenticado */}
            <Route element={<ProtectedRoute />}>
                <Route path="/editar-perfil" element={<EditProfile />} />
                {/* <Route path="/mis-reservas" element={<ClienteMisReservas />} /> */}
            </Route>

            {/* --- Rutas de Administración (Layout de Admin y Protección por Rol) --- */}
            {/* Asumo que tu backend devuelve 'administrador' como rol */}
            <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'administrador']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="crear-usuario" element={<AdminCreateUserPage />} />
                    <Route path="carga-masiva-usuarios" element={<AdminUserBatchUploadPage />} />
                    <Route path="listar-usuarios" element={<AdminUserListPage />} />
                    <Route path="eliminar-usuarios" element={<AdminUserListDeletePage />} />
                </Route>
            </Route>

            {/* --- Rutas de Vendedor --- */}
            {/* Asumo que tu backend devuelve 'vendedor' como rol. Ajusta si es 'VENDEDOR' */}
            <Route element={<ProtectedRoute allowedRoles={['VENDEDOR', 'vendedor']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}>
                    <Route index element={<VendedorDashboard />} />
                    <Route path="dashboard" element={<VendedorDashboard />} />
                    <Route path="alta-localidad" element={<VendedorAltaLocalidadPage />} />
                    {/* <Route path="mis-localidades" element={<VendedorMisLocalidadesPage />} /> */}
                </Route>
            </Route>

            {/* Ruta Catch-all */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;