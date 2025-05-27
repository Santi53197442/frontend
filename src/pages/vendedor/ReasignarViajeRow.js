// src/components/viajes/ReasignarViajeRow.jsx
import { useState } from 'react';
import PropTypes from 'prop-types'; // Importar PropTypes
import { reasignarViaje } from '../../services/api'; // ajusta tu alias/ruta
import { toast } from 'react-toastify';

export default function ReasignarViajeRow({
                                              viaje,
                                              omnibusDisponibles, // array de ómnibus operativos
                                              onSuccess, // callback cuando la reasignación OK
                                          }) {
    // El valor de un select es string, mantenemos nuevoBusId como string.
    // Se convertirá a Number antes de la llamada a la API.
    const [nuevoBusId, setNuevoBusId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReasignar = async () => {
        if (!nuevoBusId) { // Si es string vacío, no hacer nada
            toast.warn('Por favor, selecciona un nuevo ómnibus.');
            return;
        }
        setError('');
        try {
            setLoading(true);
            // Convertir a Number justo antes de la llamada
            const { data } = await reasignarViaje(viaje.id, Number(nuevoBusId));
            toast.success('Viaje reasignado ✔️');
            onSuccess?.(data); // notifica al padre si la función existe
            setNuevoBusId(''); // Opcional: Resetear el select después de una reasignación exitosa
        } catch (err) {
            const msg = err.response?.data?.message || 'Error inesperado al reasignar';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Asegurarse de que omnibusDisponibles es un array para evitar errores con .filter
    const busesFiltrados = (omnibusDisponibles || [])
        .filter(o => o.id !== viaje.busAsignadoId); // evita mismo bus

    return (
        <tr>
            <td>{viaje.id}</td>
            <td>{viaje.origenNombre} → {viaje.destinoNombre}</td>
            <td>{viaje.busMatriculaActual || viaje.busMatricula || 'N/A'}</td> {/* Usar una propiedad consistente para la matrícula actual */}
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}> {/* Para mejor alineación */}
                    <select
                        value={nuevoBusId}
                        onChange={e => setNuevoBusId(e.target.value)} // e.target.value es siempre string
                        disabled={loading}
                        aria-label={`Reasignar ómnibus para viaje ${viaje.id}`}
                    >
                        <option value="">-- elegir ómnibus --</option>
                        {busesFiltrados.map(o => (
                            <option key={o.id} value={String(o.id)}> {/* value siempre debe ser string */}
                                {o.matricula} ({o.capacidadAsientos} asientos)
                            </option>
                        ))}
                    </select>

                    <button
                        disabled={!nuevoBusId || loading}
                        onClick={handleReasignar}
                    >
                        {loading ? 'Reasignando…' : 'Reasignar'}
                    </button>
                </div>
                {error && <span style={{ color: 'red', display: 'block', marginTop: '4px' }}>{error}</span>} {/* Estilo básico para error */}
            </td>
        </tr>
    );
}

// Definición de PropTypes
ReasignarViajeRow.propTypes = {
    viaje: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        origenNombre: PropTypes.string.isRequired,
        destinoNombre: PropTypes.string.isRequired,
        busMatricula: PropTypes.string, // Matrícula del bus actualmente asignado
        busMatriculaActual: PropTypes.string, // O usa un nombre consistente
        busAsignadoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // ID del bus actualmente asignado
    }).isRequired,
    omnibusDisponibles: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        matricula: PropTypes.string.isRequired,
        capacidadAsientos: PropTypes.number.isRequired,
    })), // Puede ser null o undefined inicialmente, así que no es .isRequired
    onSuccess: PropTypes.func,
};

// Valores por defecto para props opcionales
ReasignarViajeRow.defaultProps = {
    omnibusDisponibles: [], // Asegurar que sea un array vacío si no se provee
    onSuccess: null,
    viaje: { // Proporcionar defaults para las props de viaje que podrían no estar
        busMatricula: 'N/A',
        busAsignadoId: null,
    }
};