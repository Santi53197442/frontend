// src/services/apiService.js (o la ruta y nombre que uses para tu archivo de API)
import axios from 'axios';

// Define la URL raíz de tu backend.
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://web-production-2443c.up.railway.app";
const BASE_URL = `${API_ROOT_URL}/api`;

const apiClient = axios.create({
    baseURL: BASE_URL,
    // Podrías añadir un timeout por defecto si lo deseas
    // timeout: 10000, // 10 segundos
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
        console.error("API Request Interceptor Error:", error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas globalmente (opcional, pero útil para errores 401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // El servidor respondió con un estado fuera del rango 2xx
            console.error("API Response Error Status:", error.response.status);
            console.error("API Response Error Data:", error.response.data);

            if (error.response.status === 401) {
                console.warn("Interceptor API: Error 401 - No autorizado.");
                // Aquí podrías implementar la lógica para desloguear al usuario y redirigir a login.
                // Ejemplo:
                // localStorage.removeItem('authToken');
                // localStorage.removeItem('userRole');
                // if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                //    window.location.href = '/login';
                // }
            }
            // Podrías manejar otros errores comunes aquí (403, 404, 500) de forma genérica si lo deseas.

        } else if (error.request) {
            // La solicitud se hizo pero no se recibió respuesta (ej. problema de red)
            console.error("API No Response Error:", error.request);
        } else {
            // Algo más causó el error al configurar la solicitud
            console.error("API Request Setup Error:", error.message);
        }
        return Promise.reject(error);
    }
);

// --- FUNCIONES DE AUTENTICACIÓN ---
export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response;
    } catch (error) {
        console.error("Error en API al registrar usuario:", error.response?.data || error.message);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        return response;
    } catch (error) {
        console.error("Error en API al iniciar sesión:", error.response?.data || error.message);
        throw error;
    }
};

// --- FUNCIONES PARA LOCALIDAD (VENDEDOR) ---
export const crearLocalidad = async (localidadData) => {
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response;
    } catch (error) {
        console.error("Error en API al crear localidad:", error.response?.data || error.message);
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
        console.error("Error en API al subir CSV de localidades:", error.response?.data || error.message);
        throw error;
    }
};

export const obtenerTodasLasLocalidades = async () => {
    try {
        const response = await apiClient.get('/vendedor/localidades-disponibles');
        return response;
    } catch (error) {
        console.error("Error en API al obtener todas las localidades:", error.response?.data || error.message);
        throw error;
    }
};

// --- FUNCIONES PARA ÓMNIBUS (VENDEDOR) ---
export const crearOmnibus = async (omnibusData) => {
    try {
        const response = await apiClient.post('/vendedor/omnibus', omnibusData);
        return response;
    } catch (error) {
        console.error("Error en API al crear ómnibus:", error.response?.data || error.message);
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
        console.error("Error en API al subir CSV de ómnibus:", error.response?.data || error.message);
        throw error;
    }
};

export const obtenerTodosLosOmnibus = async () => {
    try {
        const response = await apiClient.get('/vendedor/omnibusListar');
        return response;
    } catch (error) {
        console.error("Error en API al obtener todos los ómnibus:", error.response?.data || error.message);
        throw error;
    }
};

export const obtenerOmnibusPorId = async (id) => {
    try {
        // Asumiendo que este endpoint existe en tu backend (no estaba en el VendedorController original que me pasaste para esta acción)
        // Si no existe, necesitarías añadirlo al backend.
        const response = await apiClient.get(`/vendedor/omnibus/${id}`);
        return response;
    } catch (error) {
        console.error(`Error en API al obtener ómnibus con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Obtiene una lista de ómnibus filtrados por su estado.
 * @param {string} estado - El estado del ómnibus a buscar (ej. "INACTIVO", "OPERATIVO").
 * @returns {Promise<axios.Response>} La respuesta de la API con la lista de ómnibus.
 */
export const obtenerOmnibusPorEstado = async (estado) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/por-estado`, { params: { estado } });
        return response;
    } catch (error) {
        console.error(`Error en API al obtener ómnibus por estado ${estado}:`, error.response?.data || error.message);
        throw error;
    }
};


// --- FUNCIONES PARA GESTIONAR ESTADO DE ÓMNIBUS (VENDEDOR) ---

/**
 * Marca un ómnibus específico como inactivo, especificando el nuevo estado de inactividad y opcionalmente un rango de fechas.
 * @param {number|string} omnibusId - El ID del ómnibus.
 * @param {object} data - Objeto con { nuevoEstado, inicioInactividad, finInactividad }
 * @returns {Promise<axios.Response>} La respuesta de la API con el ómnibus actualizado.
 */
