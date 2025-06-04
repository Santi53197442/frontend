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
import VendedorAltaOmnibusPage from './pages/vendedor/VendedorAltaOmnibusPage';
import VendedorOmnibusMasivo from './pages/vendedor/VendedorOmnibusMasivo';
import VendedorAltaViajePage from './pages/vendedor/VendedorAltaViajePage';
import VendedorListarOmnibusPage from './pages/vendedor/VendedorListarOmnibusPage';
import VendedorCambiarEstadoOmnibus from './pages/vendedor/VendedorCambiarEstadoOmnibus';
import VendedorCambiarOmnibusaOperativo from './pages/vendedor/VendedorCambiarOmnibusaOperativo';
import VendedorReasignarViaje from './pages/vendedor/VendedorReasignarViaje';
import VendedorListarViajes from './pages/vendedor/VendedorListarViajes';
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
            <Route path="/viajes" element={<VendedorListadoViajesCompra />} />


            {/* --- RUTAS DEL FLUJO DE COMPRA DEL CLIENTE (SIN LAYOUT DE VENDEDOR) --- */}
            {/* Estas rutas son para el flujo de compra y pueden ser accedidas por CLIENTE, VENDEDOR, ADMIN */}
            {/* No están dentro de VendedorLayout para que el cliente no vea el menú del vendedor. */}
            {/* El vendedor/admin que llegue aquí (si la navegación lo permite) tampoco verá el menú de vendedor en ESTAS rutas. */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente', 'VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador']} />}>
                <Route path="/compra/viaje/:viajeId/seleccionar-asientos" element={<SeleccionAsientosPage />} />
                <Route path="/compra/viaje/:viajeId/asiento/:asientoNumero/checkout" element={<CheckoutPage />} />
            </Route>


            {/* --- Rutas Protegidas (Autenticación General Requerida) --- */}
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

            {/* --- RUTAS DE GESTIÓN DEL VENDEDOR (con VendedorLayout) --- */}
            {/* Estas rutas son exclusivamente para VENDEDOR y ADMIN y SÍ usan el VendedorLayout con su menú */}
            <Route element={<ProtectedRoute allowedRoles={['VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}>
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
                    <Route path="listar-viajes-compra" element={<VendedorListadoViajesCompra />} /> {/* Vendedor accede a su listado */}

                    {/* El flujo de compra DEL VENDEDOR (selección y checkout) también puede estar aquí si quieres que use el layout */}
                    <Route path="viaje/:viajeId/seleccionar-asientos" element={<SeleccionAsientosPage />} />
                    <Route path="viaje/:viajeId/asiento/:asientoNumero/checkout" element={<CheckoutPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;