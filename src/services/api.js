// src/services/apiService.js
import axios from 'axios';

// Define la URL raíz de tu backend.
const API_ROOT_URL = process.env.REACT_APP_API_ROOT_URL || "https://web-production-2443c.up.railway.app";
const BASE_URL = `${API_ROOT_URL}/api`;

const apiClient = axios.create({
    baseURL: BASE_URL,
    // timeout: 10000, // 10 segundos
});

// Interceptor para añadir el token JWT a las cabeceras de las solicitudes
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
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

// Interceptor para manejar respuestas globalmente
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Response Error Status:", error.response.status);
            console.error("API Response Error Data:", error.response.data);
            if (error.response.status === 401) {
                console.warn("Interceptor API: Error 401 - No autorizado.");
                // Lógica de deslogueo y redirección
                // localStorage.removeItem('authToken');
                // localStorage.removeItem('userRole');
                // if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                //    window.location.href = '/login';
                // }
            }
        } else if (error.request) {
            console.error("API No Response Error:", error.request);
        } else {
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

// --- FUNCIONES DE USUARIO ---
/**
 * Obtiene el perfil del usuario actualmente autenticado.
 */
export const getCurrentUserProfile = async () => {
    try {
        const response = await apiClient.get('/user/profile');
        return response;
    } catch (error) {
        console.error("Error en API al obtener perfil de usuario:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Actualiza el perfil del usuario actualmente autenticado.
 * @param {object} updateUserDTO - Objeto con los datos a actualizar.
 */
export const updateUserProfile = async (updateUserDTO) => {
    try {
        const response = await apiClient.put('/user/profile', updateUserDTO);
        return response;
    } catch (error) {
        console.error("Error en API al actualizar perfil de usuario:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Cambia la contraseña del usuario actualmente autenticado.
 * @param {object} changePasswordDTO - Objeto con { currentPassword, newPassword }.
 */
export const changePassword = async (changePasswordDTO) => {
    try {
        // El endpoint es PUT /api/user/password según tu controlador de backend
        const response = await apiClient.put('/user/password', changePasswordDTO);
        return response;
    } catch (error) {
        console.error("Error en API al cambiar la contraseña:", error.response?.data || error.message);
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
        // Asegúrate que este endpoint GET /vendedor/omnibus/{id} exista en tu backend.
        // Si no existe, deberás crearlo o ajustar esta llamada.
        const response = await apiClient.get(`/vendedor/omnibus/${id}`);
        return response;
    } catch (error) {
        console.error(`Error en API al obtener ómnibus con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

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
 * Marca un ómnibus específico como inactivo (o cualquier estado de inactividad como EN_MANTENIMIENTO, FUERA_DE_SERVICIO),
 * especificando el nuevo estado y opcionalmente un rango de fechas.
 * @param {number|string} omnibusId - El ID del ómnibus.
 * @param {object} data - Objeto con { nuevoEstado: string, inicioInactividad: string (ISO DateTime), finInactividad: string (ISO DateTime) }
 *                        Donde nuevoEstado puede ser 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'.
 * @returns {Promise<axios.Response>} La respuesta de la API con el ómnibus actualizado.
 */
export const marcarOmnibusInactivo = async (omnibusId, data) => {
    try {
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-inactivo`, data);
        return response;
    } catch (error) {
        console.error(`Error en API al marcar ómnibus ${omnibusId} como inactivo (estado: ${data?.nuevoEstado}):`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Marca un ómnibus específico como OPERATIVO.
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
    } catch (error)
    {
        console.error(`Error en API al finalizar el viaje con ID ${viajeId}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- FUNCIÓN PARA REASIGNAR UN VIAJE A OTRO ÓMNIBUS (CORREGIDA) -------------
/**
 * Reasigna un viaje existente a un nuevo ómnibus.
 *
 * @param {number|string} viajeId        El ID del viaje a reasignar.
 * @param {number|string} nuevoOmnibusId El ID del nuevo ómnibus al que se asignará el viaje.
 * @returns {Promise<axios.Response>} La respuesta de la API con el ViajeResponseDTO actualizado.
 */
export const reasignarViaje = async (viajeId, nuevoOmnibusId) => {
    try {
        // El backend espera un objeto ReasignarViajeRequestDTO en el body
        const requestBody = {
            nuevoOmnibusId: nuevoOmnibusId // Nombre de la propiedad debe coincidir con el DTO del backend
        };
        const response = await apiClient.put(
            `/vendedor/viajes/${viajeId}/reasignar`,
            requestBody // Enviamos el nuevoOmnibusId en el cuerpo de la solicitud
        );
        return response;
    } catch (error) {
        console.error(
            `Error en API al reasignar viaje ${viajeId} al ómnibus ${nuevoOmnibusId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

export const obtenerViajesPorEstado = async (estado) => {
    try {
        const response = await apiClient.get('/vendedor/viajes/estado', { params: { estado } });
        return response;
    } catch (error) {
        console.error(`Error en API al obtener viajes por estado ${estado}:`, error.response?.data || error.message);
        throw error;
    }
};

export default apiClient;