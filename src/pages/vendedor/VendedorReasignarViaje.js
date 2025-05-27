// ./pages/vendedor/VendedorReasignarViaje.jsx // (o la ruta que corresponda)

import React, { useState } from 'react';
import { reasignarViaje } from '../../services/api'; // Asegúrate que la ruta a tu función API sea correcta

const VendedorReasignarViaje = ({ viaje, onReasignacionExitosa, onReasignacionError }) => {
    const [nuevoOmnibusId, setNuevoOmnibusId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- GUARDA ESENCIAL ---
    if (!viaje) {
        // Esto se ejecutará si 'viaje' es undefined, null, false, 0, NaN o ""
        // Para este caso, principalmente nos interesa undefined o null.
        console.warn("VendedorReasignarViaje: La prop 'viaje' es undefined o null.");
        // Decide qué mostrar. Podría ser un loader, un mensaje, o nada (null).
        return <p>Cargando datos del viaje o el viaje no está disponible...</p>;
    }
    // --- FIN DE LA GUARDA ---

    const handleReasignar = async () => {
        if (!nuevoOmnibusId.trim()) { // Añadido .trim() para evitar IDs vacíos con espacios
            setError("Por favor, ingrese el ID del nuevo ómnibus.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            // Ahora es seguro acceder a viaje.id porque la guarda de arriba lo asegura
            const viajeActualizado = await reasignarViaje(viaje.id, nuevoOmnibusId);
            setSuccessMessage(`Viaje ${viaje.id} reasignado al ómnibus ${nuevoOmnibusId} con éxito.`);
            if (onReasignacionExitosa) {
                onReasignacionExitosa(viajeActualizado);
            }
        } catch (err) {
            setError(err.message || "Error al reasignar el viaje.");
            if (onReasignacionError) {
                onReasignacionError(err);
            }
        } finally {
            setIsLoading(false);
            setNuevoOmnibusId('');
        }
    };

    // Gracias a la guarda, aquí 'viaje' NUNCA será undefined
    return (
        <div className="reasignar-viaje">
            <p>Reasignar Viaje ID: {viaje.id} (Origen: {viaje.origen}, Destino: {viaje.destino})</p>
            <input
                type="number"
                value={nuevoOmnibusId}
                onChange={(e) => setNuevoOmnibusId(e.target.value)}
                placeholder="ID Nuevo Ómnibus"
                disabled={isLoading}
            />
            <button onClick={handleReasignar} disabled={isLoading}>
                {isLoading ? 'Reasignando...' : 'Reasignar'}
            </button>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default VendedorReasignarViaje;