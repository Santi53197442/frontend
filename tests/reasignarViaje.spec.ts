import { test, expect } from '@playwright/test';
import { login } from './helper';

test('Vendedor puede reasignar un viaje a otro ómnibus', async ({ page }) => {
    const vendedorEmail = 'prueba@p';
    const vendedorPassword = '323232';

    // Login como vendedor
    await login(page, vendedorEmail, vendedorPassword);

    // Navegar a Reasignar Viaje
    await page.click('a.nav-link:has-text("Reasignar Viaje")');
    await expect(page).toHaveURL('https://frontend-eosin-eight-41.vercel.app/vendedor/reasignar-viaje');

    // Esperar que el select de viajes esté habilitado
    await page.waitForSelector('#viaje');
    await page.waitForFunction(() => {
        const select = document.querySelector('#viaje') as HTMLSelectElement;
        return select && !select.disabled;
    });

    // Obtener la primera opción de viaje disponible
    const viajeOptions = await page.$$eval('#viaje option', options =>
        options
            .map(opt => {
                const option = opt as HTMLOptionElement;
                return { value: option.value, label: option.textContent };
            })
            .filter(opt => opt.value !== '')
    );

    if (viajeOptions.length === 0) {
        throw new Error('⚠️ No hay viajes disponibles para reasignar.');
    }

    const viajeId = viajeOptions[0].value!;
    await page.selectOption('#viaje', viajeId);

    // Esperar que el select de ómnibus esté habilitado
    await page.waitForFunction(() => {
        const select = document.querySelector('#omnibus') as HTMLSelectElement;
        return select && !select.disabled;
    });

    // Obtener la primera opción de ómnibus disponible
    const omnibusOptions = await page.$$eval('#omnibus option', options =>
        options
            .map(opt => {
                const option = opt as HTMLOptionElement;
                return { value: option.value, label: option.textContent };
            })
            .filter(opt => opt.value !== '')
    );

    if (omnibusOptions.length === 0) {
        throw new Error('⚠️ No hay ómnibus disponibles para la reasignación.');
    }

    const omnibusId = omnibusOptions[0].value!;
    await page.selectOption('#omnibus', omnibusId);

    // Confirmar la reasignación
    const confirmButton = page.locator('button:has-text("Confirmar Reasignación")');
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // Validación visual o espera final
    await page.waitForTimeout(1000);
    // await expect(page.locator('text=Viaje reasignado correctamente')).toBeVisible();
});
