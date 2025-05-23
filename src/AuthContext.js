// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './services/api'; // Tu instancia de Axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); // <--- ESTADO PARA EL ERROR AÑADIDO
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
            if (storedToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials, preloadedUser = null) => {
        setError(""); // Limpiar errores previos al intentar un nuevo login
        if (preloadedUser) {
            // ... (tu lógica para preloadedUser está bien) ...
            setUser(preloadedUser);
            setIsAuthenticated(true);
            localStorage.setItem('authToken', preloadedUser.token || '');
            // ... (resto del guardado en localStorage)
            if (preloadedUser.token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${preloadedUser.token}`;
            }
            return true;
        }

        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            // ... (guardar en localStorage) ...
            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email || '');
            localStorage.setItem('userRol', rol || '');
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || '');

            setUser({ token, email, rol, nombre, apellido, ci, telefono, fechaNac });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            if (rol && rol.toLowerCase() === 'admin') { // Comparación insensible a mayúsculas
                navigate('/menu');
            } else {
                navigate('/');
            }
            return true;

        } catch (err) { // 'err' en lugar de 'error' para no colisionar con el estado 'error'
            console.error("Error en el login (AuthContext):", err.response?.data || err.message);
            setIsAuthenticated(false);
            setUser(null);
            ['authToken', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = err.response?.data?.message || "Login fallido. Verifique sus credenciales.";
            setError(errorMessage); // <--- SETEAR EL ESTADO DE ERROR AQUÍ
            // alert(errorMessage); // Puedes quitar el alert si el componente Login lo muestra
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        const currentUserToken = user ? user.token : localStorage.getItem('authToken');

        if (!currentUserToken) {
            console.error("AuthContext: No hay token para actualizar el contexto del usuario.");
            logout();
            return;
        }
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
        // En lugar de llamar a login(null, preloadedUser) que puede tener efectos secundarios como navegación,
        // actualiza directamente el estado y localStorage si solo es una actualización de datos.
        setUser(updatedUserDataForContext);
        setIsAuthenticated(true); // Debería seguir siendo true
        localStorage.setItem('userEmail', updatedUserDataForContext.email || '');
        localStorage.setItem('userRol', updatedUserDataForContext.rol || '');
        localStorage.setItem('userNombre', updatedUserDataForContext.nombre || '');
        localStorage.setItem('userApellido', updatedUserDataForContext.apellido || '');
        localStorage.setItem('userCI', String(updatedUserDataForContext.ci || ''));
        localStorage.setItem('userTelefono', String(updatedUserDataForContext.telefono || ''));
        localStorage.setItem('userFechaNac', updatedUserDataForContext.fechaNac || '');
        // No es necesario llamar a login() aquí si solo actualizas datos y el token no cambia.
    };

    const logout = () => {
        ['authToken', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
        setUser(null);
        setIsAuthenticated(false);
        setError(""); // Limpiar errores al hacer logout
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
            error,           // <--- EXPONER error
            setError         // <--- EXPONER setError
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