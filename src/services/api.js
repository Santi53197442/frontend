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
    // No se establece 'Content-Type' por defecto aquí.
    // Axios lo manejará automáticamente:
    // - 'application/json' para objetos JS normales.
    // - 'multipart/form-data' con boundary para instancias de FormData.
});

// Interceptor para añadir el token de autenticación a las solicitudes
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Asegúrate que 'authToken' es la clave correcta donde guardas el token.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas, por ejemplo, errores 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado. El token puede ser inválido o haber expirado.");
            // Opcional: Aquí puedes añadir lógica para desloguear al usuario globalmente.
            // Ejemplo:
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userData'); // O cualquier otra información de sesión
            // window.location.href = '/login'; // Redirigir a la página de login
        }
        return Promise.reject(error);
    }
);

// --- Funciones de ejemplo para interactuar con la API ---
// Estas funciones ahora usan rutas relativas a BASE_URL (que ya incluye /api)

// Función para el registro de usuarios
export const registerUser = async (userData) => {
    // Llama a: https://web-production-2443c.up.railway.app/api/auth/register
    return apiClient.post('/auth/register', userData);
};

// Función para el login de usuarios
export const loginUser = async (credentials) => {
    // Llama a: https://web-production-2443c.up.railway.app/api/auth/login
    return apiClient.post('/auth/login', credentials);
};

// (Opcional) Ejemplo para obtener datos protegidos
export const getSomeProtectedData = async () => {
    // Llama a: https://web-production-2443c.up.railway.app/api/ruta-protegida
    return apiClient.get('/ruta-protegida');
};

// Exporta la instancia de apiClient para usarla directamente si se prefiere
export default apiClient;