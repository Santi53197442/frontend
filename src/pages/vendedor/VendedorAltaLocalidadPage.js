// src/pages/vendedor/VendedorAltaLocalidadPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendedorAltaLocalidadPage.css'; // Asegúrate de crear y descomentar este archivo CSS
import { crearLocalidad } from '../../services/api';

const VendedorAltaLocalidadPage = () => {
    const [nombre, setNombre] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [direccion, setDireccion] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            const response = await crearLocalidad(localidadData);

            if (response && response.data && response.status === 201) {
                setSuccess(`Localidad "${response.data.nombre}" creada con éxito (ID: ${response.data.id}).`);
                setNombre('');
                setDepartamento('');
                setDireccion('');
                // setTimeout(() => navigate('/vendedor/dashboard'), 2000);
            } else {
                setError(response?.data?.message || 'Respuesta inesperada del servidor.');
                console.error("Respuesta inesperada:", response);
            }
        } catch (err) {
            console.error("Error en handleSubmit:", err);
            let errorMessage = 'Error al crear la localidad.';
            if (err.response) {
                errorMessage = err.response.data?.message || `Error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'No se pudo conectar con el servidor.';
            } else {
                errorMessage = err.message || 'Ocurrió un error.';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // La clase "vendedor-page-content" ya viene del VendedorLayout si esta página
        // se renderiza dentro del Outlet. No es necesario repetirla aquí a menos
        // que quieras un contenedor interno específico.
        // Usaremos "alta-localidad-page-container" para estilos específicos de esta página.
        <div className="alta-localidad-page-container">
            <div className="form-card"> {/* Contenedor tipo tarjeta para el formulario */}
                <h2 className="form-title">Alta de Nueva Localidad</h2>

                {/* Los mensajes de error y éxito se pueden estilizar globalmente o aquí */}
                {error && <div className="message error-message" role="alert">{error}</div>}
                {success && <div className="message success-message" role="alert">{success}</div>}

                <form onSubmit={handleSubmit} className="alta-localidad-form">
                    <div className="form-group">
                        <label htmlFor="nombre-localidad">Nombre de la Localidad:</label>
                        <input
                            type="text"
                            id="nombre-localidad"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            disabled={isLoading}
                            placeholder="Ej: Centro, Pocitos"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="departamento-localidad">Departamento:</label>
                        <input
                            type="text"
                            id="departamento-localidad"
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            disabled={isLoading}
                            placeholder="Ej: Montevideo, Canelones"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion-localidad">Dirección (referencia opcional):</label>
                        <input
                            type="text"
                            id="direccion-localidad"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            disabled={isLoading}
                            placeholder="Ej: Av. Principal 1234 esq. Secundaria"
                            required // Lo mantuve como required, puedes cambiarlo
                        />
                        {/* Si fuera opcional, podrías añadir un texto de ayuda */}
                        {/* <small className="form-text text-muted">Una dirección o punto de referencia principal.</small> */}
                    </div>

                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner" /> Creando...
                            </>
                        ) : (
                            'Crear Localidad'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VendedorAltaLocalidadPage;