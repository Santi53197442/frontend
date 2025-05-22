// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from './services/api'; // Crearemos este archivo modificado a continuación
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Almacenará { token, email, rol }
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Para manejar la carga inicial
    const navigate = useNavigate();

    useEffect(() => {
        // Comprobar si hay un token al cargar la app
        const storedToken = localStorage.getItem('authToken');
        const storedEmail = localStorage.getItem('userEmail');
        const storedRol = localStorage.getItem('userRol');

        if (storedToken && storedEmail) {
            setUser({ token: storedToken, email: storedEmail, rol: storedRol });
            setIsAuthenticated(true);
            // Configurar el token en el apiClient para futuras solicitudes
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            // La función login de apiClient ahora solo hace la llamada
            const response = await apiClient.post('/auth/login', credentials);
            const { token, email, rol } = response.data; // El backend devuelve token, email, rol

            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRol', rol);

            setUser({ token, email, rol });
            setIsAuthenticated(true);
            // Configurar el token para axios globalmente
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/menu'); // O a la ruta que desees después del login
            return true;
        } catch (error) {
            console.error("Error en el login:", error.response?.data || error.message);
            setIsAuthenticated(false);
            setUser(null);
            alert(error.response?.data || "Login fallido"); // Muestra el mensaje del backend
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRol');
        setUser(null);
        setIsAuthenticated(false);
        // Eliminar el token de las cabeceras de axios
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    if (loading) {
        return <div>Cargando aplicación...</div>; // O un spinner
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);