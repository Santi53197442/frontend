import axios from 'axios';

// Define la URL raíz de tu backend.
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
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('userRole');
            // window.location.href = '/login';
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

// --- FUNCIONES PARA LOCALIDAD (VENDEDOR) ---
export const crearLocalidad = async (localidadData) => {
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response;
    } catch (error) {
        console.error("Error en API al crear localidad:", error.response || error);
        throw error;
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
        return response;
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

export const obtenerTodosLosOmnibus = async () => {
    try {
        const response = await apiClient.get('/vendedor/omnibusListar');
        return response;
    } catch (error) {
        console.error("Error en API al obtener todos los ómnibus:", error.response || error);
        throw error;
    }
};

export const obtenerOmnibusPorId = async (id) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/${id}`); // Asumiendo que tienes este endpoint
        return response;
    } catch (error) {
        console.error(`Error en API al obtener ómnibus con ID ${id}:`, error.response || error);
        throw error;
    }
};

export const obtenerOmnibusPorEstado = async (estado) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/por-estado`, { params: { estado } });
        return response;
    } catch (error) {
        console.error(`Error en API al obtener ómnibus por estado ${estado}:`, error.response || error);
        throw error;
    }
};


// --- NUEVAS/MODIFICADAS FUNCIONES PARA GESTIONAR ESTADO DE ÓMNIBUS ---

/**
 * Programa la desafectación permanente de un ómnibus para una fecha futura.
 * El ómnibus pasará a PENDIENTE_DESAFECTACION y luego a FUERA_DE_SERVICIO.
 * @param {number|string} omnibusId - El ID del ómnibus.
 * @param {string} fechaHoraDesafectacion - Fecha y hora ISO (YYYY-MM-DDTHH:mm:ss) para la desafectación.
 */
export const programarDesafectacionOmnibus = async (omnibusId, fechaHoraDesafectacion) => {
    try {
        const response = await apiClient.put(
            `/vendedor/omnibus/${omnibusId}/programar-desafectacion`,
            null, // Sin cuerpo en la solicitud PUT para este endpoint específico
            { params: { fechaHoraDesafectacion } } // Los datos van como query parameters
        );
        return response;
    } catch (error) {
        console.error(`Error en API al programar desafectación para ómnibus ${omnibusId}:`, error.response || error);
        throw error;
    }
};

/**
 * Pone un ómnibus en estado EN_MANTENIMIENTO.
 * Opcionalmente, se puede proveer una fecha estimada de reactivación.
 * @param {number|string} omnibusId - El ID del ómnibus.
 * @param {string|null} fechaHoraReactivacionEstimada - Fecha y hora ISO (YYYY-MM-DDTHH:mm:ss) para la reactivación, o null/undefined.
 */
export const ponerOmnibusEnMantenimiento = async (omnibusId, fechaHoraReactivacionEstimada) => {
    try {
        let params = {};
        if (fechaHoraReactivacionEstimada) {
            params.fechaHoraReactivacionEstimada = fechaHoraReactivacionEstimada;
        }
        const response = await apiClient.put(
            `/vendedor/omnibus/${omnibusId}/poner-en-mantenimiento`,
            null, // Sin cuerpo en la solicitud PUT
            { params } // Los datos van como query parameters
        );
        return response;
    } catch (error) {
        console.error(`Error en API al poner ómnibus ${omnibusId} en mantenimiento:`, error.response || error);
        throw error;
    }
};

/**
 * Marca un ómnibus como OPERATIVO manualmente (ej. después de mantenimiento sin fecha programada).
 * @param {number|string} omnibusId - El ID del ómnibus.
 */
export const marcarOmnibusOperativoManualmente = async (omnibusId) => {
    try {
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-operativo`);
        return response;
    } catch (error) {
        console.error(`Error en API al marcar ómnibus ${omnibusId} como operativo:`, error.response || error);
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

export const finalizarViaje = async (viajeId) => {
    try {
        const response = await apiClient.post(`/vendedor/viajes/${viajeId}/finalizar`);
        return response;
    } catch (error) {
        console.error(`Error en API al finalizar el viaje con ID ${viajeId}:`, error.response || error);
        throw error;
    }
};

export default apiClient;