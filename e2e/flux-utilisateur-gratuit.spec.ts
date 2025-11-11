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

test.describe('Flux 3 : Utilisateur Gratuit (Découverte)', () => {
  test.setTimeout(120000); // Augmenter le timeout à 2 minutes pour ce test
  
  test('Test complet du flux utilisateur gratuit : Inscription, Génération, Décrémentation des crédits', async ({ browser }) => {
    // 1. Ouvrir une nouvelle page en mode "incognito" (new context)
    const context = await browser.newContext({
      // Mode incognito : pas de cookies, pas de localStorage partagé
      storageState: undefined,
    });
    const page = await context.newPage();

    // Générer un email de test unique
    const testEmail = `test-flux3-${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';

    // ========== ÉTAPE 1 : INSCRIPTION ==========
    // Naviguer vers la page de login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Fermer l'overlay Next.js s'il existe
    try {
      const overlay = page.locator('nextjs-portal').first();
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Ignorer
    }

    // Basculer vers le mode "S'inscrire" si nécessaire
    const toggleButton = page.locator('button:has-text("Pas encore de compte"), button:has-text("Déjà un compte")');
    await expect(toggleButton).toBeVisible({ timeout: 5000 });
    const toggleText = await toggleButton.textContent();
    
    if (toggleText?.includes('Déjà un compte')) {
      // On est déjà en mode inscription
    } else if (toggleText?.includes('Pas encore de compte')) {
      // Utiliser JavaScript pour cliquer si l'overlay bloque
      try {
        await toggleButton.click({ timeout: 5000 });
      } catch (e) {
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const toggleBtn = buttons.find(btn => 
            btn.textContent?.includes('Pas encore de compte') || 
            btn.textContent?.includes('Déjà un compte')
          );
          if (toggleBtn) (toggleBtn as HTMLButtonElement).click();
        });
      }
      await page.waitForTimeout(500);
    }

    // Remplir le formulaire d'inscription
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);

    // Cliquer sur "S'inscrire"
    const signUpButton = page.locator('button:has-text("S\'inscrire")');
    await signUpButton.click();

    // Attendre la redirection vers la page d'accueil
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Attendre que l'authentification soit bien établie
    await page.waitForTimeout(3000);
    
    // Vérifier que l'utilisateur est bien connecté (pas de compteur anonyme)
    const anonymousCounter = page.locator('[data-testid="anonymous-counter-text"]');
    const isCounterVisible = await anonymousCounter.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isCounterVisible).toBe(false);

    // ========== ÉTAPE 2 : VÉRIFIER LE PLAN (Page Compte) ==========
    // Naviguer vers la page compte
    await page.goto('/account');
    await page.waitForLoadState('domcontentloaded');
    
    // Attendre que la page soit complètement chargée et que React ait rendu le contenu
    await page.waitForTimeout(3000);
    
    // Vérifier que la page "Mon Compte" est visible (ou "Non connecté" si l'auth n'a pas fonctionné)
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible({ timeout: 15000 });
    
    // Vérifier le texte du titre
    const titleText = await pageTitle.textContent();
    
    // Si le titre est "Non connecté", l'authentification n'a pas fonctionné
    if (titleText?.includes('Non connecté')) {
      throw new Error('L\'utilisateur n\'est pas connecté après l\'inscription. L\'authentification n\'a pas été persistée.');
    }
    
    // Vérifier que le titre est "Mon Compte"
    expect(titleText).toContain('Mon Compte');
    
    // Le profil n'existe pas encore (il sera créé lors de la première génération)
    // Donc on ne vérifie pas les crédits maintenant, on les vérifiera après la génération
    // Vérifier que le profil n'existe pas encore (message affiché)
    const noProfileMessage = page.locator('text=/profil.*créé.*première.*génération/i');
    const profileExists = await noProfileMessage.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Si le profil existe déjà (créé par l'API ou autre), vérifier les crédits
    // Sinon, on passera à la génération qui créera le profil
    const creditBalance = page.locator('[data-testid="credit-balance"]');
    const creditVisible = await creditBalance.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (creditVisible) {
      // Le profil existe, vérifier qu'il a 5 crédits
      const creditText = await creditBalance.textContent();
      expect(creditText).toBe('5');
      
      // Vérifier que le plan affiché est "Découverte"
      const planName = page.locator('[data-testid="plan-name"]');
      await expect(planName).toBeVisible({ timeout: 15000 });
      const planText = await planName.textContent();
      expect(planText).toContain('Découverte');
    } else {
      // Le profil n'existe pas encore, c'est normal
      // Il sera créé lors de la première génération avec 5 crédits
      console.log('[TEST] Le profil n\'existe pas encore, il sera créé lors de la génération');
    }

    // ========== ÉTAPE 3 : TESTER LA GÉNÉRATION (Redesign) ==========
    // Naviguer vers la page d'accueil
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Fermer l'overlay Next.js s'il existe
    try {
      const overlay = page.locator('nextjs-portal').first();
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Ignorer
    }

    // Uploader l'image de test
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput.first()).toBeVisible({ timeout: 5000 });
    await fileInput.first().setInputFiles(TEST_IMAGE_PATH);
    
    // Attendre que l'aperçu apparaisse (le composant utilise alt="Aperçu")
    await page.waitForSelector('img[alt="Aperçu"]', { timeout: 10000 });
    await expect(page.locator('img[alt="Aperçu"]').first()).toBeVisible();

    // Attendre que l'upload soit terminé
    await page.waitForTimeout(3000);

    // Cliquer sur "Générer"
    // Fermer l'overlay si présent
    try {
      const overlay = page.locator('nextjs-portal').first();
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
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
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const generateBtn = buttons.find(btn => btn.textContent?.includes('Générer'));
        if (generateBtn) (generateBtn as HTMLButtonElement).click();
      });
      await page.waitForTimeout(500);
    }

    // Attendre que l'image résultat s'affiche
    await Promise.race([
      page.waitForSelector('img[alt="generated"], img[alt*="générée"]', { timeout: 120000 }).catch(() => null),
      page.waitForSelector('text=/Erreur|erreur|échec/i', { timeout: 120000 }).catch(() => null),
    ]);
    
    // Vérifier qu'il n'y a pas d'erreur
    const errorMessage = page.locator('text=/Erreur|erreur|échec|Unauthorized|401/i');
    const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasError) {
      const errorText = await errorMessage.textContent();
      throw new Error(`Erreur lors de la génération: ${errorText}`);
    }
    
    // Vérifier que l'image générée est visible
    const generatedImage = page.locator('img[alt="generated"], img[alt*="générée"]');
    await expect(generatedImage.first()).toBeVisible({ timeout: 10000 });

    // Vérifier qu'il n'y a PAS de watermark (car l'utilisateur est connecté)
    // Pour l'instant, on vérifie juste que l'image est visible
    // (le watermark n'est pas encore implémenté dans l'application)

    // ========== ÉTAPE 4 : VÉRIFIER LA DÉCRÉMENTATION DES CRÉDITS ==========
    // IMPORTANT: Attendre que l'UPDATE de la base de données Supabase soit terminé
    // L'API décrémente les crédits de manière asynchrone, il faut donner du temps à la DB
    console.log('[TEST] Attente de 5 secondes pour que l\'UPDATE Supabase soit terminé...');
    await page.waitForTimeout(5000);
    
    // Re-naviguer vers la page compte
    console.log('[TEST] Navigation vers /account...');
    await page.goto('/account', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Vérifier les logs de la console pour voir ce qui se passe
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('AccountPage') || text.includes('Profil') || text.includes('credit')) {
        consoleMessages.push(text);
        console.log(`[BROWSER CONSOLE] ${text}`);
      }
    });
    
    // FORCER un rechargement complet de la page pour vider le cache Next.js/SWR
    // et s'assurer qu'on charge les données fraîches depuis la base de données
    console.log('[TEST] Rechargement complet de la page pour vider le cache...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Attendre que le profil soit chargé (le profil devrait être créé lors de la génération)
    // Le profil peut prendre quelques secondes à apparaître car il est créé par l'API
    console.log('[TEST] Attente que le profil soit chargé...');
    const creditBalanceAfter = page.locator('[data-testid="credit-balance"]');
    
    // Vérifier d'abord si le message "Chargement du profil..." est visible
    const loadingMessage = page.locator('text=/Chargement du profil|profil.*créé.*première.*génération/i');
    const hasLoadingMessage = await loadingMessage.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`[TEST] Message de chargement visible: ${hasLoadingMessage}`);
    
    // Attendre jusqu'à 15 secondes que le profil soit chargé (réduit pour diagnostic)
    // Le profil devrait être créé lors de la génération, donc il devrait apparaître
    let profileVisible = false;
    for (let i = 0; i < 15; i++) {
      try {
        const isVisible = await creditBalanceAfter.isVisible({ timeout: 1000 }).catch(() => false);
        if (isVisible) {
          profileVisible = true;
          console.log(`[TEST] ✅ Profil visible après ${i + 1} secondes`);
          break;
        }
      } catch (e) {
        // Continuer à attendre
      }
      
      // Afficher le contenu de la page pour debug
      if (i % 5 === 0) {
        const pageContent = await page.content();
        const hasProfileSection = pageContent.includes('credit-balance') || pageContent.includes('Crédits');
        console.log(`[TEST] Tentative ${i + 1}/30: Profil visible = false, Page contient "credit-balance" = ${hasProfileSection}`);
      }
      
      await page.waitForTimeout(1000);
      // Recharger la page toutes les 5 secondes si le profil n'apparaît pas
      if ((i + 1) % 5 === 0) {
        console.log(`[TEST] Rechargement de la page après ${i + 1} secondes...`);
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
      }
    }
    
    if (!profileVisible) {
      // Afficher les messages de la console pour debug
      console.log(`[TEST] ❌ Profil non visible après 15 secondes. Messages de la console:`);
      consoleMessages.forEach(msg => console.log(`  - ${msg}`));
      throw new Error('Le profil n\'est pas visible après 15 secondes. Le profil devrait être créé lors de la génération.');
    }
    
    // Attendre que les crédits soient mis à jour (le setInterval recharge toutes les 2 secondes)
    // On attend jusqu'à 15 secondes pour que les crédits soient mis à jour depuis la DB
    console.log('[TEST] Attente que les crédits soient mis à jour depuis la base de données...');
    let creditTextAfter = await creditBalanceAfter.textContent();
    let attempts = 0;
    const maxAttempts = 15;
    while (creditTextAfter !== '4' && attempts < maxAttempts) {
      await page.waitForTimeout(1000);
      // Recharger le texte du crédit
      creditTextAfter = await creditBalanceAfter.textContent();
      attempts++;
      console.log(`[TEST] Tentative ${attempts}/${maxAttempts}: Crédits actuels = "${creditTextAfter}"`);
      
      // Si on a attendu plusieurs secondes et que les crédits ne changent pas, recharger la page
      if (attempts % 5 === 0 && creditTextAfter === '5') {
        console.log(`[TEST] Rechargement de la page après ${attempts} tentatives...`);
        await page.reload({ waitUntil: 'networkidle' });
        await expect(creditBalanceAfter).toBeVisible({ timeout: 15000 });
        creditTextAfter = await creditBalanceAfter.textContent();
      }
    }
    
    // ASSERTION STRICTE : Le test DOIT échouer si les crédits ne sont pas à 4
    // Les crédits devraient être à 4 (5 - 1 génération)
    // Le profil devrait avoir été créé automatiquement lors de la génération avec 5 crédits
    // puis décrémenté à 4 après la génération
    // Pas de tolérance : le test échoue si les crédits ne sont pas exactement à 4
    console.log(`[TEST] Crédits finaux après ${attempts} tentatives: "${creditTextAfter}"`);
    expect(creditTextAfter).toBe('4');

    // Nettoyer
    await context.close();
  });
});
