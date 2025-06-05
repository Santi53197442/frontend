// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// --- IMPORTACIONES DE COMPONENTES Y PÁGINAS ---
// Públicas
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPasswordPage from './components/ForgotPassword';
import ResetPasswordPage from './components/ResetPassword';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import VendedorLayout from './layouts/VendedorLayout';

// Protegidas y Usuario General
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import CambiarContraseña from "./components/CambiarContraseña";

// Admin
import AdminCreateUserPage from './pages/admin/AdminCreateUserPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserBatchUploadPage from './pages/admin/AdminUserBatchUploadPage';
import AdminUserListPage from "./pages/admin/AdminUserListPage";
import AdminUserListDeletePage from './pages/admin/AdminUserListDeletePage';

// Vendedor y Comunes
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
import SeleccionAsientosPage from "./pages/vendedor/SeleccionAsientosPage"; // Para VENDEDOR
import CheckoutPage from './pages/vendedor/CheckoutPage'; // Para VENDEDOR
import VendedorListadoPasajesViaje from './pages/vendedor/VendedorListadoPasajesViaje'; // Asegúrate que esta sea la única para esta funcionalidad

// Cliente Específico
import ClienteSeleccionAsientosPage from "./pages/cliente/ClienteSeleccionAsientosPage";
import ClienteCheckoutPage from "./pages/cliente/ClienteCheckoutPage";
// *** NUEVA IMPORTACIÓN PARA LA PÁGINA DE HISTORIAL DE PASAJES DEL CLIENTE ***
import ClienteListarPasajes from './pages/cliente/ClienteListarPasajes'; // Asegúrate que la ruta sea correcta

// Página de Acceso Denegado
const UnauthorizedPage = () => (
    <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes los permisos necesarios para acceder a esta página.</p>
        <button onClick={() => window.history.back()} style={{padding: '10px 20px', marginTop: '20px'}}>Volver</button>
    </div>
);


const AppRouter = () => {
    return (
        <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Esta ruta "/viajes" parece ser accesible para todos, o al menos para clientes y vendedores,
                considera si necesita un ProtectedRoute si solo es para usuarios logueados. */}
            <Route path="/viajes" element={<VendedorListadoViajesCompra />} />

            {/* --- RUTAS DEL FLUJO DE COMPRA DEL CLIENTE (SIN LAYOUT DE VENDEDOR) --- */}
            {/* También protegidas para cualquier rol logueado, pero ClienteSeleccionAsientosPage y ClienteCheckoutPage
                internamente pueden tener lógica específica o usar datos del contexto del cliente */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente', 'VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador']} />}>
                <Route path="/compra/viaje/:viajeId/seleccionar-asientos" element={<ClienteSeleccionAsientosPage />} />
                <Route path="/compra/viaje/:viajeId/asiento/:asientoNumero/checkout" element={<ClienteCheckoutPage />} />
            </Route>

            {/* --- RUTAS GENERALES DE USUARIO LOGUEADO --- */}
            <Route element={<ProtectedRoute />}> {/* Protegido para cualquier usuario logueado */}
                <Route path="/editar-perfil" element={<EditProfile />} />
                <Route path="/cambiar-contraseña" element={<CambiarContraseña />} />

                {/* *** NUEVA RUTA PARA EL HISTORIAL DE PASAJES DEL CLIENTE *** */}
                {/* Esta ruta solo debe ser accesible para el rol CLIENTE */}
                {/* La colocamos dentro de un ProtectedRoute que ya existe, pero le especificamos el rol.
                    Si quieres que /mis-pasajes esté fuera del layout del vendedor/admin,
                    esta ubicación está bien. Si no, puedes crear un nuevo <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente']}/>}>
                    específico para esta y otras rutas de cliente. */}
            </Route>

            {/* --- RUTA ESPECÍFICA PARA CLIENTE: MIS PASAJES --- */}
            {/* Usamos un ProtectedRoute dedicado para asegurar que solo clientes accedan */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente']} />}>
                <Route path="/mis-pasajes" element={<ClienteListarPasajes />} />
            </Route>


            {/* --- Rutas de ADMIN --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'administrador']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} /> {/* Redirige /admin a /admin/dashboard */}
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="crear-usuario" element={<AdminCreateUserPage />} />
                    <Route path="carga-masiva-usuarios" element={<AdminUserBatchUploadPage />} />
                    <Route path="listar-usuarios" element={<AdminUserListPage />} />
                    <Route path="eliminar-usuarios" element={<AdminUserListDeletePage />} />
                </Route>
            </Route>

            {/* --- Rutas de VENDEDOR (y Admin también puede acceder) --- */}
            <Route element={<ProtectedRoute allowedRoles={['VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} /> {/* Redirige /vendedor a /vendedor/dashboard */}
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
                    <Route path="viaje/:viajeId/seleccionar-asientos" element={<SeleccionAsientosPage />} />
                    <Route path="viaje/:viajeId/asiento/:asientoNumero/checkout" element={<CheckoutPage />} />
                    <Route path="pasajes-por-viaje" element={<VendedorListadoPasajesViaje />} />
                </Route>
            </Route>

            {/* Ruta Catch-all para redirigir a Home si no se encuentra la ruta */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;