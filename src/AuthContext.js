// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from './services/api'; // Tu instancia de Axios

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
        const storedFechaNac = localStorage.getItem('userFechaNac'); // Espera YYYY-MM-DD

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
        if (preloadedUser) {
            // Caso para actualizar el contexto después de editar perfil o si el login ya trae todo
            setUser(preloadedUser);
            setIsAuthenticated(true);

            localStorage.setItem('authToken', preloadedUser.token || '');
            localStorage.setItem('userEmail', preloadedUser.email || '');
            localStorage.setItem('userRol', preloadedUser.rol || '');
            localStorage.setItem('userNombre', preloadedUser.nombre || '');
            localStorage.setItem('userApellido', preloadedUser.apellido || '');
            localStorage.setItem('userCI', String(preloadedUser.ci || ''));
            localStorage.setItem('userTelefono', String(preloadedUser.telefono || ''));
            localStorage.setItem('userFechaNac', preloadedUser.fechaNac || ''); // Guardar como YYYY-MM-DD

            if (preloadedUser.token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${preloadedUser.token}`;
            }
            return true;
        }

        // Flujo normal de login
        try {
            const response = await apiClient.post('/auth/login', credentials);
            // EL BACKEND DEBE DEVOLVER TODOS ESTOS CAMPOS.
            // Asumimos que 'ci', 'telefono' vienen como string o number, y 'fechaNac' como 'YYYY-MM-DD' string.
            const { token, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email || '');
            localStorage.setItem('userRol', rol || '');
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || ''); // fechaNac ya debería ser YYYY-MM-DD

            setUser({ token, email, rol, nombre, apellido, ci, telefono, fechaNac });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            if (rol === 'admin') {
                navigate('/menu');
            } else {
                navigate('/'); // O a la ruta home del cliente si tienes una diferente
            }
            return true;

        } catch (error) {
            console.error("Error en el login:", error.response?.data || error.message);
            setIsAuthenticated(false);
            setUser(null);
            // Limpiar todos los items al fallar el login
            ['authToken', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = typeof error.response?.data === 'string'
                ? error.response.data
                : (error.response?.data?.message || "Login fallido. Verifique sus credenciales.");
            alert(errorMessage);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        // backendResponseData es UserProfileDTO del backend
        const currentUserToken = user ? user.token : localStorage.getItem('authToken');

        if (!currentUserToken) {
            console.error("AuthContext: No hay token para actualizar el contexto del usuario.");
            logout();
            return;
        }

        // El backendResponseData (UserProfileDTO) ya debería tener los campos formateados
        // (ej. rol sin "ROLE_", fechaNac como "YYYY-MM-DD")
        const updatedUserDataForContext = {
            token: currentUserToken,
            email: backendResponseData.email,
            rol: backendResponseData.rol,
            nombre: backendResponseData.nombre,
            apellido: backendResponseData.apellido,
            ci: backendResponseData.ci,         // String del DTO
            telefono: backendResponseData.telefono, // String del DTO
            fechaNac: backendResponseData.fechaNac // String YYYY-MM-DD del DTO
        };
        login(null, updatedUserDataForContext);
    };

    const logout = () => {
        ['authToken', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
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