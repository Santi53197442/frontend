// src/pages/vendedor/VendedorAltaOmnibusPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendedorAltaOmnibusPage.css'; // Asegúrate de crear este archivo CSS
import { crearOmnibus, obtenerTodasLasLocalidades } from '../../services/api'; // Verifica rutas

// Define los posibles estados del bus, deben coincidir con tu Enum EstadoBus en el backend
const ESTADOS_BUS = [
    { value: 'OPERATIVO', label: 'Operativo' },
    { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento' },
    { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio' },
    { value: 'ASIGNADO_A_VIAJE', label: 'Asignado a Viaje' },
    { value: 'INACTIVO', label: 'Inactivo' },
];

// Constantes de validación
const MATRICULA_MIN_LENGTH = 6;
const MATRICULA_MAX_LENGTH = 10;
const CAPACIDAD_MIN = 40;
const CAPACIDAD_MAX = 65;

const VendedorAltaOmnibusPage = () => {
    const [formData, setFormData] = useState({
        matricula: '',
        marca: '',
        modelo: '',
        capacidadAsientos: '',
        estado: ESTADOS_BUS[0].value, // Estado inicial por defecto
        localidadActualId: '',
    });

    const [formErrors, setFormErrors] = useState({}); // Estado para errores de campo específicos
    const [localidades, setLocalidades] = useState([]); // Para el dropdown de localidades
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(''); // Para errores generales del submit
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Cargar localidades cuando el componente se monta
        const fetchLocalidades = async () => {
            setIsLoading(true); // Indicar que se están cargando localidades
            try {
                const response = await obtenerTodasLasLocalidades(); // Usa tu función real
                if (response && response.data) {
                    setLocalidades(response.data);
                    if (response.data.length > 0 && !formData.localidadActualId) {
                        // Seleccionar la primera localidad por defecto si no hay una ya seleccionada
                        setFormData(prev => ({ ...prev, localidadActualId: response.data[0].id.toString() }));
                    }
                }
            } catch (err) {
                console.error("Error al cargar localidades:", err);
                setSubmitError("No se pudieron cargar las localidades para seleccionar. Intenta recargar la página.");
            } finally {
                setIsLoading(false); // Terminar la carga de localidades
            }
        };
        fetchLocalidades();
    }, []); // El array de dependencias vacío asegura que solo se ejecute al montar

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        if (name === "matricula") {
            processedValue = value.toUpperCase(); // Convertir matrícula a mayúsculas
        }
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        // Limpiar error específico del campo al cambiarlo
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
        // También limpiar el error general de submit si el usuario empieza a corregir
        if (submitError) setSubmitError('');
    };

    const validateForm = () => {
        const errors = {};
        const { matricula, marca, modelo, capacidadAsientos, estado, localidadActualId } = formData;

        // Validación de Matrícula
        if (!matricula.trim()) errors.matricula = 'La matrícula es obligatoria.';
        else if (matricula.trim().length < MATRICULA_MIN_LENGTH || matricula.trim().length > MATRICULA_MAX_LENGTH) {
            errors.matricula = `La matrícula debe tener entre ${MATRICULA_MIN_LENGTH} y ${MATRICULA_MAX_LENGTH} caracteres.`;
        }

        // Validación de Marca
        if (!marca.trim()) errors.marca = 'La marca es obligatoria.';

        // Validación de Modelo
        if (!modelo.trim()) errors.modelo = 'El modelo es obligatorio.';

        // Validación de Capacidad de Asientos
        if (!capacidadAsientos) { // Verifica si el string está vacío
            errors.capacidadAsientos = 'La capacidad es obligatoria.';
        } else {
            const capacidadNum = parseInt(capacidadAsientos, 10); // Especificar base 10
            if (isNaN(capacidadNum)) {
                errors.capacidadAsientos = 'La capacidad debe ser un número.';
            } else if (capacidadNum < CAPACIDAD_MIN || capacidadNum > CAPACIDAD_MAX) {
                errors.capacidadAsientos = `La capacidad debe estar entre ${CAPACIDAD_MIN} y ${CAPACIDAD_MAX}.`;
            }
        }

        // Validación de Estado
        if (!estado) errors.estado = 'El estado es obligatorio.'; // Aunque tiene valor por defecto, es bueno tenerlo

        // Validación de Localidad Actual
        if (!localidadActualId) errors.localidadActualId = 'La localidad es obligatoria.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Retorna true si no hay errores
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(''); // Limpiar error de submit previo
        setSuccess('');     // Limpiar mensaje de éxito previo

        if (!validateForm()) {
            setSubmitError("Por favor, corrige los errores resaltados en el formulario.");
            return;
        }

        setIsLoading(true);

        try {
            // Asegurarse de que los IDs y números se envíen como números
            const omnibusDataToSend = {
                matricula: formData.matricula.trim(),
                marca: formData.marca.trim(),
                modelo: formData.modelo.trim(),
                capacidadAsientos: parseInt(formData.capacidadAsientos, 10),
                estado: formData.estado,
                localidadActualId: parseInt(formData.localidadActualId, 10)
            };

            const response = await crearOmnibus(omnibusDataToSend);

            if (response && response.data && response.status === 201) {
                setSuccess(`Ómnibus con matrícula "${response.data.matricula}" creado con éxito.`);
                // Limpiar formulario a sus valores iniciales
                setFormData({
                    matricula: '',
                    marca: '',
                    modelo: '',
                    capacidadAsientos: '',
                    estado: ESTADOS_BUS[0].value,
                    localidadActualId: localidades.length > 0 ? localidades[0].id.toString() : '',
                });
                setFormErrors({}); // Limpiar también los errores de campo individuales
            } else {
                // Esto cubre casos donde la API devuelve un status != 201 pero no es un error capturado por el catch
                setSubmitError(response?.data?.message || 'Respuesta inesperada del servidor al crear el ómnibus.');
            }
        } catch (err) {
            let errorMessage = 'Error al crear el ómnibus. Inténtalo de nuevo.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message; // Mensaje de error específico del backend
            } else if (err.message) {
                errorMessage = err.message; // Error de red u otro error de JS
            }
            setSubmitError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="alta-omnibus-page-container">
            <div className="form-card">
                <h2 className="form-title">Alta de Nuevo Ómnibus</h2>

                {/* Mensaje general de error de submit */}
                {submitError && <div className="message error-message" role="alert">{submitError}</div>}
                {success && <div className="message success-message" role="alert">{success}</div>}

                <form onSubmit={handleSubmit} className="alta-omnibus-form" noValidate> {/* noValidate para usar nuestras validaciones */}
                    <div className="form-group">
                        <label htmlFor="matricula">Matrícula:</label>
                        <input
                            type="text"
                            id="matricula"
                            name="matricula"
                            value={formData.matricula}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ej: SAB1234"
                            // minLength y maxLength son más para UX, la validación JS es la principal
                            // required // El required de JS es más robusto
                        />
                        {formErrors.matricula && <small className="field-error-message">{formErrors.matricula}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="marca">Marca:</label>
                        <input type="text" id="marca" name="marca" value={formData.marca} onChange={handleChange} disabled={isLoading} placeholder="Ej: Mercedes-Benz, Volvo" />
                        {formErrors.marca && <small className="field-error-message">{formErrors.marca}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="modelo">Modelo:</label>
                        <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} disabled={isLoading} placeholder="Ej: Marcopolo G7, Irizar i6" />
                        {formErrors.modelo && <small className="field-error-message">{formErrors.modelo}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="capacidadAsientos">Capacidad de Asientos ({CAPACIDAD_MIN}-{CAPACIDAD_MAX}):</label>
                        <input
                            type="number"
                            id="capacidadAsientos"
                            name="capacidadAsientos"
                            value={formData.capacidadAsientos}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder={`Entre ${CAPACIDAD_MIN} y ${CAPACIDAD_MAX}`}
                            // min={CAPACIDAD_MIN} // Estos son más para la UX del input number
                            // max={CAPACIDAD_MAX}
                        />
                        {formErrors.capacidadAsientos && <small className="field-error-message">{formErrors.capacidadAsientos}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="estado">Estado:</label>
                        <select id="estado" name="estado" value={formData.estado} onChange={handleChange} disabled={isLoading}>
                            {ESTADOS_BUS.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                        {formErrors.estado && <small className="field-error-message">{formErrors.estado}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="localidadActualId">Localidad Actual:</label>
                        <select
                            id="localidadActualId"
                            name="localidadActualId"
                            value={formData.localidadActualId}
                            onChange={handleChange}
                            disabled={isLoading || localidades.length === 0}
                        >
                            <option value="" disabled={formData.localidadActualId !== ""}>
                                {localidades.length === 0 && !isLoading ? "No hay localidades disponibles" : "Seleccione una localidad..."}
                            </option>
                            {localidades.map(loc => (
                                <option key={loc.id} value={loc.id.toString()}>{loc.nombre} - {loc.departamento}</option>
                            ))}
                        </select>
                        {localidades.length === 0 && isLoading && <small className="text-muted">Cargando localidades...</small>}
                        {formErrors.localidadActualId && <small className="field-error-message">{formErrors.localidadActualId}</small>}
                    </div>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? <><span className="spinner" /> Creando...</> : 'Crear Ómnibus'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VendedorAltaOmnibusPage;