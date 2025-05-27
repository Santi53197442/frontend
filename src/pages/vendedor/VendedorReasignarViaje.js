// ./pages/vendedor/ReasignarViajeRow.jsx

import React, { useState } from 'react';
import { reasignarViaje } from '../../services/api'; // Ajusta la ruta a tu apiService

// Asumiendo que esta fila recibe un 'viaje' como prop
const VendedorReasignarViaje = ({ viaje, onReasignacionExitosa, onReasignacionError }) => {
    const [nuevoOmnibusId, setNuevoOmnibusId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleReasignar = async () => {
        if (!nuevoOmnibusId) {
            setError("Por favor, ingrese el ID del nuevo ómnibus.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
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
            setNuevoOmnibusId(''); // Limpiar input
        }
    };

    return (
        <div className="reasignar-viaje">
            {/* Muestra info del viaje si es necesario */}
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

export default VendedorReasignarViaje; // <- Exportación por defecto
