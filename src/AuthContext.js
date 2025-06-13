// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api';

const AuthContext = createContext(null);

// Componente de carga para una mejor experiencia de usuario.
// Se muestra mientras se verifica la sesión inicial.
const AuthLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>Verificando sesión, por favor espera...</p>
        {/* Aquí podrías poner un spinner o una animación si lo deseas */}
    </div>
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Siempre empieza en true para la verificación inicial
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Este useEffect es la clave para la persistencia de la sesión.
    // Se ejecuta UNA SOLA VEZ cuando la aplicación carga por primera vez.
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('authToken');

            if (storedToken) {
                // 1. Asumimos que el token es válido y lo configuramos en Axios para futuras peticiones.
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    // 2. Verificamos el token contra la API para obtener datos frescos y confirmar su validez.
                    const response = await getCurrentUserProfile();
                    const userData = response.data;

                    if (userData && userData.id) {
                        // 3. Si la API confirma que el usuario es válido, actualizamos el estado de la aplicación.
                        const rolLowerCase = userData.rol?.toLowerCase() || '';
                        const fullUserData = {
                            token: storedToken,
                            id: userData.id,
                            email: userData.email,
                            rol: rolLowerCase,
                            nombre: userData.nombre,
                            apellido: userData.apellido,
                            ci: userData.ci,
                            telefono: userData.telefono,
                            fechaNac: userData.fechaNac,
                            tipoCliente: userData.tipoCliente
                        };
                        setUser(fullUserData);
                        setIsAuthenticated(true);

                        // Opcional pero recomendado: Mantener datos básicos en localStorage.
                        localStorage.setItem('userId', String(userData.id));
                        localStorage.setItem('userRol', rolLowerCase);
                    } else {
                        // El token puede ser sintácticamente válido pero no corresponde a un usuario.
                        throw new Error("El token no corresponde a un perfil de usuario válido.");
                    }
                } catch (e) {
                    // 4. Si la API falla (ej: token expirado/inválido), limpiamos todo para cerrar la sesión.
                    console.error("Fallo al verificar el token durante la inicialización, cerrando sesión:", e);
                    ['authToken', 'userId', 'userRol', 'userEmail', 'userTipoCliente'].forEach(item => localStorage.removeItem(item));
                    setUser(null);
                    setIsAuthenticated(false);
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            // 5. La verificación ha terminado (haya token o no), dejamos de mostrar el loader.
            setLoading(false);
        };

        initializeAuth();
    }, []); // El array de dependencias vacío [] asegura que este efecto se ejecute solo al montar.

    const login = async (credentials) => {
        setLoading(true);
        setError("");
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, ...userData } = response.data;

            if (!token || typeof userData.id === 'undefined') {
                throw new Error("La respuesta del login es incompleta. No se recibió token o ID de usuario.");
            }

            const rolLowerCase = userData.rol?.toLowerCase() || '';

            // 1. Guardar en localStorage PRIMERO para persistencia.
            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(userData.id));
            localStorage.setItem('userEmail', userData.email || '');
            localStorage.setItem('userRol', rolLowerCase);
            // ... guardar otros datos si es necesario ...

            // 2. Actualizar headers de Axios para las siguientes peticiones en esta sesión.
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // 3. Actualizar el estado de React para que la UI reaccione.
            setUser({ token, ...userData, rol: rolLowerCase });
            setIsAuthenticated(true);

            setLoading(false);

            // 4. Redireccionar al usuario según su rol.
            if (rolLowerCase === 'administrador') {
                navigate('/admin/dashboard');
            } else if (rolLowerCase === 'vendedor') {
                navigate('/vendedor/dashboard');
            } else {
                navigate('/');
            }

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error en el login. Por favor, verifica tus credenciales.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
    };

    // Función para actualizar los datos del usuario en el contexto sin necesidad de un nuevo login.
    // Útil después de que el usuario edita su perfil, por ejemplo.
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

        // Actualizar también localStorage para consistencia
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
        // Limpiar todo: estado de React, localStorage y headers de Axios.
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        delete apiClient.defaults.headers.common['Authorization'];

        // Limpia todos los items relacionados al usuario de una vez para asegurar que no quede basura.
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('user') || key === 'authToken') {
                localStorage.removeItem(key);
            }
        });

        navigate('/login');
    };

    // El valor que se provee al resto de la aplicación.
    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        updateUserContext,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {/* ESTA LÍNEA ES CRUCIAL: Muestra el loader hasta que la verificación inicial termina. */}
            {loading ? <AuthLoader /> : children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para consumir el contexto de autenticación fácilmente.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};