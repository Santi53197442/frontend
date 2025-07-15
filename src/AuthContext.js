// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api';

const AuthContext = createContext(null);

const AuthLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>Verificando sesión, por favor espera...</p>
    </div>
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const response = await getCurrentUserProfile();
                    const userData = response.data;
                    if (userData && userData.id) {
                        const rolLowerCase = userData.rol?.toLowerCase() || '';
                        const fullUserData = { token: storedToken, ...userData, rol: rolLowerCase };
                        setUser(fullUserData);
                        setIsAuthenticated(true);
                        localStorage.setItem('userId', String(userData.id));
                        localStorage.setItem('userRol', rolLowerCase);
                    } else { throw new Error("Token inválido."); }
                } catch (e) {
                    console.error("Fallo al verificar token durante la inicialización:", e);
                    ['authToken', 'userId', 'userRol'].forEach(item => localStorage.removeItem(item));
                    setUser(null);
                    setIsAuthenticated(false);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    // --- ¡FUNCIÓN LOGIN MODIFICADA! ---
    const login = async (credentials, redirectTo = null) => { // 1. Acepta el segundo argumento opcional 'redirectTo'
        setLoading(true);
        setError("");
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, ...userData } = response.data;

            if (!token || typeof userData.id === 'undefined') {
                throw new Error("La respuesta del login es incompleta.");
            }

            const rolLowerCase = userData.rol?.toLowerCase() || '';

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(userData.id));
            localStorage.setItem('userEmail', userData.email || '');
            localStorage.setItem('userRol', rolLowerCase);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ token, ...userData, rol: rolLowerCase });
            setIsAuthenticated(true);

            // --- 2. LÓGICA DE REDIRECCIÓN CORREGIDA ---
            if (redirectTo && redirectTo !== "/") {
                // Si `redirectTo` tiene un valor específico (ej: '/compra/viaje/...'), vamos allí.
                navigate(redirectTo, { replace: true });
            } else {
                // Si no, usamos la lógica de redirección por rol que ya tenías.
                if (rolLowerCase === 'administrador') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (rolLowerCase === 'vendedor') {
                    navigate('/vendedor/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            }

            setLoading(false);
            return true; // Indica que el login fue exitoso

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error en el login. Verifica tus credenciales.";
            setError(errorMessage);
            setLoading(false);
            return false; // Indica que el login falló
        }
    };

    const updateUserContext = (backendResponseData) => {
        const currentUserToken = user?.token || localStorage.getItem('authToken');
        if (!currentUserToken || typeof backendResponseData.id === 'undefined') return;

        const rolLowerCase = backendResponseData.rol?.toLowerCase() || user?.rol || '';
        const updatedUserData = { token: currentUserToken, ...backendResponseData, rol: rolLowerCase };
        setUser(updatedUserData);
        setIsAuthenticated(true);
        localStorage.setItem('userId', String(updatedUserData.id));
        localStorage.setItem('userEmail', updatedUserData.email || '');
        localStorage.setItem('userRol', updatedUserData.rol || '');
        if (updatedUserData.tipoCliente) {
            localStorage.setItem('userTipoCliente', updatedUserData.tipoCliente);
        } else {
            localStorage.removeItem('userTipoCliente');
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        delete apiClient.defaults.headers.common['Authorization'];
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('user') || key === 'authToken') {
                localStorage.removeItem(key);
            }
        });
        navigate('/login', { replace: true });
    };

    const value = { user, isAuthenticated, loading, error, login, logout, updateUserContext, setError };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <AuthLoader /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
