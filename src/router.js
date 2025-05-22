// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Menu from "./components/Menu"; // Ejemplo de componente para ruta protegida
import Home from "./pages/Home";     // Ejemplo de página de inicio pública o landing
import ProtectedRoute from "./components/ProtectedRoute";

const AppRouter = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} /> {/* O redirige a login si prefieres */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
                <Route path="/menu" element={<Menu />} />
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                {/* <Route path="/profile" element={<Profile />} /> */}
            </Route>

            {/* Ruta Catch-all para redirigir si no coincide nada */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;