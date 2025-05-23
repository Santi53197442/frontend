// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Loading inicial del contexto
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedEmail = localStorage.getItem('userEmail');
        const storedRol = localStorage.getItem('userRol');
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
            if (storedToken) { // Asegúrate de que el token exista antes de setearlo
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials, preloadedUser = null) => {
        if (preloadedUser) {
            // Este caso es para cuando actualizamos el perfil y ya tenemos los datos,
            // o cuando el login del backend devuelve todos los datos actualizados.
            setUser(preloadedUser);
            setIsAuthenticated(true);

            // Actualiza localStorage con los datos preloadedUser
            localStorage.setItem('authToken', preloadedUser.token || '');
            localStorage.setItem('userEmail', preloadedUser.email || '');
            localStorage.setItem('userRol', preloadedUser.rol || '');
            localStorage.setItem('userNombre', preloadedUser.nombre || '');
            localStorage.setItem('userApellido', preloadedUser.apellido || '');
            localStorage.setItem('userCI', String(preloadedUser.ci || ''));
            localStorage.setItem('userTelefono', String(preloadedUser.telefono || ''));
            localStorage.setItem('userFechaNac', preloadedUser.fechaNac || '');

            if (preloadedUser.token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${preloadedUser.token}`;
            }
            return true; // Indica éxito para la actualización del contexto
        }

        // Flujo normal de login
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email || '');
            localStorage.setItem('userRol', rol || '');
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || '')); // Guardar como string, o manejar null
            localStorage.setItem('userTelefono', String(telefono || '')); // Guardar como string
            localStorage.setItem('userFechaNac', fechaNac || '');


            setUser({ token, email, rol, nombre, apellido, ci, telefono, fechaNac });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            if (rol === 'admin') {
                navigate('/menu');
            } else {
                navigate('/'); // O a la ruta home del cliente
            }
            return true;

        } catch (error) {
            console.error("Error en el login:", error.response?.data || error.message);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRol');
            localStorage.removeItem('userNombre');
            localStorage.removeItem('userApellido');
            localStorage.removeItem('userCI');
            localStorage.removeItem('userTelefono');
            localStorage.removeItem('userFechaNac');
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : (error.response?.data?.message || "Login fallido. Verifique sus credenciales.");
            alert(errorMessage); // Considera usar un sistema de notificaciones más amigable
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        // backendResponseData debe ser el objeto Usuario actualizado del backend
        // incluyendo nombre, apellido, email, rol, ci, telefono, fechaNac
        const currentUserToken = user ? user.token : localStorage.getItem('authToken');

        if (!currentUserToken) {
            console.error("No hay token para actualizar el contexto del usuario.");
            // Podrías redirigir al login si no hay token, o manejarlo de otra forma
            // logout();
            return;
        }

        const updatedUserDataForContext = {
            token: currentUserToken, // Mantenemos el token actual
            ...backendResponseData // El resto de los datos vienen del backend
        };

        // Reutilizamos la lógica de 'login' con datos pre-cargados
        // para actualizar el estado global y localStorage.
        login(null, updatedUserDataForContext);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRol');
        localStorage.removeItem('userNombre');
        localStorage.removeItem('userApellido');
        localStorage.removeItem('userCI');
        localStorage.removeItem('userTelefono');
        localStorage.removeItem('userFechaNac');
        setUser(null);
        setIsAuthenticated(false);
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading, updateUserContext }}>
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