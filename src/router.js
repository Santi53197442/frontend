// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- IMPORTACIONES DE COMPONENTES Y PÁGINAS ---
// Asegúrate que todas estas rutas de importación sean correctas para tu estructura de proyecto
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import CambiarContraseña from "./components/CambiarContraseña";

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';
import VendedorLayout from './layouts/VendedorLayout';

// --- PÁGINAS DE ADMIN ---
import AdminCreateUserPage from './pages/admin/AdminCreateUserPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserBatchUploadPage from './pages/admin/AdminUserBatchUploadPage';
import AdminUserListPage from "./pages/admin/AdminUserListPage";
import AdminUserListDeletePage from './pages/admin/AdminUserListDeletePage';

// --- PÁGINAS DE VENDEDOR ---
import VendedorDashboard from './pages/vendedor/VendedorDashboard';
import VendedorAltaLocalidadPage from './pages/vendedor/VendedorAltaLocalidadPage';
import VendedorLocalidadMasivo from './pages/vendedor/VendedorLocalidadMasivo';
import VendedorAltaOmnibusPage from "./pages/vendedor/VendedorAltaOmnibusPage";
import VendedorOmnibusMasivo from "./pages/vendedor/VendedorOmnibusMasivo";
import VendedorAltaViajePage from './pages/vendedor/VendedorAltaViajePage';
import VendedorListarOmnibusPage from './pages/vendedor/VendedorListarOmnibusPage';
import VendedorCambiarEstadoOmnibus from './pages/vendedor/VendedorCambiarEstadoOmnibus';
import VendedorCambiarOmnibusaOperativo from './pages/vendedor/VendedorCambiarOmnibusaOperativo';
import VendedorReasignarViaje from './pages/vendedor/VendedorReasignarViaje';
import VendedorListarViajes from './pages/vendedor/VendedorListarViajes';
// El componente VendedorListadoViajesCompra se usa tanto para la ruta /viajes (cliente)
// como para /vendedor/listar-viajes-compra (vendedor)
import VendedorListadoViajesCompra from "./pages/vendedor/VendedorListadoViajesCompra";
import SeleccionAsientosPage from "./pages/vendedor/SeleccionAsientosPage";
import CheckoutPage from './pages/vendedor/CheckoutPage';

const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* --- RUTA PARA VER LISTADO DE VIAJES (usada por clientes desde Home) --- */}
            {/* Esta ruta renderiza VendedorListadoViajesCompra SIN el VendedorLayout */}
            <Route path="/viajes" element={<VendedorListadoViajesCompra />} />

            {/* --- Rutas Protegidas (Autenticación General Requerida) --- */}
            {/* Estas rutas no tienen un layout específico de rol, podrían tener un layout general o ninguno */}
            <Route element={<ProtectedRoute />}>
                <Route path="/editar-perfil" element={<EditProfile />} />
                <Route path="/cambiar-contraseña" element={<CambiarContraseña />} />
            </Route>

            {/* --- Rutas de Administración (con AdminLayout) --- */}
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

            {/* --- Rutas de Vendedor (con VendedorLayout) --- */}
            {/* El VendedorLayout decidirá si muestra su menú lateral basado en el rol del usuario */}
            {/* ProtectedRoute aquí permite a CLIENTES, VENDEDORES, y ADMINS acceder a estas rutas. */}
            {/* El layout se encargará de la apariencia. */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente', 'VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}>
                    {/* Rutas solo para Vendedor/Admin (el layout mostrará el menú) */}
                    <Route index element={<VendedorDashboard />} />
                    <Route path="dashboard" element={<VendedorDashboard />} />
                    <Route path="alta-localidad" element={<VendedorAltaLocalidadPage />} />
                    <Route path="alta-masiva-localidades" element={<VendedorLocalidadMasivo />} />
                    <Route path="alta-omnibus" element={<VendedorAltaOmnibusPage />} />
                    <Route path="alta-masiva-omnibus" element={<VendedorOmnibusMasivo />} />
                    <Route path="alta-viaje" element={<VendedorAltaViajePage />} />
                    <Route path="listar-omnibus" element={<VendedorListarOmnibusPage />} />
                    <Route path="cambiar-a-inactivo" element={<VendedorCambiarEstadoOmnibus />} />
                    <Route path="cambiar-a-activo" element={<VendedorCambiarOmnibusaOperativo />} />
                    <Route path="reasignar-viaje" element={<VendedorReasignarViaje />} />
                    <Route path="listar-viajes" element={<VendedorListarViajes />} />
                    <Route path="listar-viajes-compra" element={<VendedorListadoViajesCompra />} />

                    {/* Flujo de compra que puede ser usado por Vendedor (con menú) o Cliente (sin menú gracias al layout condicional) */}
                    <Route path="viaje/:viajeId/seleccionar-asientos" element={<SeleccionAsientosPage />} />
                    <Route path="viaje/:viajeId/asiento/:asientoNumero/checkout" element={<CheckoutPage />} />
                </Route>
            </Route>

            {/* Ruta Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;