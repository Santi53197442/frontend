// src/services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Asegúrate que 'authToken' es la clave correcta
        if (token) {
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

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado. El token puede ser inválido o haber expirado.");
            // Considera un logout global si el token es rechazado consistentemente
            // Ejemplo (necesitaría acceso al método logout del AuthContext o una implementación similar):
            // if (typeof window.triggerGlobalLogout === 'function') {
            //    window.triggerGlobalLogout();
            // } else {
            //    localStorage.clear(); // O remover items específicos
            //    window.location.href = '/login';
            // }
        }
        return Promise.reject(error);
    }
);

// Función para el registro de usuarios
export const registerUser = async (userData) => {
    // La ruta completa será BASE_URL + '/auth/register'
    return apiClient.post('/auth/register', userData);
};

// Función para el login de usuarios (si la usas desde AuthContext o directamente)
export const loginUser = async (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

// NO necesitas funciones específicas aquí para forgot-password o reset-password
// Los componentes pueden usar apiClient.post('/auth/forgot-password', data) directamente
// ya que esos endpoints no necesitan el token que este interceptor añade.

// Ejemplo para obtener datos protegidos (se mantiene igual)
export const getSomeProtectedData = async () => {
    return apiClient.get('/api/some-data');
};

export default apiClient;