export const marcarOmnibusInactivo = async (omnibusId, data) => {
    try {
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-inactivo`, data);
        return response;
    } catch (error) {
        console.error(`Error en API al marcar ómnibus ${omnibusId} como inactivo:`, error.response?.data || error.message);
        throw error;
    }
};


/**
 * Marca un ómnibus específico como OPERATIVO.
 * Esta función se usará para cambiar un ómnibus de INACTIVO (o EN_MANTENIMIENTO, etc.) a OPERATIVO.
 * @param {number|string} omnibusId - El ID del ómnibus a marcar como operativo.
 * @returns {Promise<axios.Response>} La respuesta de la API con el ómnibus actualizado.
 */
export const marcarOmnibusOperativo = async (omnibusId) => {
    try {
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-operativo`);
        return response;
    } catch (error) {
        console.error(`Error en API al marcar ómnibus ${omnibusId} como operativo:`, error.response?.data || error.message);
        throw error;
    }
};


// Las siguientes funciones (`programarDesafectacionOmnibus`, `ponerOmnibusEnMantenimiento`)
// podrían ser casos específicos de `marcarOmnibusInactivo` o `marcarOmnibusOperativo` si los estados
// (`PENDIENTE_DESAFECTACION`, `EN_MANTENIMIENTO`) son manejados por esos endpoints más generales en el backend.
// Si tienes endpoints dedicados en el backend para estas acciones, mantenlas.
// Por ahora, las comento para evitar redundancia si los endpoints generales ya cubren estos casos.
// Si los necesitas, asegúrate que los endpoints en el backend (`/programar-desafectacion`, `/poner-en-mantenimiento`)
// realmente existan y funcionen como esperas.

/*
export const programarDesafectacionOmnibus = async (omnibusId, fechaHoraDesafectacion) => {
    try {
        // Asume que el backend espera un PUT a /vendedor/omnibus/{id}/marcar-inactivo
        // con un cuerpo que incluya el estado PENDIENTE_DESAFECTACION y la fecha.
        // O si tienes un endpoint específico: /vendedor/omnibus/${omnibusId}/programar-desafectacion
        // Ajusta según tu backend.
        const payload = {
            nuevoEstado: 'PENDIENTE_DESAFECTACION', // Asegúrate que este EstadoBus exista
            // El backend /marcar-inactivo también espera inicioInactividad y finInactividad.
            // Si este es un estado permanente, podrías necesitar ajustar el backend o enviar fechas simbólicas.
            // inicioInactividad: fechaHoraDesafectacion,
            // finInactividad: fechaHoraDesafectacion, // O alguna fecha muy lejana
        };
        // Esta llamada es un ejemplo, verifica el endpoint y payload correctos con tu backend
        // const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-inactivo`, payload);
        // O si es un endpoint diferente:
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/programar-desafectacion`, null, { params: { fechaHoraDesafectacion } });
        return response;
    } catch (error) {
        console.error(`Error en API al programar desafectación para ómnibus ${omnibusId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const ponerOmnibusEnMantenimiento = async (omnibusId, fechaHoraReactivacionEstimada) => {
    try {
        // Asume que el backend espera un PUT a /vendedor/omnibus/{id}/marcar-inactivo
        // con un cuerpo que incluya el estado EN_MANTENIMIENTO y las fechas.
        // Ajusta según tu backend.
        const payload = {
            nuevoEstado: 'EN_MANTENIMIENTO',
            inicioInactividad: new Date().toISOString().split('T')[0], // Hoy como inicio por defecto
            finInactividad: fechaHoraReactivacionEstimada ? fechaHoraReactivacionEstimada.split('T')[0] : null,
        };
        // Esta llamada es un ejemplo, verifica el endpoint y payload correctos con tu backend
        // const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-inactivo`, payload);
        // O si es un endpoint diferente:
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/poner-en-mantenimiento`, null, { params: { fechaHoraReactivacionEstimada } });
        return response;
    } catch (error) {
        console.error(`Error en API al poner ómnibus ${omnibusId} en mantenimiento:`, error.response?.data || error.message);
        throw error;
    }
};
*/

// --- FUNCIONES PARA VIAJE (VENDEDOR) ---
export const crearViaje = async (viajeData) => {
    try {
        const response = await apiClient.post('/vendedor/viajes', viajeData);
        return response;
    } catch (error) {
        console.error("Error en API al crear viaje:", error.response?.data || error.message);
        throw error;
    }
};

export const finalizarViaje = async (viajeId) => {
    try {
        const response = await apiClient.post(`/vendedor/viajes/${viajeId}/finalizar`);
        return response;
    } catch (error) {
        console.error(`Error en API al finalizar el viaje con ID ${viajeId}:`, error.response?.data || error.message);
        throw error;
    }
};

// Si tienes otras funciones de API, agrégalas aquí.

export default apiClient; // Exportar la instancia configurada para uso directo si es necesario.
// Generalmente, es mejor exportar las funciones individuales como se ha hecho arriba.