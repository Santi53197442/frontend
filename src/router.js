// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- IMPORTACIONES DE COMPONENTES Y PÁGINAS ---
// Asegúrate de que las rutas sean correctas según tu estructura de carpetas
import Home from "./pages/Home"; // Asumiendo que Home.js está en src/pages/
import Login from "./components/Login"; // Asumiendo que Login.js está en src/components/
import Register from "./components/Register"; // Asumiendo que Register.js está en src/components/
import ForgotPasswordPage from './components/ForgotPassword'; // O la ruta correcta a este componente
import ResetPasswordPage from './components/ResetPassword'; // O la ruta correcta
import ProtectedRoute from "./components/ProtectedRoute"; // Asumiendo que está en src/components/
import EditProfile from "./components/EditProfile"; // Asumiendo que está en src/components/

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';

// --- PÁGINAS DE ADMIN ---
import AdminCreateUserPage from './pages/admin/AdminCreateUserPage'; // Verifica esta ruta, podría ser src/pages/admin/
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserBatchUploadPage from './pages/admin/AdminUserBatchUploadPage';
import AdminUserListPage from "./pages/admin/AdminUserListPage";
import AdminUserListDeletePage from './pages/admin/AdminUserListDeletePage';

// --- PÁGINAS DE OTROS ROLES (Ejemplos, descomenta e importa si los creas) ---
// import VendedorPanel from './pages/vendedor/VendedorPanel';
// import ClienteMisReservas from './pages/cliente/ClienteMisReservas';

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
                    <Route path="listar-usuarios" element={<AdminUserListPage />} />
                    <Route path="eliminar-usuarios" element={<AdminUserListDeletePage />} />
                    {/* <Route path="gestion-productos" element={<AdminGestionProductos />} /> */}
                </Route>
            </Route>

            {/* --- Rutas de Vendedor (Ejemplo) --- */}
            {/*
            <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}>
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