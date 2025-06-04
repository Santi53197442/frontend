// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './services/api'; // Tu instancia de Axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); // Estado para errores de autenticación
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedEmail = localStorage.getItem('userEmail');
        const storedRol = localStorage.getItem('userRol'); // Debería ser "cliente", "administrador", etc.
        const storedNombre = localStorage.getItem('userNombre');
        const storedApellido = localStorage.getItem('userApellido');
        const storedCi = localStorage.getItem('userCI');
        const storedTelefono = localStorage.getItem('userTelefono');
        const storedFechaNac = localStorage.getItem('userFechaNac');

        if (storedToken && storedEmail) {
            setUser({
                token: storedToken,
                email: storedEmail,
                rol: storedRol || null,
                nombre: storedNombre || null,
                apellido: storedApellido || null,
                ci: storedCi || null,
                telefono: storedTelefono || null,
                fechaNac: storedFechaNac || null
            });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        setError(""); // Limpiar errores previos
        try {
            const response = await apiClient.post('/auth/login', credentials);
            // 'rol' aquí ya es el string simple del backend DTO (ej. "cliente")
            const { token, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email || '');
            localStorage.setItem('userRol', rol || ''); // Guardar el rol simple
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || '');

            setUser({ token, email, rol, nombre, apellido, ci, telefono, fechaNac });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Redirección basada en el rol (string simple)
            if (rol && rol.toLowerCase() === 'administrador') {
                navigate('/admin/dashboard'); // Asegúrate que esta ruta exista y sea para admin
            } else if (rol && rol.toLowerCase() === 'vendedor') {
                navigate('/vendedor/panel'); // Asegúrate que esta ruta exista y sea para vendedor
            } else { // Cliente o rol no reconocido/default
                navigate('/'); // Ruta principal para clientes
            }
            return true;

        } catch (err) {
            console.error("Error en el login (AuthContext):", err.response?.data || err.message);
            setIsAuthenticated(false);
            setUser(null);
            ['authToken', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = err.response?.data?.message || "Login fallido. Verifique sus credenciales.";
            setError(errorMessage);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        const currentUserToken = user ? user.token : localStorage.getItem('authToken');

        if (!currentUserToken) {
            console.error("AuthContext: No hay token para actualizar el contexto del usuario.");
            logout(); // Si no hay token, desloguear
            return;
        }
        // backendResponseData.rol ya es el string simple
        const updatedUserDataForContext = {
            token: currentUserToken,
            email: backendResponseData.email,
            rol: backendResponseData.rol,
            nombre: backendResponseData.nombre,
            apellido: backendResponseData.apellido,
            ci: backendResponseData.ci,
            telefono: backendResponseData.telefono,
            fechaNac: backendResponseData.fechaNac
        };

        setUser(updatedUserDataForContext);
        setIsAuthenticated(true);
        localStorage.setItem('userEmail', updatedUserDataForContext.email || '');
        localStorage.setItem('userRol', updatedUserDataForContext.rol || '');
        localStorage.setItem('userNombre', updatedUserDataForContext.nombre || '');
        localStorage.setItem('userApellido', updatedUserDataForContext.apellido || '');
        localStorage.setItem('userCI', String(updatedUserDataForContext.ci || ''));
        localStorage.setItem('userTelefono', String(updatedUserDataForContext.telefono || ''));
        localStorage.setItem('userFechaNac', updatedUserDataForContext.fechaNac || '');
    };

    const logout = () => {
        ['authToken', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            loading,
            updateUserContext,
            error,
            setError
        }}>
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