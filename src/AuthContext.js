// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { getCurrentUserProfile } from './services/api'; // Asumo que getCurrentUserProfile está en api.js también

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Para la carga inicial del contexto
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    // Intenta obtener el perfil del usuario para validar el token y obtener datos frescos, incluyendo el ID
                    console.log("AuthContext: Token encontrado, obteniendo perfil de usuario...");
                    const response = await getCurrentUserProfile(); // Esta API DEBE devolver el ID y rol
                    const userDataFromApi = response.data;

                    if (userDataFromApi && userDataFromApi.id) { // Asegurarse que el perfil tiene ID
                        setUser({ // Guardar todos los datos relevantes, incluyendo el ID
                            token: storedToken,
                            id: userDataFromApi.id, // ID NUMÉRICO DEL USUARIO
                            email: userDataFromApi.email,
                            rol: userDataFromApi.rol?.toLowerCase(), // Guardar en minúsculas
                            nombre: userDataFromApi.nombre,
                            apellido: userDataFromApi.apellido,
                            ci: userDataFromApi.ci,
                            telefono: userDataFromApi.telefono,
                            fechaNac: userDataFromApi.fechaNac
                        });
                        setIsAuthenticated(true);
                        // Guardar también en localStorage para persistencia (opcional para todo, pero útil para id/rol)
                        localStorage.setItem('userId', String(userDataFromApi.id));
                        localStorage.setItem('userRol', userDataFromApi.rol?.toLowerCase() || '');
                        // Puedes guardar otros datos si quieres, pero el perfil se carga al inicio
                    } else {
                        throw new Error("Datos de perfil incompletos o ID faltante desde la API.");
                    }
                } catch (e) {
                    console.error("AuthContext: Token inválido o error al obtener perfil", e);
                    logout(); // Limpiar si el token es inválido o el perfil no se puede cargar
                    return; // Salir para no establecer loading a false prematuramente si hay error
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []); // Ejecutar solo una vez al montar

    const login = async (credentials) => {
        setError("");
        setLoading(true);
        try {
            const response = await apiClient.post('/auth/login', credentials);
            // ASUMIMOS QUE response.data AHORA INCLUYE 'id'
            const { token, id, email, rol, nombre, apellido, ci, telefono, fechaNac } = response.data;

            if (!id) { // Verificación crucial
                console.error("AuthContext: El ID del usuario (numérico) no fue devuelto por la API de login.");
                setError("Error de configuración del sistema: No se pudo obtener la identificación del usuario.");
                setLoading(false);
                return false;
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', String(id)); // Guardar ID numérico
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

            if (rolLowerCase === 'administrador') {
                navigate('/admin/dashboard');
            } else if (rolLowerCase === 'vendedor') {
                navigate('/vendedor/dashboard'); // Cambiado de /vendedor/panel si no existe
            } else {
                navigate('/');
            }
            setLoading(false);
            return true;

        } catch (err) {
            console.error("Error en el login (AuthContext):", err.response?.data || err.message);
            logout(); // Llama a logout para limpiar todo
            const errorMessage = err.response?.data?.message || "Login fallido. Verifique sus credenciales.";
            setError(errorMessage);
            setLoading(false);
            return false;
        }
    };

    const updateUserContext = (backendResponseData) => {
        const currentUserToken = user?.token || localStorage.getItem('authToken');
        // backendResponseData debe incluir el ID
        const userIdFromResponse = backendResponseData.id;

        if (!currentUserToken || typeof userIdFromResponse === 'undefined' || userIdFromResponse === null) {
            console.error("AuthContext: No hay token o ID para actualizar el contexto del usuario.");
            // No necesariamente desloguear si solo es una actualización de perfil que falló,
            // pero si el ID es esencial y falta, podría ser un problema.
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
        setIsAuthenticated(true); // Reafirmar
        localStorage.setItem('userId', String(updatedUserData.id));
        localStorage.setItem('userEmail', updatedUserData.email || '');
        localStorage.setItem('userRol', updatedUserData.rol || '');
        // ... (guardar otros campos actualizados en localStorage si es necesario)
    };

    const logout = () => {
        console.log("AuthContext: Ejecutando logout...");
        ['authToken', 'userId', 'userEmail', 'userRol', 'userNombre', 'userApellido', 'userCI', 'userTelefono', 'userFechaNac']
            .forEach(item => localStorage.removeItem(item));
        setUser(null);
        setIsAuthenticated(false);
        setError("");
        delete apiClient.defaults.headers.common['Authorization'];
        setLoading(false); // Asegurar que loading sea false después de logout
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            loading, // Este es el loading del AuthContext
            updateUserContext,
            error,
            setError
        }}>
            {/* Renderizar children solo cuando la carga inicial del AuthContext ha terminado */}
            {!loading ? children : <div>Cargando aplicación...</div>}
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