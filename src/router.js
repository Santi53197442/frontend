// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// Componentes y Páginas existentes
import Login from "./components/Login";
import Register from "./components/Register";
import Menu from "./components/Menu"; // Asumo que Menu es un componente que se usa dentro de rutas protegidas o es un layout
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import ForgotPasswordPage from './components/ForgotPassword'; // O './components/ForgotPassword'
import ResetPasswordPage from './components/ResetPassword';   // O './components/ResetPassword'

const AppRouter = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            {/* La ruta "/" a Home podría ser pública o necesitar ProtectedRoute dependiendo de tu lógica */}
            {/* Si Home debe ser protegida, muévela dentro de <Route element={<ProtectedRoute />}> */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* NUEVAS RUTAS PÚBLICAS PARA RECUPERACIÓN DE CONTRASEÑA */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* El token se pasará como query param */}
            {/* FIN DE NUEVAS RUTAS PÚBLICAS */}

            {/* Rutas Protegidas */}
            {/* El componente Menu podría ser parte de un layout o una ruta específica */}
            {/* Si Menu es una página a la que navegas, necesita estar dentro de ProtectedRoute */}
            {/* Si Menu es un componente de navegación siempre visible, se renderiza fuera de <Routes> o en un componente Layout */}
            <Route element={<ProtectedRoute />}> {/* Envuelve las rutas que necesitan autenticación */}
                {/* Ejemplo si Menu fuera una página navegable: <Route path="/menu" element={<Menu />} /> */}
                <Route path="/editar-perfil" element={<EditProfile />} />
                {/* Aquí podrías añadir más rutas protegidas */}
            </Route>

            {/* Ruta Catch-all */}
            {/* Considera una página 404 dedicada en lugar de redirigir siempre a home */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;