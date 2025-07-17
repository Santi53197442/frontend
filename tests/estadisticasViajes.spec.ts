import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Estadísticas de Viajes', async ({ page }) => {
    await login(page, 'prueba@p', '323232');

    await page.click('span:has-text("Estadísticas de viajes")');

    // Verificar datos principales
    await expect(page.locator('.stat-card:has-text("Total de Viajes")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Precio Promedio")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Viaje más Caro")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Viaje más Barato")')).toBeVisible();

    // Verificar gráficos
    await expect(page.locator('#pie-chart-container canvas')).toBeVisible();
    await expect(page.locator('#bar-chart-container canvas')).toBeVisible();
});
