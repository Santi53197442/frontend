// src/services/api.js
import axios from 'axios';

// TU URL BASE DEL BACKEND (Asegúrate que esta sea la correcta)
// Si usas un .env, asegúrate de que REACT_APP_API_URL esté bien configurada
// const BASE_URL = process.env.REACT_APP_API_URL || "https://web-production-2443c.up.railway.app";
const BASE_URL = "https://web-production-2443c.up.railway.app"; // Usando tu URL directamente por ahora

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de solicitud: Para añadir el token si ya está en localStorage
// (El AuthContext también lo setea globalmente en apiClient.defaults al loguear)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token && !config.headers.Authorization) { // Solo si no está ya seteado
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta (opcional pero muy útil para manejar errores 401 globalmente)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido o expirado
            // El AuthContext.logout() podría ser llamado desde aquí o el componente que recibe el error
            // Por ahora, solo lo registramos. El componente que hizo la llamada debe manejarlo.
            console.warn("Error 401: No autorizado. El token puede ser inválido o haber expirado.");
            // Opcionalmente, forzar logout:
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userEmail');
            // localStorage.removeItem('userRol');
            // window.location.href = '/login'; // Redirección forzada
        }
        return Promise.reject(error);
    }
);


// Las funciones específicas de API ya no necesitan manejar el token directamente
// ni el parsing a JSON, axios lo hace.

// La función de login la manejaremos principalmente desde AuthContext,
// pero apiClient.post('/auth/login', credentials) será la llamada.

export const registerUser = async (userData) => {
    // Asegúrate que el endpoint sea /auth/register si así está en tu backend
    return apiClient.post('/auth/register', userData);
};

// Ejemplo de una función para obtener datos protegidos
export const getSomeProtectedData = async () => {
    return apiClient.get('/api/alguna-ruta-protegida'); // Cambia la ruta
};


export default apiClient; // Exporta la instancia configurada