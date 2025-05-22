// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './services/api'; // Importa la instancia configurada de Axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Almacenará { token, email, rol }
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Para manejar el estado de carga inicial
    const navigate = useNavigate();

    useEffect(() => {
        // Comprobar si hay un token al cargar la app
        const storedToken = localStorage.getItem('authToken');
        const storedEmail = localStorage.getItem('userEmail');
        const storedRol = localStorage.getItem('userRol');

        if (storedToken && storedEmail) {
            setUser({ token: storedToken, email: storedEmail, rol: storedRol });
            setIsAuthenticated(true);
            // Configurar el token en la instancia de apiClient para futuras solicitudes
            // Esto es útil si el interceptor de request no se ejecuta por alguna razón o para la primera carga
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, email, rol } = response.data; // Asume que el backend devuelve esto

            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRol', rol); // Guarda el rol también

            setUser({ token, email, rol });
            setIsAuthenticated(true);
            // Actualiza la cabecera por defecto de apiClient para futuras llamadas en esta sesión
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/menu'); // O la ruta deseada después del login
            return true; // Indica éxito
        } catch (error) {
            console.error("Error en el login:", error.response?.data || error.message);
            setIsAuthenticated(false);
            setUser(null);
            // Limpia las credenciales de localStorage si el login falla
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRol');
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : (error.response?.data?.message || "Login fallido. Verifique sus credenciales.");
            alert(errorMessage);
            return false; // Indica fallo
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRol');
        setUser(null);
        setIsAuthenticated(false);
        // Eliminar el token de las cabeceras por defecto de apiClient
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    if (loading) {
        return <div>Cargando aplicación...</div>; // O un componente Spinner más elaborado
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
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