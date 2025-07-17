import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Buscar viajes por ómnibus e intervalo de fechas', async ({ page }) => {
    const email = 'prueba@p';
    const password = '323232';

    // 1. Login
    await login(page, email, password);

    // 2. Ir a "Listado de viajes por ómnibus"
    await page.click('a.nav-link:has-text("Listado de viajes por ómnibus")');
    await expect(page).toHaveURL(/.*listar-viajes/);

    // 3. Seleccionar ómnibus ID 45
    const select = page.locator('#omnibus-select');
    await expect(select).toBeVisible();
    await select.selectOption('45');

    // 4. Completar fechas desde/hasta
    const today = new Date();

    const formatDate = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const fechaDesde = new Date(today);
    fechaDesde.setMonth(fechaDesde.getMonth() - 1);

    const fechaHasta = new Date(today);
    fechaHasta.setMonth(fechaHasta.getMonth() + 1);

    await page.fill('#fechaDesde', formatDate(fechaDesde));
    await page.fill('#fechaHasta', formatDate(fechaHasta));

    // 5. Buscar viajes
    await page.click('button.buscar-btn');

    // 6. Esperar la tabla y verificar que haya al menos un resultado
    const filasTabla = page.locator('table.viajes-tabla tbody tr');
    await expect(filasTabla.first()).toBeVisible({ timeout: 5000 });

    // Opcional: imprimir cuántos resultados encontró
    const count = await filasTabla.count();
    console.log(`Se encontraron ${count} viaje(s) en la tabla`);

    await page.waitForTimeout(2000);
});
