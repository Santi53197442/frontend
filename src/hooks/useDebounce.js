// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

// Este hook toma un valor y un delay (tiempo de espera en ms)
function useDebounce(value, delay) {
    // Estado para guardar el valor "debounced" (el que se usará para la API)
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Configura un temporizador que actualizará el estado después del delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Función de limpieza: se ejecuta si el valor cambia antes de que termine el delay
        // o cuando el componente se desmonta. Esto cancela el temporizador pendiente.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

    return debouncedValue;
}

export default useDebounce;