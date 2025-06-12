// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api';

const AuthContext = createContext(null);

// Componente simple para mostrar mientras se verifica la sesión.
// Puedes reemplazarlo por un spinner o un diseño más elaborado.
const AuthLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Verificando sesión...</p>
    </div>
);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Inicializamos 'loading' en 'true' para que la app espere la verificación inicial.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            // No es necesario setLoading(true) aquí porque el estado inicial ya es true.
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const response = await getCurrentUserProfile();
                    const userDataFromApi = response.data;

                    if (userDataFromApi?.id) {
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

                        // Esta parte ya la tenías bien, es para asegurar la persistencia
                        // de los datos básicos en localStorage por si se necesitan en otro lugar.
                        localStorage.setItem('userId', String(userDataFromApi.id));
                        localStorage.setItem('userRol', rolLowerCase);
                        localStorage.setItem('userEmail', userDataFromApi.email || '');
                        if (userDataFromApi.tipoCliente) {
                            localStorage.setItem('userTipoCliente', userDataFromApi.tipoCliente);
                        }

                    } else {
                        // El token es válido pero no devuelve un perfil de usuario. Limpiar todo.
                        ['authToken', 'userId', 'userEmail', 'userRol', 'userTipoCliente'].forEach(item => localStorage.removeItem(item));
                        setUser(null);
                        setIsAuthenticated(false);
                        delete apiClient.defaults.headers.common['Authorization'];
                    }
                } catch (e) {
                    // El token ha expirado o no es válido. Limpiar todo.
                    console.error("Error al inicializar la autenticación:", e);
                    ['authToken', 'userId', 'userEmail', 'userRol', 'userTipoCliente'].forEach(item => localStorage.removeItem(item));
                    setUser(null);
                    setIsAuthenticated(false);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            // Cuando la verificación termina (haya token o no), dejamos de cargar.
            setLoading(false);
        };

        initializeAuth();
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez, al montar el componente.

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

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(id));
            localStorage.setItem('userEmail', email || '');
            localStorage.setItem('userRol', rolLowerCase);
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || '');
            if (tipoCliente) {
                localStorage.setItem('userTipoCliente', tipoCliente);
            }

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
        if (!currentUserToken || typeof backendResponseData.id === 'undefined') return;

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
            {/*
              <<< LA SOLUCIÓN CLAVE ESTÁ AQUÍ >>>
              Mientras el estado 'loading' sea 'true', mostramos el componente AuthLoader.
              Esto "congela" la renderización del resto de la aplicación (los children)
              hasta que hayamos terminado de verificar si el usuario tiene una sesión válida.
              Una vez 'loading' es 'false', se renderizan los 'children' con el estado de
              autenticación ya definido (sea true o false).
            */}
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