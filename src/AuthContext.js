// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate que getCurrentUserProfile esté exportado desde tu apiService.js
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
            console.log("AuthContext: initializeAuth - Iniciando verificación de autenticación...");
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                console.log("AuthContext: initializeAuth - Token encontrado en localStorage.");
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    console.log("AuthContext: initializeAuth - Intentando obtener perfil de usuario...");
                    const response = await getCurrentUserProfile();
                    const userDataFromApi = response.data;
                    console.log("AuthContext: initializeAuth - Perfil obtenido:", userDataFromApi);

                    if (userDataFromApi && typeof userDataFromApi.id !== 'undefined' && userDataFromApi.id !== null) {
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
                            fechaNac: userDataFromApi.fechaNac
                        });
                        setIsAuthenticated(true);
                        localStorage.setItem('userId', String(userDataFromApi.id));
                        localStorage.setItem('userRol', rolLowerCase);
                        // Opcional: actualizar otros datos del localStorage si es necesario
                        console.log("AuthContext: initializeAuth - Usuario autenticado y establecido desde perfil.");
                    } else {
                        console.error("AuthContext: initializeAuth - Datos de perfil incompletos o ID faltante desde la API. UserData:", userDataFromApi);
                        throw new Error("Datos de perfil incompletos o ID faltante.");
                    }
                } catch (e) {
                    console.error("AuthContext: initializeAuth - Token inválido o error al obtener perfil. Deslogueando.", e.message);
                    // Limpiar solo si hay un error real con el token/perfil
                    ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                        .forEach(item => localStorage.removeItem(item));
                    setUser(null);
                    setIsAuthenticated(false);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            } else {
                console.log("AuthContext: initializeAuth - No se encontró token en localStorage.");
            }
            setLoading(false);
            console.log("AuthContext: initializeAuth - Verificación de autenticación completada. Loading:", false);
        };
        initializeAuth();
    }, []);

    const login = async (credentials) => {
        setError("");
        setLoading(true); // Indicar que estamos procesando el login
        console.log("AuthContext: login - Intentando iniciar sesión con credenciales:", credentials.email);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            console.log("AuthContext: login - Respuesta de API recibida:", response.data);

            // DESESTRUCTURAR Y VERIFICAR CUIDADOSAMENTE
            const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            console.log("AuthContext: login - Datos desestructurados:", { token, id, email, rol }); // Loguear el ID aquí

            if (!token) {
                console.error("AuthContext: login - El token no fue devuelto por la API de login.");
                setError("Error de autenticación: No se recibió token.");
                setLoading(false);
                return false;
            }
            if (typeof id === 'undefined' || id === null) {
                console.error("AuthContext: login - El ID del usuario (numérico) no fue devuelto por la API de login o es null.");
                setError("Error de configuración del sistema: No se pudo obtener la identificación completa del usuario.");
                setLoading(false);
                return false;
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(id));
            localStorage.setItem('userEmail', email || '');
            const rolLowerCase = rol?.toLowerCase() || '';
            localStorage.setItem('userRol', rolLowerCase);
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || '');

            setUser({ token, id, email, rol: rolLowerCase, nombre, apellido, ci, telefono, fechaNac });
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log("AuthContext: login - Usuario logueado y contexto actualizado. User:", { token, id, email, rol: rolLowerCase });

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
            console.error("AuthContext: login - Error durante el proceso de login:", err.response?.data || err.message, err);
            // Limpiar todo en caso de error de login
            ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            setUser(null);
            setIsAuthenticated(false);
            delete apiClient.defaults.headers.common['Authorization'];

            const errorMessage = err.response?.data?.message || "Login fallido. Verifique sus credenciales o intente más tarde.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        // ... (esta función parece estar bien, pero asegúrate que backendResponseData.id siempre venga)
        const currentUserToken = user?.token || localStorage.getItem('authToken');
        const userIdFromResponse = backendResponseData.id;

        if (!currentUserToken || typeof userIdFromResponse === 'undefined' || userIdFromResponse === null) {
            console.error("AuthContext: updateUserContext - No hay token o ID para actualizar. UserData:", backendResponseData);
            return; // Considera si deberías desloguear o solo no actualizar
        }
        const rolLowerCase = backendResponseData.rol?.toLowerCase() || user?.rol || '';
        const updatedUserData = {
            token: currentUserToken,
            id: userIdFromResponse,
            email: backendResponseData.email,
            rol: rolLowerCase,
            nombre: backendResponseData.nombre,
            apellido: backendResponseData.apellido,
            ci: backendResponseData.ci,
            telefono: backendResponseData.telefono,
            fechaNac: backendResponseData.fechaNac
        };
        setUser(updatedUserData);
        setIsAuthenticated(true);
        localStorage.setItem('userId', String(updatedUserData.id));
        localStorage.setItem('userEmail', updatedUserData.email || '');
        localStorage.setItem('userRol', updatedUserData.rol || '');
        // ... guardar otros ...
    };

    const logout = () => {
        console.log("AuthContext: logout - Ejecutando logout...");
        ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        delete apiClient.defaults.headers.common['Authorization'];
        setLoading(false);
        navigate('/login');
        console.log("AuthContext: logout - Logout completado.");
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
            setError // Exponer setError puede ser útil para que los componentes lo limpien
        }}>
            {/* Si loading es true, podrías mostrar un spinner global aquí,
                o dejar que los componentes individuales manejen el estado de carga del AuthContext.
                Por simplicidad, renderizar children directamente es común, y los componentes usan `authLoading`.
            */}
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