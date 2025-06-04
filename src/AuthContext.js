// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api'; // Asegúrate que getCurrentUserProfile esté exportado

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true); // Asegurar que loading esté true al inicio
            console.log("AuthContext (initializeAuth): Verificando token...");
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                console.log("AuthContext (initializeAuth): Token encontrado. Configurando header.");
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    console.log("AuthContext (initializeAuth): Obteniendo perfil de usuario...");
                    const response = await getCurrentUserProfile(); // API que devuelve el perfil con ID, rol, etc.
                    const userDataFromApi = response.data;
                    console.log("AuthContext (initializeAuth): Perfil obtenido:", userDataFromApi);

                    // --- CAMBIO CRUCIAL AQUÍ ---
                    if (userDataFromApi && typeof userDataFromApi.id !== 'undefined' && userDataFromApi.id !== null) {
                        const rolLowerCase = userDataFromApi.rol?.toLowerCase() || '';
                        setUser({
                            token: storedToken,
                            id: userDataFromApi.id, // <--- GUARDAR ID NUMÉRICO
                            email: userDataFromApi.email,
                            rol: rolLowerCase,
                            nombre: userDataFromApi.nombre,
                            apellido: userDataFromApi.apellido,
                            ci: userDataFromApi.ci,
                            telefono: userDataFromApi.telefono,
                            fechaNac: userDataFromApi.fechaNac
                        });
                        setIsAuthenticated(true);
                        // Guardar datos esenciales en localStorage para persistencia
                        localStorage.setItem('userId', String(userDataFromApi.id));
                        localStorage.setItem('userRol', rolLowerCase);
                        localStorage.setItem('userEmail', userDataFromApi.email || '');
                        // Guardar otros si es necesario, pero el perfil se carga al inicio
                        console.log("AuthContext (initializeAuth): Usuario autenticado desde token y perfil.");
                    } else {
                        console.warn("AuthContext (initializeAuth): Perfil de API incompleto o ID faltante. Deslogueando.");
                        // Limpiar si el perfil no es válido
                        ['authToken', 'userId', 'userEmail', 'userRol'].forEach(item => localStorage.removeItem(item)); // Simplificado
                        setUser(null);
                        setIsAuthenticated(false);
                        delete apiClient.defaults.headers.common['Authorization'];
                    }
                } catch (e) {
                    console.error("AuthContext (initializeAuth): Token inválido o error al obtener perfil. Deslogueando.", e.message);
                    ['authToken', 'userId', 'userEmail', 'userRol'].forEach(item => localStorage.removeItem(item)); // Simplificado
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
    }, []); // Se ejecuta solo una vez al montar

    const login = async (credentials) => {
        setError("");
        setLoading(true); // Indicar que estamos procesando
        console.log("AuthContext (login): Intentando login para:", credentials.email);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            console.log("AuthContext (login): Respuesta de API:", response.data);

            // --- CAMBIO CRUCIAL AQUÍ: DESESTRUCTURAR 'id' ---
            const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            if (!token) {
                throw new Error("No se recibió token del servidor.");
            }
            if (typeof id === 'undefined' || id === null) { // VERIFICAR EL ID NUMÉRICO
                console.error("AuthContext (login): ID de usuario no recibido o es nulo en la respuesta del login.");
                throw new Error("Información de usuario incompleta recibida del servidor (falta ID).");
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(id)); // <--- GUARDAR ID NUMÉRICO
            localStorage.setItem('userEmail', email || '');
            const rolLowerCase = rol?.toLowerCase() || '';
            localStorage.setItem('userRol', rolLowerCase);
            localStorage.setItem('userNombre', nombre || '');
            localStorage.setItem('userApellido', apellido || '');
            localStorage.setItem('userCI', String(ci || ''));
            localStorage.setItem('userTelefono', String(telefono || ''));
            localStorage.setItem('userFechaNac', fechaNac || '');

            setUser({ token, id, email, rol: rolLowerCase, nombre, apellido, ci, telefono, fechaNac }); // <--- INCLUIR ID
            setIsAuthenticated(true);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log("AuthContext (login): Login exitoso. User establecido:", { token, id, email, rol: rolLowerCase });

            setLoading(false);
            if (rolLowerCase === 'administrador') {
                navigate('/admin/dashboard');
            } else if (rolLowerCase === 'vendedor') {
                navigate('/vendedor/dashboard'); // Asegúrate que esta ruta exista
            } else {
                navigate('/');
            }
            return true;

        } catch (err) {
            console.error("AuthContext (login): Error en el proceso de login:", err.response?.data || err.message, err);
            // Limpieza completa
            ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            setUser(null);
            setIsAuthenticated(false);
            if (apiClient.defaults.headers.common['Authorization']) {
                delete apiClient.defaults.headers.common['Authorization'];
            }
            const errorMessage = err.response?.data?.message || err.message || "Login fallido. Verifique sus credenciales.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        const currentUserToken = user?.token || localStorage.getItem('authToken');
        // --- CAMBIO CRUCIAL AQUÍ: MANEJAR 'id' ---
        const userIdFromResponse = backendResponseData.id; // Asumir que el backend devuelve 'id'

        if (!currentUserToken || typeof userIdFromResponse === 'undefined' || userIdFromResponse === null) {
            console.error("AuthContext (updateUserContext): Token o ID de usuario faltante en datos de respuesta.", backendResponseData);
            // Considera no desloguear aquí, pero sí no actualizar si los datos son inválidos.
            // logout();
            return;
        }

        const rolLowerCase = backendResponseData.rol?.toLowerCase() || user?.rol || '';
        const updatedUserData = {
            token: currentUserToken,
            id: userIdFromResponse, // <--- USAR ID
            email: backendResponseData.email,
            rol: rolLowerCase,
            nombre: backendResponseData.nombre,
            apellido: backendResponseData.apellido,
            ci: backendResponseData.ci,
            telefono: backendResponseData.telefono,
            fechaNac: backendResponseData.fechaNac
        };

        setUser(updatedUserData);
        setIsAuthenticated(true); // Reafirmar
        localStorage.setItem('userId', String(updatedUserData.id)); // <--- GUARDAR ID
        localStorage.setItem('userEmail', updatedUserData.email || '');
        localStorage.setItem('userRol', updatedUserData.rol || '');
        // ... guardar otros ...
        localStorage.setItem('userNombre', updatedUserData.nombre || '');
        localStorage.setItem('userApellido', updatedUserData.apellido || '');
        localStorage.setItem('userCI', String(updatedUserData.ci || ''));
        localStorage.setItem('userTelefono', String(updatedUserData.telefono || ''));
        localStorage.setItem('userFechaNac', updatedUserData.fechaNac || '');
        console.log("AuthContext (updateUserContext): Contexto de usuario actualizado.");
    };

    const logout = () => {
        console.log("AuthContext (logout): Ejecutando logout...");
        // --- CAMBIO CRUCIAL AQUÍ: INCLUIR 'userId' ---
        ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        if (apiClient.defaults.headers.common['Authorization']) {
            delete apiClient.defaults.headers.common['Authorization'];
        }
        setLoading(false); // Asegurar que loading sea false
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
            {/* Si loading es true, podrías mostrar un spinner/mensaje global aquí */}
            {/* Esto es importante para que los componentes hijos no intenten acceder a 'user'
                o 'isAuthenticated' antes de que se hayan inicializado desde localStorage/API. */}
            {!loading ? children : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando aplicación...</div>}
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