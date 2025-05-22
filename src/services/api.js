// src/services/api.js
import axios from 'axios';

// OPCIÓN A: Usar variable de entorno (recomendado para flexibilidad)
// Asegúrate de tener REACT_APP_API_URL en tu archivo .env y en la configuración de Vercel
const BASE_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app"; // Fallback por si la variable no está

// OPCIÓN B: Hardcodear la URL (más simple si no cambia)
// const BASE_URL = "https://web-production-2443c.up.railway.app";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de Solicitud: Añade el token JWT a las cabeceras de las solicitudes autenticadas
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Solo añade la cabecera si no está ya presente (por si se setea manualmente en algún caso)
            if (!config.headers.Authorization) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuesta: Puede manejar errores globales como 401 (opcional)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado. El token puede ser inválido o haber expirado.");
            // Aquí podrías disparar un logout global si lo deseas,
            // pero el AuthContext actualmente maneja el error en la llamada.
            // Ejemplo de logout forzado:
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userEmail');
            // localStorage.removeItem('userRol');
            // delete apiClient.defaults.headers.common['Authorization'];
            // window.location.href = '/login'; // Redirección forzada
        }
        return Promise.reject(error);
    }
);

// Funciones específicas de API
export const registerUser = async (userData) => {
    return apiClient.post('/auth/register', userData);
};

// Ejemplo para obtener datos protegidos (debes crear este endpoint en tu backend)
export const getSomeProtectedData = async () => {
    return apiClient.get('/api/some-data'); // Ajusta la ruta según tu backend
};


// Exporta la instancia de apiClient para ser usada directamente en otros lugares (como AuthContext)
export default apiClient;