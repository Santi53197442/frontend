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
export const getCurrentUserProfile = async () => {
    try {
        const response = await apiClient.get('/user/profile');
        return response;
    } catch (error) {
        console.error("Error en API al obtener perfil de usuario:", error.response?.data || error.message);
        throw error;
    }
};

export const updateUserProfile = async (updateUserDTO) => {
    try {
        const response = await apiClient.put('/user/profile', updateUserDTO);
        return response;
    } catch (error) {
        console.error("Error en API al actualizar perfil de usuario:", error.response?.data || error.message);
        throw error;
    }
};

export const changePassword = async (changePasswordDTO) => {
    try {
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

export const marcarOmnibusInactivo = async (omnibusId, data) => {
    try {
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-inactivo`, data);
        return response;
    } catch (error) {
        console.error(`Error en API al marcar ómnibus ${omnibusId} como inactivo (estado: ${data?.nuevoEstado}):`, error.response?.data || error.message);
        throw error;
    }
};

export const marcarOmnibusOperativo = async (omnibusId) => {
    try {
        const response = await apiClient.put(`/vendedor/omnibus/${omnibusId}/marcar-operativo`);
        return response;
    } catch (error) {
        console.error(`Error en API al marcar ómnibus ${omnibusId} como operativo:`, error.response?.data || error.message);
        throw error;
    }
};


// --- FUNCIONES PARA VIAJE (VENDEDOR Y/O CLIENTE) ---
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

export const reasignarViaje = async (viajeId, nuevoOmnibusId) => {
    try {
        const requestBody = {
            nuevoOmnibusId: nuevoOmnibusId
        };
        const response = await apiClient.put(
            `/vendedor/viajes/${viajeId}/reasignar`,
            requestBody
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

export const buscarViajesDeOmnibus = async (omnibusId, params = {}) => {
    try {
        const response = await apiClient.get(`/vendedor/omnibus/${omnibusId}/viajes`, { params });
        return response;
    } catch (error) {
        console.error(
            `Error en API al buscar viajes para el ómnibus ${omnibusId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

export const buscarViajesConDisponibilidad = async (criterios = {}) => {
    try {
        const response = await apiClient.get('/vendedor/viajes/buscar-disponibles', {
            params: criterios
        });
        return response;
    } catch (error) {
        console.error(
            "Error en API al buscar viajes con disponibilidad:",
            error.response?.data || error.message
        );
        throw error;
    }
};

// --- NUEVA FUNCIÓN ---
/**
 * Obtiene los detalles de un viaje específico, incluyendo la capacidad del ómnibus
 * y la lista de números de asiento que ya están ocupados.
 * @param {number|string} viajeId El ID del viaje a consultar.
 * @returns {Promise<axios.Response<object>>} La respuesta de la API con el ViajeDetalleConAsientosDTO.
 */
export const obtenerDetallesViajeConAsientos = async (viajeId) => {
    try {
        // El endpoint es /api/vendedor/viajes/{viajeId}/detalles-asientos
        // Si tu baseURL ya es /api, entonces el path relativo es /vendedor/viajes/...
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/detalles-asientos`);
        return response; // response.data contendrá el ViajeDetalleConAsientosDTO
    } catch (error) {
        console.error(
            `Error en API al obtener detalles y asientos para el viaje ID ${viajeId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};
export const obtenerDetallesViajeConAsientos = async (viajeId) => {
    try {
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/detalles-asientos`);
        return response;
    } catch (error) {
        console.error(
            `Error en API al obtener detalles y asientos para el viaje ID ${viajeId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

// --- FUNCIONES PARA PASAJES ---

/**
 * Obtiene la lista de números de asientos que ya están ocupados para un viaje específico.
 * @param {number|string} viajeId El ID del viaje.
 * @returns {Promise<axios.Response<number[]>>} La respuesta de la API con un array de números de asiento.
 */
export const obtenerAsientosOcupados = async (viajeId) => {
    try {
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/asientos-ocupados`);
        // response.data será el array de números [1, 5, 10]
        return response;
    } catch (error) {
        console.error(
            `Error en API al obtener asientos ocupados para el viaje ID ${viajeId}:`,
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Realiza la compra de un pasaje.
 * @param {object} compraRequestDTO El DTO con los datos para la compra.
 * @param {number} compraRequestDTO.viajeId
 * @param {number} compraRequestDTO.clienteId
 * @param {number} compraRequestDTO.numeroAsiento
 * @returns {Promise<axios.Response<object>>} La respuesta de la API con el PasajeResponseDTO.
 */
export const comprarPasaje = async (compraRequestDTO) => {
    try {
        const response = await apiClient.post('/vendedor/pasajes/comprar', compraRequestDTO);
        // response.data será el PasajeResponseDTO
        return response;
    } catch (error) {
        console.error(
            "Error en API al comprar pasaje:",
            error.response?.data || error.message
        );
        throw error;
    }
};

/**
 * Obtiene una lista de usuarios (clientes) para que el vendedor seleccione.
 * DEBES AJUSTAR EL ENDPOINT A TU IMPLEMENTACIÓN REAL.
 * @returns {Promise<axios.Response<object[]>>} La respuesta de la API con un array de usuarios.
 */
export const obtenerUsuariosParaSeleccion = async () => {
    try {
        // EJEMPLO DE ENDPOINT: Podría ser /admin/usuarios?rol=CLIENTE
        // o /vendedor/clientes. Asegúrate que este endpoint exista y devuelva
        // un array de objetos usuario, cada uno con al menos 'id' y 'nombre'.
        const response = await apiClient.get('/admin/usuarios?rol=CLIENTE'); // <-- ¡¡AJUSTA ESTE ENDPOINT!!
        // response.data será el array de usuarios
        return response;
    } catch (error) {
        console.error(
            "Error en API al obtener lista de clientes:",
            error.response?.data || error.message
        );
        throw error;
    }
};


// Si vas a implementar la descarga de PDF:
// export const descargarPasajePdf = async (pasajeId) => {
//     try {
//         const response = await apiClient.get(`/vendedor/pasajes/${pasajeId}/pdf`, {
//             responseType: 'blob', // Importante para archivos
//         });
//         return response;
//     } catch (error) {
//         console.error(
//             `Error en API al descargar PDF para pasaje ID ${pasajeId}:`,
//             error.response?.data || error.message
//         );
//         throw error;
//     }
// };


export default apiClient;


export default apiClient;