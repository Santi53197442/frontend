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
        // Solo para depuración, puedes quitarlo después
        // console.log("Enviando request a:", config.url, "con token:", token ? "Sí" : "No");
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
            // Manejo de 401 (No Autorizado - token inválido o expirado)
            if (error.response.status === 401) {
                console.warn("Interceptor API: Error 401 - No autorizado (token inválido/expirado).");
                // Aquí es donde deberías implementar la lógica de deslogueo real
                // usando tu AuthContext o similar, en lugar de window.location.href directamente
                // Ejemplo:
                // authContext.logout(); // Si tienes un método logout en tu contexto
                // localStorage.removeItem('authToken');
                // localStorage.removeItem('userRole'); // y cualquier otro dato de sesión
                // if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                //    window.location.href = '/login'; // Redirección forzada
                // }
            }
            // Manejo de 403 (Prohibido - el usuario no tiene permisos para ESTE recurso)
            // Si es 403, el token es válido, pero el rol no permite la acción.
            // Aquí no se debería desloguear, solo informar o manejar el error en el componente.
            if (error.response.status === 403) {
                console.warn("Interceptor API: Error 403 - Prohibido (el rol del usuario no permite esta acción).");
            }
        } else if (error.request) {
            console.error("API No Response Error:", error.request); // Problema de red, backend no responde
        } else {
            console.error("API Request Setup Error:", error.message); // Error en la configuración de la solicitud
        }
        return Promise.reject(error); // Muy importante propagar el error
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
        // Aquí es donde deberías guardar el token y el rol del usuario
        // if (response.data && response.data.token) {
        //     localStorage.setItem('authToken', response.data.token);
        //     // Asumiendo que el backend devuelve el rol en response.data.usuario.rol o similar
        //     if (response.data.usuario && response.data.usuario.rol) {
        //         localStorage.setItem('userRole', response.data.usuario.rol);
        //     }
        // }
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
// ESTA FUNCIÓN SERÁ USADA TANTO POR VENDEDOR COMO POR CLIENTE (SEGÚN NUESTRO SUPUESTO)
export const obtenerTodasLasLocalidades = async () => {
    try {
        const response = await apiClient.get('/vendedor/localidades-disponibles');
        return response; // El backend debe permitir rol 'CLIENTE' aquí
    } catch (error) {
        // El console.error ya se maneja en el interceptor de respuesta, pero podemos ser más específicos.
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerTodasLasLocalidades) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

export const crearLocalidad = async (localidadData) => { // Solo para Vendedor/Admin
    try {
        const response = await apiClient.post('/vendedor/localidades', localidadData);
        return response;
    } catch (error) {
        console.error("Error en API al crear localidad:", error.response?.data || error.message);
        throw error;
    }
};

export const crearLocalidadesBatch = async (file) => { // Solo para Vendedor/Admin
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


// --- FUNCIONES PARA ÓMNIBUS (VENDEDOR) ---
// Estas funciones probablemente seguirán siendo solo para Vendedor/Admin
export const crearOmnibus = async (omnibusData) => {
    try {
        const response = await apiClient.post('/vendedor/omnibus', omnibusData);
        return response;
    } catch (error) {
        console.error("Error en API al crear ómnibus:", error.response?.data || error.message);
        throw error;
    }
};
// ... (resto de funciones de ómnibus sin cambios, asumiendo que son solo para vendedor/admin)
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


// --- FUNCIONES PARA VIAJE ---

// ESTA FUNCIÓN SERÁ USADA TANTO POR VENDEDOR COMO POR CLIENTE (SEGÚN NUESTRO SUPUESTO)
export const buscarViajesConDisponibilidad = async (criterios = {}) => {
    try {
        const response = await apiClient.get('/vendedor/viajes/buscar-disponibles', {
            params: criterios
        });
        return response; // El backend debe permitir rol 'CLIENTE' aquí
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (buscarViajesConDisponibilidad) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// Estas funciones probablemente seguirán siendo solo para Vendedor/Admin
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
// ... (resto de funciones de viaje como reasignarViaje, obtenerViajesPorEstado, buscarViajesDeOmnibus,
// asumiendo que son solo para VENDEDOR/ADMIN, se mantienen igual) ...
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


// ESTA FUNCIÓN TAMBIÉN SERÁ USADA POR CLIENTES Y VENDEDORES
export const obtenerDetallesViajeConAsientos = async (viajeId) => {
    try {
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/detalles-asientos`);
        return response; // El backend debe permitir rol 'CLIENTE' aquí
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerDetallesViajeConAsientos para viaje ${viajeId}) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// ESTA FUNCIÓN TAMBIÉN SERÁ USADA POR CLIENTES Y VENDEDORES
export const obtenerAsientosOcupados = async (viajeId) => {
    try {
        const response = await apiClient.get(`/vendedor/viajes/${viajeId}/asientos-ocupados`);
        return response; // El backend debe permitir rol 'CLIENTE' aquí
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (obtenerAsientosOcupados para viaje ${viajeId}) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// --- FUNCIONES PARA PASAJES ---

// ESTA FUNCIÓN PODRÍA SER USADA POR CLIENTES (para su propia compra) Y VENDEDORES (para comprar para un cliente)
// El backend necesitará manejar la lógica de clienteId adecuadamente.
// Si un cliente compra, el clienteId puede ser obtenido del token.
// Si un vendedor compra, el clienteId se envía en el DTO.
export const comprarPasaje = async (compraRequestDTO) => {
    try {
        // El endpoint podría ser más genérico si el backend lo maneja así,
        // o podrías tener '/cliente/pasajes/comprar' y '/vendedor/pasajes/comprar'
        const response = await apiClient.post('/vendedor/pasajes/comprar', compraRequestDTO); // Backend debe permitir rol 'CLIENTE' aquí
        return response;
    } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        console.error(`Error en API (comprarPasaje) - Status: ${status}, Mensaje: ${errorMessage}`);
        throw error;
    }
};

// Esta función es más probable que sea solo para Vendedor/Admin
export const obtenerUsuariosParaSeleccion = async () => {
    try {
        const response = await apiClient.get('/admin/usuarios?rol=CLIENTE');
        return response;
    } catch (error) {
        console.error(
            "Error en API al obtener lista de clientes:",
            error.response?.data || error.message
        );
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

export default apiClient;