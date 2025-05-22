// src/router.js (o AppRouter.js)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import BrowserRouter
import Login from "./components/Login";
import Register from "./components/Register";
import Menu from "./components/Menu"; // Asumo que tienes este componente
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./AuthContext"; // Importa AuthProvider

const AppRouter = () => {
    // La lógica de isLoggedIn ahora se maneja en AuthContext y ProtectedRoute
    return (
        <AuthProvider> {/* Envuelve tus rutas con AuthProvider */}
            {/* <BrowserRouter> Ya no necesitas BrowserRouter aquí si lo pones en index.js o App.js */}
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/menu" element={<Menu />} />
                    {/* Añade aquí otras rutas protegidas */}
                    {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} /> {/* Ruta catch-all */}
            </Routes>
            {/* </BrowserRouter> */}
        </AuthProvider>
    );
};

export default AppRouter;