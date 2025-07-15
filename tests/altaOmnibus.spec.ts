import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor puede crear un nuevo ómnibus', async ({ page }) => {
    const vendedorEmail = 'prueba@p';
    const vendedorPassword = '323232';

    // Login como vendedor
    await login(page, vendedorEmail, vendedorPassword);

    // Hacer clic en "Alta de Ómnibus"
    await page.click('a.nav-link:has-text("Alta de Ómnibus")');
    await expect(page).toHaveURL('https://frontend-eosin-eight-41.vercel.app/vendedor/alta-omnibus');

    // Esperar que cargue el formulario
    await page.waitForSelector('#matricula');

    // Completar formulario
    const timestamp = Date.now();
    await page.fill('#matricula', `SB${timestamp.toString().slice(-4)}`); // ej: SB7676
    await page.fill('#marca', 'Mercedes-Benz');
    await page.fill('#modelo', 'Marcopolo G7');
    await page.fill('#capacidadAsientos', '55');
    await page.selectOption('#estado', 'OPERATIVO'); // valor del <option>
    await page.selectOption('#localidadActualId', '1'); // ejemplo: Centro - Montevideo

    // Enviar el formulario
    await page.click('button:has-text("Crear Ómnibus")');

    // Esperar resultado (ajustá si hay redirección o mensaje visible)
    await page.waitForTimeout(1000);

    // Ejemplo de verificación (si redirige o muestra algo)
    // await expect(page.locator('text=Ómnibus creado')).toBeVisible();
});
