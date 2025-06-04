// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- IMPORTACIONES DE COMPONENTES Y PÁGINAS ---
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';
import ProtectedRoute from "./components/ProtectedRoute"; // Asegúrate que este componente exista y funcione
import EditProfile from "./components/EditProfile";
import CambiarContraseña from "./components/CambiarContraseña";

// --- LAYOUTS ---
import AdminLayout from './layouts/AdminLayout';
import VendedorLayout from './layouts/VendedorLayout';
// import ClienteLayout from './layouts/ClienteLayout'; // Podrías tener un layout para clientes

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
import VendedorListadoViajesCompra from "./pages/vendedor/VendedorListadoViajesCompra"; // Componente a reutilizar
import SeleccionAsientosPage from "./pages/vendedor/SeleccionAsientosPage";
import CheckoutPage from './pages/vendedor/CheckoutPage';

// --- PÁGINAS DE CLIENTE (Si las tienes separadas) ---
// import ClienteDashboard from './pages/cliente/ClienteDashboard';
// import ClienteMisViajesPage from './pages/cliente/ClienteMisViajesPage';


const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* --- RUTA PARA VER LISTADO DE VIAJES (para clientes o público) --- */}
            {/* Opción 1: Ruta pública (cualquiera puede ver la lista) */}
            <Route path="/viajes" element={<VendedorListadoViajesCompra />} />
            {/*
            Opción 2: Ruta protegida solo para roles específicos (ej. clientes logueados)
            Si eliges esta, el botón en Home solo aparecerá para clientes,
            pero esta ruta asegura que solo ellos puedan accederla directamente.
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente']} />}>
                <Route path="/viajes" element={<VendedorListadoViajesCompra />} />
            </Route>
            */}


            {/* --- Rutas Protegidas (Autenticación General Requerida) --- */}
            <Route element={<ProtectedRoute />}> {/* Asumo que esto protege para cualquier usuario logueado */}
                <Route path="/editar-perfil" element={<EditProfile />} />
                <Route path="/cambiar-contraseña" element={<CambiarContraseña />} />

                {/* Aquí podrías añadir rutas específicas de CLIENTE si las tienes */}
                {/*
                <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente']} />}>
                    <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
                    <Route path="/cliente/mis-viajes" element={<ClienteMisViajesPage />} />
                </Route>
                */}
            </Route>


            {/* --- Rutas de Administración --- */}
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
            {/* Nota: ADMIN ya tiene acceso aquí. Si CLIENTE también usa este flujo de compra, añádelo a allowedRoles */}
            <Route element={<ProtectedRoute allowedRoles={['VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador', 'CLIENTE', 'cliente']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}> {/* Si el cliente usa este layout, ok. Sino, necesitará su propia ruta/layout */}
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

                    {/* Esta ruta es para el panel de vendedor, los clientes usarán /viajes */}
                    <Route path="listar-viajes-compra" element={<VendedorListadoViajesCompra />} />

                    {/* Flujo de compra (Selección y Checkout) */}
                    {/* Si el cliente usa el mismo flujo, este path podría ser /compra/viaje/... o /viaje/... */}
                    {/* Por ahora, lo dejamos bajo /vendedor, pero el ProtectedRoute permite a CLIENTE acceder */}
                    <Route path="viaje/:viajeId/seleccionar-asientos" element={<SeleccionAsientosPage />} />
                    <Route
                        path="viaje/:viajeId/asiento/:asientoNumero/checkout"
                        element={<CheckoutPage />}
                    />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;