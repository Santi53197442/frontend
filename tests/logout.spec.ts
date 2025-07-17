import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Cerrar sesión correctamente', async ({ page }) => {
    await login(page, 'prueba@p', '323232');

    // Esperar y hacer clic en el ícono del menú (flecha ▼)
    const menuToggle = page.locator('span.arrow.down');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    // Esperar el botón de "Cerrar sesión" y hacer clic
    const logoutBtn = page.locator('button.logout-button');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verificar que redirige al login o landing page
    await expect(page).toHaveURL(/login|frontend-eosin-eight-41\.vercel\.app$/);
});
