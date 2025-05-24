// src/services/api.js
import axios from 'axios';

// BASE_URL ahora incluye /api si tus endpoints en el backend son /api/admin, /api/auth, etc.
// Y tus llamadas en el frontend son apiClient.post('/admin/...') o apiClient.post('/auth/...')
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://web-production-2443c.up.railway.app";
const BASE_URL = `${API_ROOT_URL}/api`; // Ej: "https://web-production-2443c.up.railway.app/api"

const apiClient = axios.create({
    baseURL: BASE_URL,
    // No Content-Type default headers
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado.");
            // localStorage.removeItem('authToken');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Ahora las rutas son relativas a BASE_URL (que ya incluye /api)
export const registerUser = async (userData) => {
    return apiClient.post('/auth/register', userData); // Llama a https://.../api/auth/register
};

export const loginUser = async (credentials) => {
    return apiClient.post('/auth/login', credentials); // Llama a https://.../api/auth/login
};

export const getSomeProtectedData = async () => {
    return apiClient.get('/some-data'); // Llama a https://.../api/some-data
};

export default apiClient;