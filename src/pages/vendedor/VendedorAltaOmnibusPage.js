// src/pages/vendedor/VendedorAltaOmnibusPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendedorAltaOmnibusPage.css';
import { crearOmnibus, obtenerTodasLasLocalidades } from '../../services/api';

const ESTADOS_BUS = [
    { value: 'OPERATIVO', label: 'Operativo' },
    { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento' },
    { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio' },
    { value: 'ASIGNADO_A_VIAJE', label: 'Asignado a Viaje' },
];

const MATRICULA_MIN_LENGTH = 6;
const MATRICULA_MAX_LENGTH = 10;

const VendedorAltaOmnibusPage = () => {
    const [formData, setFormData] = useState({
        matricula: '',
        marca: '',
        modelo: '',
        capacidadAsientos: '',
        estado: ESTADOS_BUS[0].value,
        localidadActualId: '',
    });

    const [formErrors, setFormErrors] = useState({}); // Estado para errores de campo específicos
    const [localidades, setLocalidades] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(''); // Para errores generales del submit
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await obtenerTodasLasLocalidades();
                if (response && response.data) {
                    setLocalidades(response.data);
                    if (response.data.length > 0 && !formData.localidadActualId) { // Solo si no hay una ya seleccionada
                        setFormData(prev => ({ ...prev, localidadActualId: response.data[0].id.toString() }));
                    }
                }
            } catch (err) {
                console.error("Error al cargar localidades:", err);
                setSubmitError("No se pudieron cargar las localidades para seleccionar.");
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
    };

    const validateForm = () => {
        const errors = {};
        const { matricula, marca, modelo, capacidadAsientos, estado, localidadActualId } = formData;

        if (!matricula.trim()) errors.matricula = 'La matrícula es obligatoria.';
        else if (matricula.trim().length < MATRICULA_MIN_LENGTH || matricula.trim().length > MATRICULA_MAX_LENGTH) {
            errors.matricula = `La matrícula debe tener entre ${MATRICULA_MIN_LENGTH} y ${MATRICULA_MAX_LENGTH} caracteres.`;
        }

        if (!marca.trim()) errors.marca = 'La marca es obligatoria.';
        if (!modelo.trim()) errors.modelo = 'El modelo es obligatorio.';
        if (!capacidadAsientos) errors.capacidadAsientos = 'La capacidad es obligatoria.';
        else if (isNaN(parseInt(capacidadAsientos)) || parseInt(capacidadAsientos) <= 0) {
            errors.capacidadAsientos = 'La capacidad debe ser un número positivo.';
        }
        if (!estado) errors.estado = 'El estado es obligatorio.';
        if (!localidadActualId) errors.localidadActualId = 'La localidad es obligatoria.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Retorna true si no hay errores
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSuccess('');

        if (!validateForm()) {
            setSubmitError("Por favor, corrige los errores en el formulario.");
            return;
        }

        setIsLoading(true);

        try {
            const omnibusDataToSend = {
                ...formData,
                capacidadAsientos: parseInt(formData.capacidadAsientos),
                localidadActualId: parseInt(formData.localidadActualId)
            };

            const response = await crearOmnibus(omnibusDataToSend);

            if (response && response.data && response.status === 201) {
                setSuccess(`Ómnibus con matrícula "${response.data.matricula}" creado con éxito.`);
                setFormData({ // Limpiar formulario
                    matricula: '',
                    marca: '',
                    modelo: '',
                    capacidadAsientos: '',
                    estado: ESTADOS_BUS[0].value,
                    localidadActualId: localidades.length > 0 ? localidades[0].id.toString() : '',
                });
                setFormErrors({});
            } else {
                setSubmitError(response?.data?.message || 'Respuesta inesperada del servidor.');
            }
        } catch (err) {
            let errorMessage = 'Error al crear el ómnibus.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
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

                {submitError && <div className="message error-message" role="alert">{submitError}</div>}
                {success && <div className="message success-message" role="alert">{success}</div>}

                <form onSubmit={handleSubmit} className="alta-omnibus-form">
                    <div className="form-group">
                        <label htmlFor="matricula">Matrícula:</label>
                        <input
                            type="text"
                            id="matricula"
                            name="matricula" // Añadido name para el handleChange
                            value={formData.matricula}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ej: SAB1234"
                            minLength={MATRICULA_MIN_LENGTH} // Atributo HTML5 para validación básica
                            maxLength={MATRICULA_MAX_LENGTH} // Atributo HTML5
                            required
                        />
                        {formErrors.matricula && <small className="field-error-message">{formErrors.matricula}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="marca">Marca:</label>
                        <input type="text" id="marca" name="marca" value={formData.marca} onChange={handleChange} disabled={isLoading} placeholder="Ej: Mercedes-Benz, Volvo" required />
                        {formErrors.marca && <small className="field-error-message">{formErrors.marca}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="modelo">Modelo:</label>
                        <input type="text" id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} disabled={isLoading} placeholder="Ej: Marcopolo G7, Irizar i6" required />
                        {formErrors.modelo && <small className="field-error-message">{formErrors.modelo}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="capacidadAsientos">Capacidad de Asientos:</label>
                        <input type="number" id="capacidadAsientos" name="capacidadAsientos" value={formData.capacidadAsientos} onChange={handleChange} disabled={isLoading} placeholder="Ej: 44" min="1" required />
                        {formErrors.capacidadAsientos && <small className="field-error-message">{formErrors.capacidadAsientos}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="estado">Estado:</label>
                        <select id="estado" name="estado" value={formData.estado} onChange={handleChange} disabled={isLoading} required>
                            {ESTADOS_BUS.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                        {formErrors.estado && <small className="field-error-message">{formErrors.estado}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="localidadActualId">Localidad Actual:</label>
                        <select id="localidadActualId" name="localidadActualId" value={formData.localidadActualId} onChange={handleChange} disabled={isLoading || localidades.length === 0} required>
                            <option value="" disabled={formData.localidadActualId !== ""}>Seleccione una localidad...</option>
                            {localidades.map(loc => (
                                <option key={loc.id} value={loc.id.toString()}>{loc.nombre} - {loc.departamento}</option>
                            ))}
                        </select>
                        {localidades.length === 0 && !isLoading && <small className="text-muted">Cargando localidades o no hay disponibles...</small>}
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