import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Editar perfil', async ({ page }) => {
    const email = 'testuser_1752534078656@example.com';
    const password = 'Test1234!';

    // Login
    await login(page, email, password);

    // Abrir el menú desplegable ▼
    await page.locator('span.arrow.down').click();

    // Clic en "Editar perfil"
    await page.locator('a[href="/editar-perfil"]').click();

    // Esperar que la URL sea la esperada
    await page.waitForURL('**/editar-perfil');

    // Verificar que los campos de email y CI estén visibles con los valores correctos
    const emailInput = page.locator('#email');
    const ciInput = page.locator('#ci');
    await expect(emailInput).toHaveValue(email);
    await expect(ciInput).toHaveValue('17525340');

    // Cambiar solo los campos permitidos
    await page.fill('#nombre', 'NuevoNombre');
    await page.fill('#apellido', 'NuevoApellido');
    await page.fill('#telefono', '099999999');
    await page.fill('#fechaNac', '1995-05-05');

    // Enviar formulario
    await page.click('button.submit-button');

    // Esperar alguna validación o redirección
    await page.waitForTimeout(1000);

    // Opcional: verificar que no hay errores y que se quedó en la misma página o volvió al perfil
    await expect(page.locator('.submit-button')).toBeVisible();
});
