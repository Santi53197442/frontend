// src/services/api.js
import axios from 'axios';

// Define la URL raíz de tu backend.
// Si REACT_APP_API_ROOT_URL está definido en tu .env, lo usará, sino el valor por defecto.
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://web-production-2443c.up.railway.app";

// BASE_URL para las llamadas de Axios ahora incluye el prefijo /api
const BASE_URL = `${API_ROOT_URL}/api`;
// Ejemplo: "https://web-production-2443c.up.railway.app/api"

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para añadir el token de autenticación a las solicitudes
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Asegúrate que 'authToken' es la clave correcta
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado. El token puede ser inválido o haber expirado.");
            // Considera desloguear al usuario o redirigirlo
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userData');
            // if (window.location.pathname !== '/login') { // Evitar bucle si ya está en login
            //     window.location.href = '/login';
            // }
        }
        return Promise.reject(error);
    }
);

// Función para el registro de usuarios
export const registerUser = async (userData) => {
    return apiClient.post('/auth/register', userData);
};

// Función para el login de usuarios
export const loginUser = async (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

// (Opcional) Ejemplo para obtener datos protegidos
export const getSomeProtectedData = async () => {
    return apiClient.get('/ruta-protegida');
};

// --- NUEVA FUNCIÓN PARA VENDEDOR ---
/**
 * Crea una nueva localidad.
 * @param {object} localidadData - Datos de la localidad ({ nombre, departamento, direccion }).
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API.
 */
export const crearLocalidad = async (localidadData) => {
    // Llama a: https://web-production-2443c.up.railway.app/api/vendedor/localidades
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response; // Devuelve la respuesta completa para que el componente pueda acceder a response.data
    } catch (error) {
        console.error("Error al crear localidad desde api.js:", error.response || error);
        throw error; // Re-lanzar para que el componente lo maneje
    }
};


// Exporta la instancia de apiClient para usarla directamente si se prefiere
export default apiClient;