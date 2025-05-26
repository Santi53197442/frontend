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
            // Ejemplo:
            // localStorage.removeItem('authToken');
            // window.location.href = '/login'; // O la ruta de tu login
        }
        return Promise.reject(error);
    }
);

// --- FUNCIONES DE AUTENTICACIÓN ---
export const registerUser = async (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const loginUser = async (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

// (Opcional) Ejemplo para obtener datos protegidos
export const getSomeProtectedData = async () => {
    return apiClient.get('/ruta-protegida'); // Asegúrate que esta ruta exista en tu backend
};

// --- FUNCIONES PARA LOCALIDAD ---
export const crearLocalidad = async (localidadData) => {
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response;
    } catch (error) {
        console.error("Error al crear localidad desde api.js:", error.response || error);
        throw error;
    }
};

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

export const obtenerTodasLasLocalidades = async () => {
    try {
        const response = await apiClient.get('/vendedor/localidades-disponibles');
        return response;
    } catch (error) {
        console.error("Error al obtener todas las localidades:", error.response || error);
        throw error;
    }
};

// --- FUNCIONES PARA ÓMNIBUS ---
export const crearOmnibus = async (omnibusData) => {
    try {
        const response = await apiClient.post('/vendedor/omnibus', omnibusData);
        return response;
    } catch (error) {
        console.error("Error al crear ómnibus desde api.js:", error.response || error);
        throw error;
    }
};

export const crearOmnibusBatch = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post('/vendedor/omnibus-batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error("Error al subir archivo CSV de ómnibus desde api.js:", error.response || error);
        throw error;
    }
};

export const obtenerTodosLosOmnibus = async () => {
    try {
        const response = await apiClient.get('/vendedor/listarOmnibus');
        return response;
    } catch (error) {
        console.error("Error al obtener todos los ómnibus:", error.response || error);
        throw error;
    }
};

export const obtenerOmnibusPorId = async (id) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/${id}`);
        return response;
    } catch (error) {
        console.error(`Error al obtener ómnibus con ID ${id}:`, error.response || error);
        throw error;
    }
};

// --- FUNCIONES PARA VIAJE ---
/**
 * Crea un nuevo viaje.
 * @param {object} viajeData - Datos del viaje (corresponde a ViajeRequestDTO en el backend).
 * Incluye: fecha, horaSalida, horaLlegada, origenId (Long), destinoId (Long).
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API con el viaje creado.
 */
export const crearViaje = async (viajeData) => {
    try {
        // Asegúrate que los IDs de localidad (origenId, destinoId) sean números (Long en backend)
        // y las fechas/horas estén en el formato esperado por el backend (ISO String usualmente para LocalDate/LocalTime).
        const response = await apiClient.post('/vendedor/viajes', viajeData);
        return response;
    } catch (error) {
        console.error("Error al crear viaje desde api.js:", error.response || error);
        throw error; // Re-lanzar para que el componente lo maneje
    }
};
// ------------------------------------------------------------

// Exporta la instancia de apiClient para usarla directamente si se prefiere
export default apiClient;