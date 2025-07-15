// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    workers: 1,
    use: {
        headless: false,
        baseURL: 'https://frontend-eosin-eight-41.vercel.app',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },
});
