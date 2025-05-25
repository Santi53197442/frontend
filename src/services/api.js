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

// Función para carga masiva de localidades
export const crearLocalidadesBatch = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post('/vendedor/localidades-batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error("Error al subir archivo CSV de localidades desde api.js:", error.response || error);
        throw error;
    }
};

// --- FUNCIONES PARA ÓMNIBUS ---
/**
 * Crea un nuevo ómnibus individualmente.
 * @param {object} omnibusData - Datos del ómnibus (CreateOmnibusDTO).
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API.
 */
export const crearOmnibus = async (omnibusData) => {
    try {
        const response = await apiClient.post('/vendedor/omnibus', omnibusData);
        return response;
    } catch (error) {
        console.error("Error al crear ómnibus desde api.js:", error.response || error);
        throw error;
    }
};

/**
 * Sube un archivo CSV para la creación masiva de ómnibus.
 * @param {File} file - El archivo CSV seleccionado por el usuario.
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API con el resumen del proceso.
 */
export const crearOmnibusBatch = async (file) => { // <--- ¡¡ESTA ES LA FUNCIÓN QUE FALTABA!!
    const formData = new FormData();
    formData.append('file', file); // El nombre 'file' debe coincidir con @RequestParam("file") en el backend

    try {
        const response = await apiClient.post('/vendedor/omnibus-batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Importante para la subida de archivos
            },
        });
        return response; // Devuelve la respuesta completa de Axios
    } catch (error) {
        console.error("Error al subir archivo CSV de ómnibus desde api.js:", error.response || error);
        throw error; // Re-lanzar para que el componente lo maneje
    }
};

/**
 * Obtiene la lista de todas las localidades (necesaria para el dropdown en el alta de ómnibus).
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API con la lista de localidades.
 */
export const obtenerTodasLasLocalidades = async () => {
    try {
        const response = await apiClient.get('/vendedor/localidades-disponibles');
        return response;
    } catch (error) {
        console.error("Error al obtener todas las localidades:", error.response || error);
        throw error;
    }
};

/**
 * Obtiene la lista de todos los ómnibus.
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API con la lista de ómnibus.
 */
export const obtenerTodosLosOmnibus = async () => {
    try {
        // Asegúrate que el endpoint coincida con tu VendedorController
        // Antes tenías "/vendedor/omnibus" aquí, pero tu controller tiene "/vendedor/listarOmnibus"
        const response = await apiClient.get('/vendedor/listarOmnibus');
        return response;
    } catch (error) {
        console.error("Error al obtener todos los ómnibus:", error.response || error);
        throw error;
    }
};

/**
 * Obtiene un ómnibus por su ID.
 * @param {number | string} id - El ID del ómnibus.
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API con el ómnibus.
 */
export const obtenerOmnibusPorId = async (id) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/${id}`);
        return response;
    } catch (error) {
        console.error(`Error al obtener ómnibus con ID ${id}:`, error.response || error);
        throw error;
    }
};
// ------------------------------------------------------------

// Exporta la instancia de apiClient para usarla directamente si se prefiere
export default apiClient;