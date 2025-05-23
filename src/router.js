// src/router.js
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile"; // <-- IMPORTA EditProfile

const AppRouter = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}> {/* Envuelve las rutas que necesitan autenticación */}
                <Route path="/menu" element={<Menu />} />
                <Route path="/editar-perfil" element={<EditProfile />} /> {/* <-- NUEVA RUTA */}
                {/* Aquí podrías añadir más rutas protegidas, ej:
                <Route path="/mis-reservas" element={<MisReservas />} />
                */}
            </Route>

            {/* Ruta Catch-all para redirigir si no coincide nada */}
            {/* Considera una página 404 en lugar de redirigir siempre a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;