import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Usuario puede cambiar su contraseña', async ({ page }) => {
    const email = 'testuser_1752534078656@example.com';
    const currentPassword = 'Test1234!';
    const newPassword = 'Test1234!';

    // Login con el usuario actual
    await login(page, email, currentPassword);

    // Abrir menú desplegable
    const menuToggle = page.locator('span.arrow.down');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    // Ir a "Cambiar contraseña"
    const cambiarLink = page.locator('a[href="/cambiar-contraseña"]');
    await expect(cambiarLink).toBeVisible();
    await cambiarLink.click();

    // Completar formulario
    await page.fill('#currentPassword', currentPassword);
    await page.fill('#newPassword', newPassword);
    await page.fill('#confirmNewPassword', newPassword);

    // Enviar formulario
    await page.click('button:has-text("Cambiar Contraseña")');

    // Validar posible redirección o mensaje de éxito
    await page.waitForTimeout(1000); // Ajustable si hay notificación visual
    await expect(page).not.toHaveURL(/cambiar-contraseña/); // Alternativa: buscar un mensaje de éxito
});
