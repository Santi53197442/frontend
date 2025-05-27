// reasignarViaje.js
import { reasignarViaje } from '../../services/api';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reasignarViajeForm');
    const viajeIdInput = document.getElementById('viajeId');
    const omnibusIdInput = document.getElementById('omnibusId');
    const resultadoArea = document.getElementById('resultadoArea');
    const mensajeResultado = document.getElementById('mensajeResultado');
    const datosViajeActualizado = document.getElementById('datosViajeActualizado');
    const submitButton = document.getElementById('submitButton');

    if (!form) {
        console.error("El formulario 'reasignarViajeForm' no se encontró en el DOM.");
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const viajeIdVal = viajeIdInput.value;
        const omnibusIdVal = omnibusIdInput.value;

        // Limpiar resultados anteriores y mostrar "cargando"
        resultadoArea.style.display = 'none';
        resultadoArea.className = 'resultado'; // Reset class
        mensajeResultado.textContent = '';
        datosViajeActualizado.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Reasignando...';

        try {
            // Validar que los campos no estén vacíos (el 'required' del HTML ayuda)
            if (!viajeIdVal.trim() || !omnibusIdVal.trim()) {
                // Esto no debería ocurrir si 'required' está funcionando, pero es una doble verificación.
                throw new Error("Por favor, completa ambos IDs.");
            }

            // La función reasignarViaje ya maneja la conversión a número y validación básica.
            const viajeActualizado = await reasignarViaje(viajeIdVal, omnibusIdVal);

            mensajeResultado.textContent = '¡Viaje reasignado con éxito!';
            datosViajeActualizado.textContent = JSON.stringify(viajeActualizado, null, 2);
            resultadoArea.className = 'resultado success';
            resultadoArea.style.display = 'block';

        } catch (error) {
            mensajeResultado.textContent = `Error al reasignar: ${error.message}`;
            datosViajeActualizado.textContent = '';
            resultadoArea.className = 'resultado error';
            resultadoArea.style.display = 'block';
            console.error("Detalle del error en la UI:", error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Reasignar Viaje';
        }
    });
});