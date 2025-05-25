// src/pages/vendedor/VendedorAltaLocalidadPage.js
import React, { useState } from 'react'; // No necesitas useContext aquí si api.js maneja el token globalmente
import { useNavigate } from 'react-router-dom';
//import './VendedorAltaLocalidadPage.css'; // Asegúrate de crear este archivo CSS
import { crearLocalidad } from '../../services/api'; // Verifica que la ruta a tu api.js sea correcta

const VendedorAltaLocalidadPage = () => {
    const [nombre, setNombre] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [direccion, setDireccion] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Para feedback visual durante la llamada API
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!nombre.trim() || !departamento.trim() || !direccion.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        setIsLoading(true);

        try {
            const localidadData = { nombre, departamento, direccion };
            // La función crearLocalidad de api.js ya maneja el token (si está configurado en el interceptor)
            // y devuelve la respuesta completa de Axios.
            const response = await crearLocalidad(localidadData);

            // Spring Boot típicamente devuelve el objeto creado en response.data con un estado 201 (Created)
            if (response && response.data && response.status === 201) {
                setSuccess(`Localidad "${response.data.nombre}" creada con éxito (ID: ${response.data.id}).`);
                // Limpiar formulario
                setNombre('');
                setDepartamento('');
                setDireccion('');
                // Opcional: Redirigir después de un breve momento
                // setTimeout(() => {
                //     navigate('/vendedor/dashboard'); // o a una lista de localidades
                // }, 2000);
            } else {
                // Esto podría ocurrir si el backend devuelve un 200 OK sin datos, o un estado inesperado.
                setError(response?.data?.message || 'Respuesta inesperada del servidor al crear la localidad.');
                console.error("Respuesta inesperada del servidor:", response);
            }
        } catch (err) {
            console.error("Error en handleSubmit de VendedorAltaLocalidadPage:", err);
            // El error ya fue procesado por el interceptor de api.js si fue un 401.
            // Para otros errores (ej. validación 400, conflicto 409, error de servidor 500):
            let errorMessage = 'Error al crear la localidad. Inténtalo de nuevo.';
            if (err.response) {
                // Si el backend envía un mensaje de error específico (común con Spring Boot Validation)
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (typeof err.response.data === 'string' && err.response.data.length < 200) { // A veces el error es solo un string
                    errorMessage = err.response.data;
                } else {
                    errorMessage = `Error del servidor: ${err.response.status}`;
                }
            } else if (err.request) {
                // La solicitud se hizo pero no se recibió respuesta
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else {
                // Algo más causó el error
                errorMessage = err.message || 'Ocurrió un error desconocido.';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="alta-localidad-container">
            <h2>Alta de Nueva Localidad</h2>
            {error && <p className="error-message" role="alert">{error}</p>}
            {success && <p className="success-message" role="alert">{success}</p>}
            <form onSubmit={handleSubmit} className="alta-localidad-form">
                <div>
                    <label htmlFor="nombre-localidad">Nombre:</label>
                    <input
                        type="text"
                        id="nombre-localidad" // Cambiado para evitar conflicto si tienes otro 'nombre' en la página
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="departamento-localidad">Departamento:</label>
                    <input
                        type="text"
                        id="departamento-localidad"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="direccion-localidad">Dirección:</label>
                    <input
                        type="text"
                        id="direccion-localidad"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear Localidad'}
                </button>
            </form>
        </div>
    );
};

export default VendedorAltaLocalidadPage;