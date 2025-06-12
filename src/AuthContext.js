// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api';

const AuthContext = createContext(null);

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
                    const userDataFromApi = response.data;

                    if (userDataFromApi?.id) {
                        // El usuario es válido, establecemos el estado.
                        const rolLowerCase = userDataFromApi.rol?.toLowerCase() || '';
                        setUser({
                            token: storedToken,
                            id: userDataFromApi.id,
                            email: userDataFromApi.email,
                            rol: rolLowerCase,
                            nombre: userDataFromApi.nombre,
                            apellido: userDataFromApi.apellido,
                            ci: userDataFromApi.ci,
                            telefono: userDataFromApi.telefono,
                            fechaNac: userDataFromApi.fechaNac,
                            tipoCliente: userDataFromApi.tipoCliente
                        });
                        setIsAuthenticated(true);
                    } else {
                        // El token era válido pero el perfil no se encontró. Limpiamos.
                        localStorage.removeItem('authToken');
                        delete apiClient.defaults.headers.common['Authorization'];
                    }
                } catch (e) {
                    // El token es inválido o ha expirado. Limpiamos el token viejo.
                    localStorage.removeItem('authToken');
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            // Esta es la línea más importante. Se ejecuta SIEMPRE al final de la lógica.
            setLoading(false);
        };

        initializeAuth();
    }, []); // El array de dependencias vacío [] asegura que se ejecute solo una vez al montar.

    const login = async (credentials) => {
        setError("");
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac, tipoCliente } = response.data;

            if (!token || typeof id === 'undefined' || id === null) {
                throw new Error("Información de usuario incompleta recibida del servidor.");
            }

            const rolLowerCase = rol?.toLowerCase() || '';

            // Guardar el token en localStorage es la acción más crucial aquí.
            localStorage.setItem('authToken', token);
            
            // Establecer el estado del usuario.
            setUser({ token, id, email, rol: rolLowerCase, nombre, apellido, ci, telefono, fechaNac, tipoCliente });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setLoading(false);
            if (rolLowerCase === 'administrador') {
                navigate('/admin/dashboard');
            } else if (rolLowerCase === 'vendedor') {
                navigate('/vendedor/dashboard');
            } else {
                navigate('/');
            }
            return true;

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Login fallido.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        const currentUserToken = user?.token || localStorage.getItem('authToken');

        if (!currentUserToken || typeof backendResponseData.id === 'undefined') {
            return;
        }

        const rolLowerCase = backendResponseData.rol?.toLowerCase() || user?.rol || '';
        const updatedUserData = {
            token: currentUserToken,
            id: backendResponseData.id,
            email: backendResponseData.email,
            rol: rolLowerCase,
            nombre: backendResponseData.nombre,
            apellido: backendResponseData.apellido,
            ci: backendResponseData.ci,
            telefono: backendResponseData.telefono,
            fechaNac: backendResponseData.fechaNac,
            tipoCliente: backendResponseData.tipoCliente
        };

        setUser(updatedUserData);
        setIsAuthenticated(true);
        // Opcional: podrías actualizar los datos en localStorage también si los usas en otro lugar.
        // localStorage.setItem('userNombre', updatedUserData.nombre || '');
    };

    const logout = () => {
        // Limpiamos todo lo relacionado con el usuario de localStorage.
        ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac', 'userTipoCliente']
            .forEach(item => localStorage.removeItem(item));
        
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        delete apiClient.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    // La solución clave: "pausar" el renderizado de la aplicación
    // mientras se verifica la sesión del usuario.
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5em',
                fontFamily: 'sans-serif',
                color: '#333'
            }}>
                <h2>Cargando sesión...</h2>
            </div>
        );
    }

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
