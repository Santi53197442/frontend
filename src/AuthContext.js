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
            setLoading(true);
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const response = await getCurrentUserProfile();
                    const userDataFromApi = response.data;

                    if (userDataFromApi?.id) {
                        const rolLowerCase = userDataFromApi.rol?.toLowerCase() || '';

                        // <<< CAMBIO 1: Guardamos el tipoCliente al inicializar desde el perfil
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
                            tipoCliente: userDataFromApi.tipoCliente // Guardamos el tipo de cliente
                        });

                        setIsAuthenticated(true);
                        // Guardar en localStorage para persistencia
                        localStorage.setItem('userId', String(userDataFromApi.id));
                        localStorage.setItem('userRol', rolLowerCase);
                        localStorage.setItem('userEmail', userDataFromApi.email || '');
                        if (userDataFromApi.tipoCliente) {
                            localStorage.setItem('userTipoCliente', userDataFromApi.tipoCliente);
                        }

                    } else {
                        // Limpiar si el perfil no es válido
                        ['authToken', 'userId', 'userEmail', 'userRol', 'userTipoCliente'].forEach(item => localStorage.removeItem(item));
                        setUser(null);
                        setIsAuthenticated(false);
                        delete apiClient.defaults.headers.common['Authorization'];
                    }
                } catch (e) {
                    // Limpiar si hay error
                    ['authToken', 'userId', 'userEmail', 'userRol', 'userTipoCliente'].forEach(item => localStorage.removeItem(item));
                    setUser(null);
                    setIsAuthenticated(false);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        setError("");
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/login', credentials);

            // <<< CAMBIO 2: Extraemos tipoCliente de la respuesta del login
            const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac, tipoCliente } = response.data;

            if (!token || typeof id === 'undefined' || id === null) {
                throw new Error("Información de usuario incompleta recibida del servidor.");
            }

            const rolLowerCase = rol?.toLowerCase() || '';

            // Guardar todo en localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(id));
            localStorage.setItem('userEmail', email || '');
            localStorage.setItem('userRol', rolLowerCase);
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || '');
            if (tipoCliente) { // Solo guardar si existe
                localStorage.setItem('userTipoCliente', tipoCliente);
            }

            // Establecer el estado del usuario, incluyendo tipoCliente
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

        // <<< CAMBIO 3: Nos aseguramos de actualizar también el tipoCliente si viene en los datos
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
            tipoCliente: backendResponseData.tipoCliente // Actualizar el tipo de cliente
        };

        setUser(updatedUserData);
        setIsAuthenticated(true);
        // Actualizar localStorage también
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
        // <<< CAMBIO 4: Limpiamos también userTipoCliente del localStorage
        ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac', 'userTipoCliente']
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
            {/* Si no está cargando, muestra los hijos (la app), sino, muestra un mensaje de carga. */}
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
