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
        const token = localStorage.getItem('authToken'); // Asegúrate que 'authToken' es la clave correcta
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
                console.warn("Interceptor API: Error 401 - No autorizado (token inválido/expirado).");
            }
            if (error.response.status === 403) {
                console.warn("Interceptor API: Error 403 - Prohibido (el rol del usuario no permite esta acción).");
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
// ... (tus funciones de autenticación existentes)
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
// ... (tus funciones de usuario existentes)
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

export const buscarClientePorCI = async (ci) => {
    try {
        const response = await apiClient.get(`/user/ci/${ci}`);
        return response;
    } catch (error) {
        console.error(`API Error: buscarClientePorCI para CI ${ci}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- FUNCIONES PARA LOCALIDAD (VENDEDOR Y CLIENTE) ---
// ... (tus funciones de localidad existentes)
export const obtenerTodasLasLocalidades = async () => {
    try {
        const response = await apiClient.get('/vendedor/localidades-disponibles');
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerTodasLasLocalidades) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// --- FUNCIONES PARA LOCALIDAD (SOLO VENDEDOR/ADMIN) ---
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

// --- FUNCIONES PARA ÓMNIBUS (SOLO VENDEDOR/ADMIN) ---
// ... (tus funciones de ómnibus existentes)
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

// --- FUNCIONES PARA VIAJE (VENDEDOR Y CLIENTE) ---
// ... (tus funciones de viaje existentes)
export const buscarViajesConDisponibilidad = async (criterios = {}) => {
    try {
        const response = await apiClient.get('/vendedor/viajes/buscar-disponibles', {
            params: criterios
        });
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (buscarViajesConDisponibilidad) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

export const obtenerDetallesViajeConAsientos = async (viajeId) => {
    try {
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/detalles-asientos`);
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerDetallesViajeConAsientos para viaje ${viajeId}) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

export const obtenerAsientosOcupados = async (viajeId) => {
    try {
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/asientos-ocupados`);
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerAsientosOcupados para viaje ${viajeId}) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// --- FUNCIONES PARA VIAJE (SOLO VENDEDOR/ADMIN) ---
// ... (tus funciones de viaje solo para vendedor existentes)
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

// --- FUNCIONES PARA PASAJES ---
export const comprarPasaje = async (compraRequestDTO) => {
    try {
        const response = await apiClient.post('/vendedor/pasajes/comprar', compraRequestDTO);
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (comprarPasaje) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

export const obtenerHistorialPasajesCliente = async (clienteId) => {
    try {
        const response = await apiClient.get(`/cliente/${clienteId}/historial-pasajes`);
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerHistorialPasajesCliente para cliente ${clienteId}) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// --- NUEVA FUNCIÓN PARA LISTAR PASAJES DE UN VIAJE (VENDEDOR) ---
/**
 * Obtiene la lista de pasajes para un viaje específico, con filtros y ordenamiento.
 * @param {number|string} viajeId El ID del viaje.
 * @param {object} params Objeto con los parámetros de filtro y ordenamiento.
 *                        Ej: { clienteNombre: 'Juan', numeroAsiento: 5, estadoPasaje: 'VENDIDO', sortBy: 'clienteNombre', sortDir: 'asc' }
 * @returns {Promise<Object>} La respuesta de la API con la lista de pasajes.
 */
export const obtenerPasajesDeViajeParaVendedor = async (viajeId, params = {}) => {
    try {
        // El endpoint es /api/vendedor/viajes/{viajeId}/pasajes
        // Los parámetros de filtro se pasarán como query params
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/pasajes`, { params });
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerPasajesDeViajeParaVendedor para viaje ${viajeId}) - Status: ${status}, Mensaje: ${errorMessage}, Params: ${JSON.stringify(params)}`);
        throw error;
    }
};


// --- FUNCIONES PARA VENDEDOR/ADMIN (relacionadas a la selección de usuarios) ---
// ... (tus funciones de selección de usuarios existentes)
export const obtenerUsuariosParaSeleccion = async () => {
    try {
        const response = await apiClient.get('/admin/usuarios', { params: { rol: 'CLIENTE' } });
        return response;
    } catch (error) {
        console.error(
            "Error en API al obtener lista de clientes para selección:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const getDashboardStatistics = async () => {
    try {
        // La función ahora es la responsable de conocer la URL exacta.
        const response = await apiClient.get('/admin/dashboard/statistics');
        return response.data; // Devolvemos directamente la data para simplificar en el componente.
    } catch (error) {
        // Centralizamos el manejo de errores aquí.
        console.error("Error en API al obtener estadísticas del dashboard:", error.response?.data || error.message);
        // Relanzamos el error para que el componente que llama pueda manejarlo (ej. mostrar un mensaje al usuario).
        throw error;
    }
};

// --- NUEVA FUNCIÓN PARA OBTENER EL LISTADO DE VIAJES CON PRECIOS ---
/**
 * Obtiene un listado completo de todos los viajes con información resumida y precios.
 * Ideal para tablas de vista general para Vendedores o Administradores.
 * @returns {Promise<Object>} La respuesta de la API con la lista de ViajePrecioDTO.
 */
export const obtenerListadoViajesConPrecio = async () => {
    try {
        const response = await apiClient.get('/vendedor/viajes/listado-precios');
        return response;
    } catch (error) {
        console.error("Error en API al obtener el listado de viajes con precios:", error.response?.data || error.message);
        throw error;
    }
};

export const obtenerEstadisticasOmnibus = async () => {
    try {
        const response = await apiClient.get('/vendedor/omnibus/estadisticas');
        return response;
    } catch (error) {
        console.error("Error en API al obtener estadísticas de ómnibus:", error.response?.data || error.message);
        throw error;
    }
};

export const obtenerEstadisticasPasajes = async () => {
    try {
        const response = await apiClient.get('/vendedor/pasajes/estadisticas');
        return response;
    } catch (error) {
        console.error("Error en API al obtener estadísticas de pasajes:", error.response?.data || error.message);
        throw error;
    }
};

export const obtenerEstadisticasUsuarios = async () => {
    try {
        const response = await apiClient.get('/admin/usuarios/estadisticas');
        return response;
    } catch (error) {
        console.error("Error en API al obtener estadísticas de usuarios:", error.response?.data || error.message);
        throw error;
    }
};

// --- NUEVA FUNCIÓN PARA CREAR RESERVAS ---
/**
 * Llama al backend para crear una reserva temporal de un asiento.
 * @param {object} reservaData - Contiene viajeId y asientoNumero.
 * @returns {Promise<AxiosResponse<any>>} La respuesta de la API.
 */
export const crearReserva = (reservaData) => {
    // La URL debe coincidir con la que definiste en VendedorController
    // El 'api' inicial depende de tu configuración de proxy o URL base de axios
    return axios.post('/api/vendedor/reservas/crear', reservaData);
};

// --- NUEVA FUNCIÓN PARA LIBERAR RESERVAS (Opcional pero recomendado) ---
/**
 * Llama al backend para liberar una reserva si el usuario abandona el checkout.
 * @param {number} reservaId - El ID de la reserva a liberar.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const liberarReserva = (reservaId) => {
    // Este endpoint deberías crearlo en el backend. Por ahora, asumimos que existe.
    // Es un POST o DELETE, según prefieras.
    return axios.post(`/api/vendedor/reservas/${reservaId}/liberar`);
};

export const comprarMultiplesPasajes = (compraMultipleData) => {
    // Apunta al nuevo endpoint que creamos en el backend
    return apiClient.post('/vendedor/pasajes/comprar-multiple', compraMultipleData);
};
export const reservarAsientosTemporalmente = (reservaData) => {
    return apiClient.post('/vendedor/pasajes/reservar-temporalmente', reservaData);
};

/**
 * Busca un pasaje por su ID para obtener los detalles necesarios para la devolución.
 * @param {number|string} pasajeId El ID del pasaje.
 * @returns {Promise<Object>} La respuesta de la API con los datos del pasaje (PasajeResponseDTO).
 */
export const buscarPasajeParaDevolucion = async (pasajeId) => {
    try {
        // --- CORRECCIÓN ---
        // Ahora apunta al endpoint correcto que acabamos de crear en el backend.
        const response = await apiClient.get(`/vendedor/pasajes/${pasajeId}`);
        return response;
    } catch (error) {
        console.error(`Error en API al buscar pasaje ${pasajeId} para devolución:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Inicia el proceso de devolución y reembolso para un pasaje.
 * @param {number|string} pasajeId El ID del pasaje a devolver.
 * @returns {Promise<Object>} La respuesta de la API con el mensaje de éxito o error.
 */
export const procesarDevolucionPasaje = async (pasajeId) => {
    try {
        const response = await apiClient.post(`/vendedor/pasajes/${pasajeId}/devolucion`);
        return response;
    } catch (error) {
        console.error(`Error en API al procesar devolución para pasaje ${pasajeId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getUnreadNotificationsCount = () => {
    // La URL ahora apunta al VendedorController
    return apiClient.get('/vendedor/notificaciones/unread-count');
};

export const getMyNotifications = () => {
    // La URL ahora apunta al VendedorController
    return apiClient.get('/vendedor/notificaciones');
};

export const markNotificationAsRead = (id) => {
    // La URL ahora apunta al VendedorController
    return apiClient.post(`/vendedor/notificaciones/${id}/marcar-leida`);
};



export default apiClient;