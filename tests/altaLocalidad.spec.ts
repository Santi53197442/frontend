import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor puede crear una nueva localidad', async ({ page }) => {
    const vendedorEmail = 'prueba@p';
    const vendedorPassword = '323232';

    // Logear como vendedor
    await login(page, vendedorEmail, vendedorPassword);
    console.log('URL actual:', page.url());
    // Ir a la página de alta de localidad
    //await page.goto('https://frontend-eosin-eight-41.vercel.app/vendedor/alta-localidad');

    await page.click('a.nav-link:has-text("Alta de Localidad")');
    console.log('URL actual:', page.url());

    // Completar formulario
    const timestamp = Date.now();
    await page.fill('#nombre-localidad', `Localidad Test ${timestamp}`);
    console.log('URL actual:', timestamp);
    await page.fill('#departamento-localidad', 'Montevideo');
    await page.fill('#direccion-localidad', 'Av. Principal 1234');

    // Enviar
    await page.click('button:has-text("Crear Localidad")');

    // Esperar resultado o validación visual
    await page.waitForTimeout(1000);
});
