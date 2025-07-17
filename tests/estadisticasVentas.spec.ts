import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Estadísticas de Ventas', async ({ page }) => {
    await login(page, 'prueba@p', '323232');

    await page.click('span:has-text("Estadísticas de ventas")');

    // Verificar datos principales
    await expect(page.locator('.stat-card:has-text("Ingresos Totales")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Pasajes Vendidos")')).toBeVisible();
    await expect(page.locator('.stat-card:has-text("Precio Promedio")')).toBeVisible();

    // Verificar gráficos
    await expect(page.locator('#pasajes-charts-section canvas')).toHaveCount(2);
    await expect(page.locator('#pasajes-top-routes-chart canvas')).toBeVisible();
});
