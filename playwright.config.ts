import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take a screenshot when a test fails */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Désactiver Firefox et WebKit pour l'instant (nécessitent l'installation des navigateurs)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.platform === 'win32' 
      ? 'set NEXT_DISABLE_TURBOPACK=1&& next dev'
      : 'NEXT_DISABLE_TURBOPACK=1 next dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // --- Clés Publiques (Next.js les lira) ---
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',

      // --- Clés Secrètes (Le serveur Next.js en a besoin) ---
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN || '',
      REPLICATE_MODEL_VERSION: process.env.REPLICATE_MODEL_VERSION || '',
      REPLICATE_INPAINTING_MODEL_VERSION: process.env.REPLICATE_INPAINTING_MODEL_VERSION || '',
      STRIPE_PRICE_10_EUR: process.env.STRIPE_PRICE_10_EUR || '',
      STRIPE_PRICE_29_EUR: process.env.STRIPE_PRICE_29_EUR || '',
      STRIPE_ESSENTIAL_MONTHLY_PRICE_ID: process.env.STRIPE_ESSENTIAL_MONTHLY_PRICE_ID || '',
      STRIPE_ESSENTIAL_YEARLY_PRICE_ID: process.env.STRIPE_ESSENTIAL_YEARLY_PRICE_ID || '',
      STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
      
      // Mode mock Replicate pour les tests
      REPLICATE_MOCK_MODE: 'true',
      
      // Environnement
      NODE_ENV: process.env.NODE_ENV || 'development',
    } as Record<string, string>,
  },
});


