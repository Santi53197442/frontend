import { test, expect } from '@playwright/test';
import fs = require('fs');
import path = require('path');

const filePath = path.join(__dirname, './data/test-user.json');

test('Registro de usuario completo', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const password = 'Test1234!';

    await page.goto('https://frontend-eosin-eight-41.vercel.app/register');

    await page.fill('#nombre', 'User');
    await page.fill('#apellido', 'Test');
    await page.fill('#ci', `${timestamp}`.slice(0, 8)); // simula una cédula
    await page.fill('#email', email);
    await page.fill('#contrasenia', password);
    await page.fill('#confirmarContrasenia', password);
    await page.fill('#telefono', '099123456');
    await page.fill('#fechaNac', '1996-01-01');

    await page.click('button[type="submit"]');

    await page.waitForURL('**/login');

    fs.writeFileSync(filePath, JSON.stringify({ email, password }, null, 2));
});
