import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Listado de pasajes vendidos por viaje', async ({ page }) => {
    const email = 'prueba@p';
    const password = '323232';

    // Login
    await login(page, email, password);

    // Ir a "Listado de pasajes vendidos por viaje"
    await page.click('a.nav-link:has-text("Listado de pasajes vendidos por viaje")');
    await expect(page).toHaveURL(/.*pasajes-por-viaje/);

    // Esperar a que cargue el select de viajes
    const selectViaje = page.locator('#viajeSelect');
    await expect(selectViaje).toBeVisible();

    // Obtener la primera opción que tenga texto con "ID:" (y no sea la opción vacía)
    const opciones = selectViaje.locator('option');
    const count = await opciones.count();
    let valorSeleccionado = '';

    for (let i = 0; i < count; i++) {
        const texto = await opciones.nth(i).textContent();
        const valor = await opciones.nth(i).getAttribute('value');
        if (texto?.includes('ID:') && valor) {
            valorSeleccionado = valor;
            break;
        }
    }

    if (!valorSeleccionado) {
        throw new Error('No se encontró una opción válida con "ID:" en el select.');
    }

    console.log(`Seleccionando viaje con ID: ${valorSeleccionado}`);
    await selectViaje.selectOption(valorSeleccionado);

    // Verificar si hay filas en la tabla
    const filas = page.locator('table.tabla-pasajes-vendedor tbody tr');
    await expect(filas.first()).toBeVisible({ timeout: 5000 });

    const cantidadFilas = await filas.count();
    console.log(`✅ Se encontraron ${cantidadFilas} pasaje(s) vendidos para el viaje seleccionado.`);

    await page.waitForTimeout(2000);
});
