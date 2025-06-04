// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Para la carga inicial del contexto
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            console.log("AuthContext (useEffect): Verificando token inicial...");
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                console.log("AuthContext (useEffect): Token encontrado. Configurando header y obteniendo perfil.");
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const profileResponse = await getCurrentUserProfile();
                    const userData = profileResponse.data;
                    console.log("AuthContext (useEffect): Perfil obtenido:", userData);

                    // SIMPLIFICADO: Solo necesitamos email y rol por ahora para autenticar desde token
                    if (userData && userData.email && userData.rol) {
                        setUser({ // Establecer usuario MÍNIMO para que isAuthenticated funcione
                            token: storedToken,
                            id: userData.id || null, // Intenta obtener ID, si no, null
                            email: userData.email,
                            rol: userData.rol.toLowerCase(),
                            nombre: userData.nombre || '',
                            // ...otros campos que puedas tener de forma fiable...
                        });
                        setIsAuthenticated(true);
                        console.log("AuthContext (useEffect): Usuario autenticado desde token y perfil.");
                    } else {
                        console.warn("AuthContext (useEffect): Perfil no contiene email o rol. Deslogueando.");
                        localStorage.removeItem('authToken'); // Token inválido o perfil incompleto
                        delete apiClient.defaults.headers.common['Authorization'];
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (e) {
                    console.error("AuthContext (useEffect): Error al obtener perfil con token guardado. Deslogueando.", e.message);
                    localStorage.removeItem('authToken');
                    delete apiClient.defaults.headers.common['Authorization'];
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                console.log("AuthContext (useEffect): No hay token guardado.");
            }
            setLoading(false);
            console.log("AuthContext (useEffect): Carga inicial completada. isAuthenticated:", isAuthenticated, "user:", user);
        };

        initializeAuth();
    }, []); // SIN DEPENDENCIAS para que se ejecute solo una vez

    const login = async (credentials) => {
        setError("");
        setLoading(true);
        console.log("AuthContext (login): Intentando login con email:", credentials.email);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            console.log("AuthContext (login): Respuesta de API recibida:", response);

            if (response && response.data && response.data.token) {
                const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;
                console.log("AuthContext (login): Datos de la respuesta:", { token, id, email, rol, nombre });

                localStorage.setItem('authToken', token);
                // Guardar datos mínimos esenciales en localStorage
                localStorage.setItem('userId', id ? String(id) : ''); // Guardar ID si existe
                localStorage.setItem('userEmail', email || '');
                const rolLowerCase = rol?.toLowerCase() || '';
                localStorage.setItem('userRol', rolLowerCase);


                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Establecer el usuario en el estado
                setUser({
                    token,
                    id: id || null, // Si id no viene, será null
                    email,
                    rol: rolLowerCase,
                    nombre,
                    apellido,
                    ci,
                    telefono,
                    fechaNac
                });
                setIsAuthenticated(true);
                setError(""); // Limpiar cualquier error previo
                setLoading(false);

                console.log("AuthContext (login): Login exitoso. isAuthenticated: true, user:", { token, id, email, rol: rolLowerCase });

                // Redirección
                if (rolLowerCase === 'administrador') {
                    navigate('/admin/dashboard');
                } else if (rolLowerCase === 'vendedor') {
                    navigate('/vendedor/dashboard');
                } else {
                    navigate('/');
                }
                return true;
            } else {
                console.error("AuthContext (login): Respuesta de API inválida o token faltante.", response);
                throw new Error("Respuesta de login inválida del servidor.");
            }

        } catch (err) {
            console.error("AuthContext (login): Catch - Error durante el proceso de login:", err.response?.data || err.message, err);

            // Limpieza completa en caso de error
            ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
                .forEach(item => localStorage.removeItem(item));
            setUser(null);
            setIsAuthenticated(false);
            if (apiClient.defaults.headers.common['Authorization']) {
                delete apiClient.defaults.headers.common['Authorization'];
            }

            const errorMessage = err.response?.data?.message || err.message || "Login fallido.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
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

    // updateUserContext se mantiene igual, pero asegúrate de que maneje el 'id' si es necesario
    const updateUserContext = (backendResponseData) => {
        console.log("AuthContext (updateUserContext): Actualizando contexto con:", backendResponseData);
        const currentUserToken = user?.token || localStorage.getItem('authToken');
        const currentUserId = backendResponseData.id || user?.id || parseInt(localStorage.getItem('userId'), 10); // Priorizar ID de respuesta

        if (!currentUserToken) {
            console.error("AuthContext (updateUserContext): No hay token para actualizar.");
            logout(); // Si no hay token, es un estado inválido, mejor desloguear.
            return;
        }

        const rolLowerCase = backendResponseData.rol?.toLowerCase() || user?.rol || '';
        const updatedUserData = {
            token: currentUserToken,
            id: currentUserId || null, // Asegurar que id es null si no está definido
            email: backendResponseData.email,
            rol: rolLowerCase,
            nombre: backendResponseData.nombre,
            apellido: backendResponseData.apellido,
            ci: backendResponseData.ci,
            telefono: backendResponseData.telefono,
            fechaNac: backendResponseData.fechaNac
        };

        setUser(updatedUserData);
        setIsAuthenticated(true); // Reafirmar autenticación

        // Actualizar localStorage
        if (updatedUserData.id) localStorage.setItem('userId', String(updatedUserData.id)); else localStorage.removeItem('userId');
        localStorage.setItem('userEmail', updatedUserData.email || '');
        localStorage.setItem('userRol', updatedUserData.rol || '');
        // ... guardar otros campos si se actualizan consistentemente en el perfil
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
            {/* Renderizar children solo cuando la carga inicial del AuthContext ha terminado
                Esto es importante para que los componentes no intenten acceder a 'user'
                o 'isAuthenticated' antes de que se hayan inicializado.
            */}
            {!loading ? children : <div style={{textAlign: 'center', padding: '50px'}}>Cargando sesión...</div>}
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