// src/pages/vendedor/VendedorAltaOmnibusPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendedorAltaOmnibusPage.css'; // Crearemos este archivo CSS
import { crearOmnibus, obtenerTodasLasLocalidades } from '../../services/api'; // Verifica rutas

// Define los posibles estados del bus, deben coincidir con tu Enum EstadoBus en el backend
const ESTADOS_BUS = [
    { value: 'OPERATIVO', label: 'Operativo' },
    { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento' },
    { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio' },
    { value: 'ASIGNADO_A_VIAJE', label: 'Asignado a Viaje' },
];

const VendedorAltaOmnibusPage = () => {
    const [matricula, setMatricula] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [capacidadAsientos, setCapacidadAsientos] = useState('');
    const [estado, setEstado] = useState(ESTADOS_BUS[0].value); // Estado inicial por defecto
    const [localidadActualId, setLocalidadActualId] = useState('');

    const [localidades, setLocalidades] = useState([]); // Para el dropdown de localidades
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Cargar localidades cuando el componente se monta
        const fetchLocalidades = async () => {
            try {
                const response = await obtenerTodasLasLocalidades(); // Usa tu función real
                if (response && response.data) {
                    // Asegúrate que response.data sea un array de objetos localidad con 'id' y 'nombre'
                    setLocalidades(response.data);
                    if (response.data.length > 0) {
                        setLocalidadActualId(response.data[0].id.toString()); // Seleccionar la primera por defecto
                    }
                }
            } catch (err) {
                console.error("Error al cargar localidades:", err);
                setError("No se pudieron cargar las localidades para seleccionar.");
            }
        };
        fetchLocalidades();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!matricula.trim() || !marca.trim() || !modelo.trim() || !capacidadAsientos || !estado || !localidadActualId) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        if (isNaN(parseInt(capacidadAsientos)) || parseInt(capacidadAsientos) <= 0) {
            setError('La capacidad de asientos debe ser un número positivo.');
            return;
        }
        setIsLoading(true);

        try {
            const omnibusData = {
                matricula,
                marca,
                modelo,
                capacidadAsientos: parseInt(capacidadAsientos),
                estado,
                localidadActualId: parseInt(localidadActualId)
            };
            const response = await crearOmnibus(omnibusData);

            if (response && response.data && response.status === 201) {
                setSuccess(`Ómnibus con matrícula "${response.data.matricula}" creado con éxito.`);
                // Limpiar formulario
                setMatricula('');
                setMarca('');
                setModelo('');
                setCapacidadAsientos('');
                // setEstado(ESTADOS_BUS[0].value); // O mantener el último seleccionado
                // setLocalidadActualId(localidades.length > 0 ? localidades[0].id.toString() : '');
                // Opcional: Redirigir
                // setTimeout(() => navigate('/vendedor/dashboard'), 2000);
            } else {
                setError(response?.data?.message || 'Respuesta inesperada del servidor.');
            }
        } catch (err) {
            let errorMessage = 'Error al crear el ómnibus.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="alta-omnibus-page-container">
            <div className="form-card">
                <h2 className="form-title">Alta de Nuevo Ómnibus</h2>

                {error && <div className="message error-message" role="alert">{error}</div>}
                {success && <div className="message success-message" role="alert">{success}</div>}

                <form onSubmit={handleSubmit} className="alta-omnibus-form">
                    <div className="form-group">
                        <label htmlFor="matricula">Matrícula:</label>
                        <input type="text" id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value.toUpperCase())} disabled={isLoading} placeholder="Ej: SAB1234" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="marca">Marca:</label>
                        <input type="text" id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} disabled={isLoading} placeholder="Ej: Mercedes-Benz, Volvo" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="modelo">Modelo:</label>
                        <input type="text" id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} disabled={isLoading} placeholder="Ej: Marcopolo G7, Irizar i6" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="capacidadAsientos">Capacidad de Asientos:</label>
                        <input type="number" id="capacidadAsientos" value={capacidadAsientos} onChange={(e) => setCapacidadAsientos(e.target.value)} disabled={isLoading} placeholder="Ej: 44" min="1" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="estado">Estado:</label>
                        <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} disabled={isLoading} required>
                            {ESTADOS_BUS.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="localidadActualId">Localidad Actual:</label>
                        <select id="localidadActualId" value={localidadActualId} onChange={(e) => setLocalidadActualId(e.target.value)} disabled={isLoading || localidades.length === 0} required>
                            <option value="" disabled>Seleccione una localidad...</option>
                            {localidades.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.nombre} - {loc.departamento}</option>
                            ))}
                        </select>
                        {localidades.length === 0 && !isLoading && <small>Cargando localidades o no hay disponibles...</small>}
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