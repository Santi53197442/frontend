import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor - Venta de pasaje completa', async ({ page }) => {
    const email = 'prueba@p';
    const password = '323232';
    const ci = '17525340';

    // 1. Login
    await login(page, email, password);

    // 2. Ir a "Comprar pasaje"
    await page.click('a.nav-link:has-text("Comprar pasaje")');
    await expect(page).toHaveURL(/.*listar-viajes-compra/);

    // 3. Seleccionar primer viaje disponible
    const btnSeleccionar = page.locator('button.btn-comprar').first();
    await expect(btnSeleccionar).toBeVisible();
    await btnSeleccionar.click();

    // 4. Seleccionar primer asiento libre
    const asientoLibre = page.locator('button.asiento-btn.libre:not([disabled])').first();
    await expect(asientoLibre).toBeVisible();
    await asientoLibre.click();

    // 5. Continuar al checkout
    const continuarBtn = page.locator('button.sp-btn-continuar');
    await expect(continuarBtn).toBeEnabled();
    await continuarBtn.click();
    await expect(page).toHaveURL(/.*checkout.*/);

    // 6. Ingresar CI del cliente
    const ciInput = page.locator('#ci-cliente');
    await ciInput.fill(ci);

    const buscarBtn = page.locator('button:has-text("Buscar Cliente")');
    await expect(buscarBtn).toBeEnabled();
    await buscarBtn.click();

    // 7. Confirmar y pagar
    const pagarBtn = page.locator('button.btn-checkout-pagar');
    await expect(pagarBtn).toBeVisible();
    await expect(pagarBtn).toBeEnabled();
    await pagarBtn.click();

    // 8. Confirmar resultado (mensaje o redirección)
    await page.waitForTimeout(5000); // opcional, podés reemplazar con algo como:
    // await expect(page.locator('text=Compra realizada')).toBeVisible();
});
