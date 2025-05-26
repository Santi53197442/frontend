// src/services/api.js
import axios from 'axios';

// Define la URL raíz de tu backend.
// Asegúrate que process.env.REACT_APP_API_ROOT_URL esté definida en tu .env
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://web-production-2443c.up.railway.app";
const BASE_URL = `${API_ROOT_URL}/api`;

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para añadir el token JWT a las cabeceras de las solicitudes
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // O como almacenes tu token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas globalmente (opcional, pero útil para errores 401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Interceptor API: Error 401 - No autorizado. Redirigiendo a login...");
            // Aquí puedes implementar la lógica para desloguear al usuario y redirigirlo.
            // Por ejemplo:
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userRole'); // Si almacenas el rol
            // window.location.href = '/login'; // O usa el sistema de rutas de React Router
        }
        // Es importante re-lanzar el error para que los componentes puedan manejarlo también si es necesario
        return Promise.reject(error);
    }
);

// --- FUNCIONES DE AUTENTICACIÓN ---
export const registerUser = async (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const loginUser = async (credentials) => {
    // Devuelve directamente la promesa de axios para que el componente maneje la respuesta completa
    return apiClient.post('/auth/login', credentials);
};

// --- FUNCIONES PARA LOCALIDAD (VENDEDOR) ---
export const crearLocalidad = async (localidadData) => {
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response; // Devuelve la respuesta completa
    } catch (error) {
        console.error("Error en API al crear localidad:", error.response || error);
        throw error; // Re-lanzar para que el componente lo maneje
    }
};

export const crearLocalidadesBatch = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/vendedor/localidades-batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
    } catch (error) {
        console.error("Error en API al subir CSV de localidades:", error.response || error);
        throw error;
    }
};

export const obtenerTodasLasLocalidades = async () => {
    try {
        const response = await apiClient.get('/vendedor/localidades-disponibles');
        return response; // El componente accederá a response.data
    } catch (error) {
        console.error("Error en API al obtener todas las localidades:", error.response || error);
        throw error;
    }
};

// --- FUNCIONES PARA ÓMNIBUS (VENDEDOR) ---
export const crearOmnibus = async (omnibusData) => {
    try {
        const response = await apiClient.post('/vendedor/omnibus', omnibusData);
        return response;
    } catch (error) {
        console.error("Error en API al crear ómnibus:", error.response || error);
        throw error;
    }
};

export const crearOmnibusBatch = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/vendedor/omnibus-batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
    } catch (error) {
        console.error("Error en API al subir CSV de ómnibus:", error.response || error);
        throw error;
    }
};

// Función ACTUALIZADA para listar todos los ómnibus
export const obtenerTodosLosOmnibus = async () => {
    try {
        const response = await apiClient.get('/vendedor/omnibusListar'); // Ruta actualizada
        return response; // El componente accederá a response.data
    } catch (error) {
        console.error("Error en API al obtener todos los ómnibus:", error.response || error);
        throw error;
    }
};

export const obtenerOmnibusPorId = async (id) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/${id}`);
        return response;
    } catch (error) {
        console.error(`Error en API al obtener ómnibus con ID ${id}:`, error.response || error);
        throw error;
    }
};

// --- FUNCIONES PARA VIAJE (VENDEDOR) ---
export const crearViaje = async (viajeData) => {
    try {
        const response = await apiClient.post('/vendedor/viajes', viajeData);
        return response;
    } catch (error) {
        console.error("Error en API al crear viaje:", error.response || error);
        throw error;
    }
};

// Nueva función para finalizar un viaje
export const finalizarViaje = async (viajeId) => {
    try {
        // El ID del viaje va en la URL como un path variable
        const response = await apiClient.post(`/vendedor/viajes/${viajeId}/finalizar`);
        return response;
    } catch (error) {
        console.error(`Error en API al finalizar el viaje con ID ${viajeId}:`, error.response || error);
        throw error;
    }
};

// Puedes añadir más funciones de API aquí a medida que las necesites...

// Exporta la instancia de apiClient si necesitas usarla directamente en algún caso raro,
// pero generalmente es mejor usar las funciones exportadas.
export default apiClient;