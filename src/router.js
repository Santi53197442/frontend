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
import ServiciosPage from "./pages/ServiciosPage";
import TarifasHorarios from "./pages/TarifasHorarios";

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
import AdminEstadisticasUsuarios from './pages/admin/AdminEstadisticasUsuarios';

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
import SeleccionAsientosPage from "./pages/vendedor/SeleccionAsientosPage";
import CheckoutPage from './pages/vendedor/CheckoutPage';
import VendedorListadoPasajesViaje from './pages/vendedor/VendedorListadoPasajesViaje';
import VendedorEstadisticasViaje from './pages/vendedor/VendedorEstadisticasViaje';
import VendedorEstadisticasOmnibus from './pages/vendedor/VendedorEstadisticasOmnibus';
import VendedorEstadisticasPasajes from './pages/vendedor/VendedorEstadisticasPasajes';
import VendedorGestionDevolucionesPage from './pages/vendedor/VendedorGestionDevolucionesPage';


// Cliente Específico
import ClienteSeleccionAsientosPage from "./pages/cliente/ClienteSeleccionAsientosPage";
import ClienteCheckoutPage from "./pages/cliente/ClienteCheckoutPage";
import ClienteListarPasajes from './pages/cliente/ClienteListarPasajes';

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
            <Route path="/viajes" element={<VendedorListadoViajesCompra />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/tarifas-horarios" element={<TarifasHorarios />} />

            {/* --- RUTAS DEL FLUJO DE COMPRA DEL CLIENTE --- */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente', 'VENDEDOR', 'vendedor', 'ADMINISTRADOR', 'administrador']} />}>
                <Route path="/compra/viaje/:viajeId/seleccionar-asientos" element={<ClienteSeleccionAsientosPage />} />

                {/* ----- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE! ----- */}
                {/* Se cambia ":asientoNumero" por ":asientosString" para aceptar múltiples asientos */}
                <Route path="/compra/viaje/:viajeId/asientos/:asientosString/checkout" element={<ClienteCheckoutPage />} />
            </Route>

            {/* --- RUTAS GENERALES DE USUARIO LOGUEADO --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/editar-perfil" element={<EditProfile />} />
                <Route path="/cambiar-contraseña" element={<CambiarContraseña />} />
            </Route>

            {/* --- RUTA ESPECÍFICA PARA CLIENTE: MIS PASAJES --- */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'cliente']} />}>
                <Route path="/mis-pasajes" element={<ClienteListarPasajes />} />
            </Route>

            {/* --- Rutas de ADMIN --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'administrador']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="crear-usuario" element={<AdminCreateUserPage />} />
                    <Route path="carga-masiva-usuarios" element={<AdminUserBatchUploadPage />} />
                    <Route path="listar-usuarios" element={<AdminUserListPage />} />
                    <Route path="eliminar-usuarios" element={<AdminUserListDeletePage />} />
                    <Route path="estadisticas-usuarios" element={<AdminEstadisticasUsuarios />} />
                </Route>
            </Route>

            {/* --- Rutas de VENDEDOR (y Admin también puede acceder) --- */}
            <Route element={<ProtectedRoute allowedRoles={['VENDEDOR', 'vendedor']} />}>
                <Route path="/vendedor" element={<VendedorLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
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
                    {/* Nota: esta ruta de vendedor sigue funcionando para 1 solo asiento, no la hemos modificado. */}
                    <Route path="viaje/:viajeId/asiento/:asientoNumero/checkout" element={<CheckoutPage />} />
                    <Route path="pasajes-por-viaje" element={<VendedorListadoPasajesViaje />} />
                    <Route path="estadisticas-viaje" element={<VendedorEstadisticasViaje />} />
                    <Route path="estadisticas-omnibus" element={<VendedorEstadisticasOmnibus />} />
                    <Route path="estadisticas-ventas" element={<VendedorEstadisticasPasajes />} />
                    <Route path="gestion-devoluciones" element={<VendedorGestionDevolucionesPage />} />
                </Route>
            </Route>

            {/* Ruta Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;
