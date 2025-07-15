import { Page } from '@playwright/test';
import path = require('path');
import fs = require('fs');

const filePath = path.resolve(__dirname, './data/test-user.json'); // ✅ usar resolve

export function loadTestUser() {
    if (!fs.existsSync(filePath)) {
        throw new Error('No se encontró el usuario de prueba. Ejecutá el test de registro primero.');
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}

export async function login(page: Page, email: string, password: string) {
    await page.goto('https://frontend-eosin-eight-41.vercel.app/login');

    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button:has-text("Iniciar Sesión")');

    // Esperar redirección a inicio o validación visual
    //await page.waitForURL('https://frontend-eosin-eight-41.vercel.app/');

    // Opcional: validar que se muestra algo como "Mi cuenta" o "Cerrar sesión"
    // await expect(page.locator('text=Cerrar sesión')).toBeVisible();
}
