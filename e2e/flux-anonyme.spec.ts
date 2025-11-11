import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Chemin vers l'image de test
const TEST_IMAGE_PATH = path.join(__dirname, 'fixtures', 'test-image.jpg');

/**
 * Crée une image de test simple si elle n'existe pas
 */
function ensureTestImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    const fixturesDir = path.dirname(TEST_IMAGE_PATH);
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0xC8,
      0x00, 0xC8, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
      0x4F, 0xFF, 0xD9
    ]);
    fs.writeFileSync(TEST_IMAGE_PATH, jpegHeader);
  }
}

test.beforeAll(() => {
  ensureTestImage();
});

test.describe('Flux 1 : Le Visiteur Anonyme', () => {
  test('Test complet du flux anonyme : 2 générations gratuites puis blocage avec modal', async ({ browser }) => {
    // 1. Ouvrir une nouvelle page en mode "incognito" (new context)
    const context = await browser.newContext({
      // Mode incognito : pas de cookies, pas de localStorage partagé
      storageState: undefined,
    });
    const page = await context.newPage();

    // 2. Naviguer vers la page d'accueil
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Attendre un peu pour que la page se charge complètement
    await page.waitForTimeout(2000);

    // Fermer l'overlay Next.js s'il existe (en cliquant sur le bouton de fermeture ou en appuyant sur Escape)
    try {
      const overlay = page.locator('[data-nextjs-toast]').or(page.locator('nextjs-portal')).first();
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('[TEST] Overlay Next.js détecté, tentative de fermeture...');
        // Essayer de fermer l'overlay en appuyant sur Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Ignorer si l'overlay n'existe pas
    }

    // Vérifier que la page est chargée
    await expect(page.locator('body')).toBeVisible();
    // Le titre peut être dans la nav ou dans le h1 principal
    await expect(page.locator('h1').first()).toBeVisible();

    // 3. Uploader l'image de test
    const fileInput = page.locator('input[type="file"]');
    
    // Vérifier que l'input file existe
    await expect(fileInput.first()).toBeVisible({ timeout: 5000 });
    
    // Uploader l'image de test
    await fileInput.first().setInputFiles(TEST_IMAGE_PATH);
    
    // Attendre que l'aperçu apparaisse (le composant utilise alt="Aperçu")
    await page.waitForSelector('img[alt="Aperçu"]', { timeout: 10000 });
    await expect(page.locator('img[alt="Aperçu"]').first()).toBeVisible();

    // Attendre que l'upload soit terminé
    const successMessage = page.locator('text=/Image chargée avec succès/i');
    const uploadedImage = page.locator('img[alt="Uploadé"]');
    const uploadingSpinner = page.locator('text=/Upload en cours/i');
    
    await Promise.race([
      successMessage.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
      uploadedImage.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null),
      uploadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => null),
    ]);

    // Attendre un peu pour que React mette à jour l'interface
    await page.waitForTimeout(1000);

    // 4. Cliquer sur "Générer"
    // Attendre que l'overlay Next.js disparaisse si présent
    try {
      const overlay = page.locator('nextjs-portal').first();
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('[TEST] Overlay Next.js détecté avant le clic, tentative de fermeture...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Ignorer
    }

    const generateButton = page.locator('button:has-text("Générer")');
    await expect(generateButton).toBeVisible({ timeout: 10000 });
    await expect(generateButton).toBeEnabled({ timeout: 10000 });
    
    // Utiliser JavaScript pour cliquer si l'overlay bloque
    try {
      await generateButton.click({ timeout: 5000 });
    } catch (e) {
      console.log('[TEST] Clic normal échoué, utilisation de JavaScript...');
      // Trouver le bouton par son texte
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const generateBtn = buttons.find(btn => btn.textContent?.includes('Générer'));
        if (generateBtn) {
          (generateBtn as HTMLButtonElement).click();
        } else {
          throw new Error('Bouton "Générer" non trouvé');
        }
      });
      await page.waitForTimeout(500);
    }

    // 5. Attendre que l'image résultat s'affiche
    // La génération peut prendre du temps, attendre soit l'image, soit une erreur
    try {
      await Promise.race([
        page.waitForSelector('img[alt="generated"], img[alt*="générée"]', { timeout: 120000 }).catch(() => null),
        page.waitForSelector('text=/Erreur|erreur|échec/i', { timeout: 120000 }).catch(() => null),
      ]);
      
      // Vérifier s'il y a une erreur
      const errorMessage = page.locator('text=/Erreur|erreur|échec|Unauthorized|401/i');
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasError) {
        const errorText = await errorMessage.textContent();
        // Si l'erreur est "Unauthorized", la fonctionnalité anonyme n'est pas encore implémentée
        if (errorText?.includes('Unauthorized') || errorText?.includes('401')) {
          throw new Error(`La fonctionnalité visiteur anonyme n'est pas encore implémentée. L'API exige une authentification. Erreur: ${errorText}`);
        }
        throw new Error(`Erreur lors de la génération: ${errorText}`);
      }
      
      // Vérifier que l'image est visible
      const generatedImage = page.locator('img[alt="generated"], img[alt*="générée"]');
      await expect(generatedImage.first()).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Si c'est une erreur d'authentification, c'est attendu si la fonctionnalité n'est pas implémentée
      const errorMessage = page.locator('text=/Erreur|erreur|échec|Unauthorized|401/i');
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasError) {
        const errorText = await errorMessage.textContent();
        if (errorText?.includes('Unauthorized') || errorText?.includes('401')) {
          throw new Error(`La fonctionnalité visiteur anonyme n'est pas encore implémentée. L'API exige une authentification. Erreur: ${errorText}`);
        }
      }
      throw error;
    }

    // 6. Vérifier que le compteur visuel affiche "1 génération" (ou "Il vous reste 1 génération")
    const anonymousCounter = page.locator('[data-testid="anonymous-counter-text"]');
    await expect(anonymousCounter).toBeVisible({ timeout: 10000 });
    
    const counterText = await anonymousCounter.textContent();
    expect(counterText).toMatch(/1.*génération|Il vous reste 1/i);

    // 7. Relancer une deuxième génération
    // Attendre que le bouton "Générer" soit à nouveau disponible
    await page.waitForTimeout(2000);
    
    await generateButton.click();

    // Attendre que la deuxième image résultat s'affiche
    try {
      await Promise.race([
        page.waitForSelector('img[alt="generated"], img[alt*="générée"]', { timeout: 120000 }).catch(() => null),
        page.waitForSelector('text=/Erreur|erreur|échec/i', { timeout: 120000 }).catch(() => null),
      ]);
      
      const errorMessage = page.locator('text=/Erreur|erreur|échec/i');
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasError) {
        const errorText = await errorMessage.textContent();
        throw new Error(`Erreur lors de la deuxième génération: ${errorText}`);
      }
      
      const generatedImage = page.locator('img[alt="generated"], img[alt*="générée"]');
      await expect(generatedImage.first()).toBeVisible({ timeout: 5000 });
    } catch (error) {
      throw error;
    }

    // 8. Vérifier que le compteur affiche "0 génération"
    const anonymousCounterAfter = page.locator('[data-testid="anonymous-counter-text"]');
    await expect(anonymousCounterAfter).toBeVisible({ timeout: 10000 });
    
    const counterTextAfter = await anonymousCounterAfter.textContent();
    expect(counterTextAfter).toMatch(/0.*génération|Il vous reste 0/i);

    // 9. Essayer de générer une troisième fois
    await page.waitForTimeout(2000);
    
    // Le bouton devrait être désactivé après 2 générations
    const generateButtonThird = page.locator('button:has-text("Générer")');
    
    // Vérifier que le bouton est désactivé
    await expect(generateButtonThird).toBeDisabled();
    
    // Le modal devrait apparaître automatiquement après la 2ème génération
    // (voir handleGenerate dans page.tsx qui appelle setShowSignupModal après incrémentation)
    // Attendre que le modal apparaisse
    const signupModal = page.locator('[data-testid="signup-modal"]');
    await expect(signupModal).toBeVisible({ timeout: 5000 });
    
    // Vérifier que le modal contient du texte invitant à créer un compte
    const modalText = await signupModal.textContent();
    expect(modalText?.toLowerCase()).toMatch(/compte|inscription|signup|créez|créer/i);

    // Nettoyer
    await context.close();
  });
});


