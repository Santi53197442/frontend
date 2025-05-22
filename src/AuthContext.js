// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './services/api'; // Asumiendo que tu instancia de Axios está aquí

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Almacenará { token, email, rol, nombre, apellido }
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Comprobar si hay datos de usuario al cargar la app
        const storedToken = localStorage.getItem('authToken');
        const storedEmail = localStorage.getItem('userEmail');
        const storedRol = localStorage.getItem('userRol');
        const storedNombre = localStorage.getItem('userNombre');
        const storedApellido = localStorage.getItem('userApellido');

        if (storedToken && storedEmail) { // Usamos email como un indicador de que hay datos válidos
            setUser({
                token: storedToken,
                email: storedEmail,
                rol: storedRol,
                nombre: storedNombre || null, // Si es null en localStorage, que quede null
                apellido: storedApellido || null // Si es null en localStorage, que quede null
            });
            setIsAuthenticated(true);
            // Configurar el token en la instancia de apiClient para futuras solicitudes
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            // ASEGÚRATE de que tu backend devuelva estos campos: token, email, rol, nombre, apellido
            const { token, email, rol, nombre, apellido } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRol', rol || ''); // Guarda un string vacío si rol es null/undefined
            localStorage.setItem('userNombre', nombre || ''); // Guarda un string vacío si nombre es null/undefined
            localStorage.setItem('userApellido', apellido || ''); // Guarda un string vacío si apellido es null/undefined

            setUser({ token, email, rol, nombre, apellido });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Redirigir basado en rol (ejemplo)
            if (rol === 'admin') {
                navigate('/menu'); // O tu ruta de dashboard de admin
            } else if (rol === 'cliente') {
                navigate('/home-cliente'); // O tu ruta de dashboard de cliente
            } else {
                navigate('/'); // Ruta por defecto
            }
            return true;

        } catch (error) {
            console.error("Error en el login:", error.response?.data || error.message);
            setIsAuthenticated(false);
            setUser(null);
            // Limpia todas las credenciales de localStorage si el login falla
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRol');
            localStorage.removeItem('userNombre');
            localStorage.removeItem('userApellido');
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : (error.response?.data?.message || "Login fallido. Verifique sus credenciales.");
            alert(errorMessage);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRol');
        localStorage.removeItem('userNombre');
        localStorage.removeItem('userApellido');
        setUser(null);
        setIsAuthenticated(false);
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    if (loading) {
        return <div>Cargando aplicación...</div>; // O un componente Spinner
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