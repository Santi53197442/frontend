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
            console.log("AuthContext (initializeAuth): Verificando token...");
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                console.log("AuthContext (initializeAuth): Token encontrado. Configurando header.");
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    console.log("AuthContext (initializeAuth): Obteniendo perfil de usuario...");
                    const response = await getCurrentUserProfile();
                    const userDataFromApi = response.data;
                    console.log("AuthContext (initializeAuth): Perfil obtenido de API:", userDataFromApi);

                    // === CAMBIO CLAVE AQUÍ: Condición más robusta y simple ===
                    // Usamos "optional chaining" (?.) para evitar errores y solo comprobamos si 'id' existe.
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
                            fechaNac: userDataFromApi.fechaNac
                        });
                        setIsAuthenticated(true);
                        localStorage.setItem('userId', String(userDataFromApi.id));
                        localStorage.setItem('userRol', rolLowerCase);
                        localStorage.setItem('userEmail', userDataFromApi.email || '');
                        console.log("AuthContext (initializeAuth): Usuario autenticado y contexto establecido desde perfil.");
                    } else {
                        // Este bloque ahora solo se ejecutará si la API no devuelve un objeto con la propiedad 'id' válida.
                        console.warn("AuthContext (initializeAuth): El perfil recibido de la API no contiene una propiedad 'id' válida. Deslogueando. Perfil recibido:", userDataFromApi);
                        ['authToken', 'userId', 'userEmail', 'userRol'].forEach(item => localStorage.removeItem(item));
                        setUser(null);
                        setIsAuthenticated(false);
                        delete apiClient.defaults.headers.common['Authorization'];
                    }
                } catch (e) {
                    console.error("AuthContext (initializeAuth): Token inválido o error al obtener perfil. Deslogueando.", e.message);
                    ['authToken', 'userId', 'userEmail', 'userRol'].forEach(item => localStorage.removeItem(item));
                    setUser(null);
                    setIsAuthenticated(false);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            } else {
                console.log("AuthContext (initializeAuth): No hay token en localStorage.");
            }
            setLoading(false);
            console.log("AuthContext (initializeAuth): Carga inicial completada.");
        };

        initializeAuth();
    }, []); // Ejecutar solo una vez

    const login = async (credentials) => {
        setError("");
        setLoading(true);
        console.log("AuthContext (login): Intentando login para:", credentials.email);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            console.log("AuthContext (login): Respuesta COMPLETA de API /auth/login:", JSON.stringify(response.data, null, 2));

            const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            if (!token) {
                console.error("AuthContext (login): No se recibió token del servidor.");
                throw new Error("No se recibió token del servidor.");
            }
            if (typeof id === 'undefined' || id === null) {
                console.error("AuthContext (login): ID de usuario no recibido o es nulo en la respuesta del login.");
                throw new Error("Información de usuario incompleta recibida del servidor (falta ID).");
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
            console.log("AuthContext (login): Login exitoso. User establecido con ID:", id);

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
            console.error("AuthContext (login): Error en el proceso de login:", err.response?.data || err.message, err);
            ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            setUser(null);
            setIsAuthenticated(false);
            if (apiClient.defaults.headers.common['Authorization']) {
                delete apiClient.defaults.headers.common['Authorization'];
            }
            const errorMessage = err.response?.data?.message || err.message || "Login fallido. Verifique credenciales o intente más tarde.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        console.log("AuthContext (updateUserContext): Actualizando contexto con:", backendResponseData);
        const currentUserToken = user?.token || localStorage.getItem('authToken');
        const userIdFromResponse = backendResponseData.id;

        if (!currentUserToken || typeof userIdFromResponse === 'undefined' || userIdFromResponse === null) {
            console.error("AuthContext (updateUserContext): Token o ID de usuario faltante en datos de respuesta para actualizar.", backendResponseData);
            return;
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
    };

    const logout = () => {
        console.log("AuthContext (logout): Ejecutando logout...");
        ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        if (apiClient.defaults.headers.common['Authorization']) {
            delete apiClient.defaults.headers.common['Authorization'];
        }
        setLoading(false);
        navigate('/login');
        console.log("AuthContext (logout): Logout completado.");
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
            {/* ESTA ES LA LÍNEA A CORREGIR */}
            {!loading ? children : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando aplicación...</div>}
        </AuthContext.Provider>
    );
};

// Y asegúrate que el resto del archivo también esté completo
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};