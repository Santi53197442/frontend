// src/services/api.js
import axios from 'axios';

// Define la URL raíz de tu backend.
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://web-production-2443c.up.railway.app";
const BASE_URL = `${API_ROOT_URL}/api`;

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para añadir el token
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

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado.");
            // Lógica para desloguear al usuario, etc.
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

// Función para crear una localidad individual
export const crearLocalidad = async (localidadData) => {
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response;
    } catch (error) {
        console.error("Error al crear localidad desde api.js:", error.response || error);
        throw error;
    }
};

// --- FUNCIÓN FALTANTE PARA CARGA MASIVA DE LOCALIDADES ---
/**
 * Sube un archivo CSV para la creación masiva de localidades.
 * @param {File} file - El archivo CSV seleccionado por el usuario.
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API con el resumen del proceso.
 */
export const crearLocalidadesBatch = async (file) => { // <--- ASEGÚRATE QUE ESTA FUNCIÓN ESTÉ AQUÍ Y EXPORTADA
    const formData = new FormData();
    formData.append('file', file); // El nombre 'file' debe coincidir con @RequestParam("file") en el backend

    try {
        const response = await apiClient.post('/vendedor/localidades-batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Importante para la subida de archivos
            },
        });
        return response; // Devuelve la respuesta completa de Axios
    } catch (error) {
        console.error("Error al subir archivo CSV de localidades desde api.js:", error.response || error);
        throw error; // Re-lanzar para que el componente lo maneje
    }
};
// ------------------------------------------------------------

// Exporta la instancia de apiClient para usarla directamente si se prefiere
export default apiClient;