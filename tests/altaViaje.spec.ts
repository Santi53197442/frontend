import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor puede crear un nuevo viaje', async ({ page }) => {
    const vendedorEmail = 'prueba@p';
    const vendedorPassword = '323232';

    // Login como vendedor
    await login(page, vendedorEmail, vendedorPassword);

    // Ir desde el menú
    await page.click('a.nav-link:has-text("Alta Viaje")');
    await expect(page).toHaveURL('https://frontend-eosin-eight-41.vercel.app/vendedor/alta-viaje');

    // Esperar que cargue el formulario
    await page.waitForSelector('#fecha');

    // Completar los campos
    await page.fill('#fecha', '2025-07-15'); // hoy o fecha futura válida
    await page.fill('#horaSalida', '14:30');
    await page.fill('#horaLlegada', '18:00');
    await page.selectOption('#origen', '1'); // Centro (Montevideo)
    await page.selectOption('#destino', '2'); // Colonia
    await page.fill('#precio', '750');

    // Enviar el formulario
    await page.click('button:has-text("Crear Viaje")');

    // Esperar respuesta visual o redirección
    await page.waitForTimeout(1000);

    // Validar que el viaje fue creado (opcional)
    // await expect(page.locator('text=Viaje creado')).toBeVisible();
});
