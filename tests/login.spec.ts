import { test, expect } from '@playwright/test';
import fs = require('fs');
import path = require('path');

const filePath = path.resolve(__dirname, './data/test-user.json');

test('El usuario puede iniciar sesión con datos registrados previamente', async ({ page }) => {
    const { email, password } = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    await page.goto('https://frontend-eosin-eight-41.vercel.app/login');

    // ✅ Cambiados los selectores
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button:has-text("Iniciar Sesión")');

    // Verifica que redirige a la página de inicio
    await expect(page).toHaveURL('https://frontend-eosin-eight-41.vercel.app/');
});
