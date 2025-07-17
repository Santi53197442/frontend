import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Estadísticas de Ómnibus', async ({ page }) => {
    await login(page, 'prueba@p', '323232');

    await page.click('span:has-text("Estadísticas de ómnibus")');

    // Verificar datos principales
    await expect(page.locator('.stat-card:has-text("Total de Ómnibus")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Capacidad Total")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Capacidad Promedio")')).toBeVisible();

    // Verificar gráficos
    await expect(page.locator('#omnibus-pie-chart canvas')).toBeVisible();
    await expect(page.locator('#omnibus-bar-chart canvas')).toBeVisible();
});
