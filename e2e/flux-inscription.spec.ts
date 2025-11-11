import { test, expect } from '@playwright/test';

test.describe('Flux 2 : Inscription et Connexion', () => {
  test('Test complet du cycle d\'authentification : Inscription, Déconnexion, Connexion', async ({ browser }) => {
    // 1. Ouvrir une nouvelle page en mode "incognito" (new context)
    const context = await browser.newContext({
      // Mode incognito : pas de cookies, pas de localStorage partagé
      storageState: undefined,
    });
    const page = await context.newPage();

    // Générer un email de test unique
    const testEmail = `test-user-${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';

    // ========== ÉTAPE 1 : TEST D'INSCRIPTION ==========
    // Naviguer vers la page de login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Vérifier que la page de login est chargée
    // Le titre peut être "Bienvenue", "Créer un compte", ou "Se connecter"
    await expect(page.locator('h1')).toBeVisible();

    // Basculer vers le mode "S'inscrire" si nécessaire
    const toggleButton = page.locator('button:has-text("Pas encore de compte"), button:has-text("Déjà un compte")');
    const toggleText = await toggleButton.textContent();
    
    if (toggleText?.includes('Déjà un compte')) {
      // On est déjà en mode inscription
    } else if (toggleText?.includes('Pas encore de compte')) {
      // Cliquer pour basculer vers l'inscription
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // Vérifier que le formulaire d'inscription est visible
    // Le titre peut être "Créer un compte" ou "Bienvenue" selon l'état
    const h1Text = await page.locator('h1').textContent();
    if (!h1Text?.includes('Créer un compte') && !h1Text?.includes('Bienvenue')) {
      // Si on n'est pas en mode inscription, cliquer à nouveau sur le toggle
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // Remplir le formulaire d'inscription
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);

    // Cliquer sur "S'inscrire"
    const signUpButton = page.locator('button:has-text("S\'inscrire")');
    await expect(signUpButton).toBeVisible();
    await expect(signUpButton).toBeEnabled();
    
    await signUpButton.click();

    // Attendre la redirection vers la page d'accueil
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Attendre un peu pour que React mette à jour l'état de l'utilisateur
    await page.waitForTimeout(2000);
    
    // Vérifier que l'utilisateur est bien connecté
    // On peut vérifier que le bouton "Générer" est visible (car l'utilisateur est connecté)
    // ou vérifier qu'il n'y a pas de compteur anonyme
    const anonymousCounter = page.locator('[data-testid="anonymous-counter-text"]');
    const isCounterVisible = await anonymousCounter.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Si le compteur anonyme n'est pas visible, c'est que l'utilisateur est connecté
    // Sinon, attendre un peu plus et recharger la page
    if (isCounterVisible) {
      // Recharger la page pour forcer la mise à jour de l'état
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const isCounterVisibleAfterReload = await anonymousCounter.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isCounterVisibleAfterReload).toBe(false);
    } else {
      expect(isCounterVisible).toBe(false);
    }

    // ========== ÉTAPE 2 : TEST DE DÉCONNEXION ==========
    // Utiliser l'API Supabase directement via le navigateur pour déconnecter
    // On doit injecter le client Supabase ou utiliser l'API directement
    await page.evaluate(async () => {
      // @ts-ignore - Accéder au client Supabase via window si disponible
      if (window.supabaseClient) {
        // @ts-ignore
        await window.supabaseClient.auth.signOut();
      } else {
        // Sinon, utiliser fetch pour appeler l'API Supabase directement
        // On peut aussi utiliser localStorage pour supprimer les tokens
        localStorage.removeItem('sb-' + window.location.hostname.split('.')[0] + '-auth-token');
        // Supprimer tous les tokens Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key);
          }
        });
      }
    });

    // Attendre que la déconnexion soit effective
    await page.waitForTimeout(2000);
    
    // Vérifier que l'utilisateur est déconnecté
    // Le compteur anonyme devrait maintenant être visible
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Vérifier que le compteur anonyme est visible (utilisateur déconnecté)
    const anonymousCounterAfterLogout = page.locator('[data-testid="anonymous-counter-text"]');
    await expect(anonymousCounterAfterLogout).toBeVisible({ timeout: 5000 });

    // ========== ÉTAPE 3 : TEST DE CONNEXION ==========
    // Naviguer vers la page de login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Vérifier que la page de login est chargée (le titre peut être "Bienvenue", "Se connecter", ou "Créer un compte")
    await expect(page.locator('h1')).toBeVisible();

    // Basculer vers le mode "Se connecter" si nécessaire
    const toggleButtonLogin = page.locator('button:has-text("Pas encore de compte"), button:has-text("Déjà un compte")');
    await expect(toggleButtonLogin).toBeVisible({ timeout: 5000 });
    const toggleTextLogin = await toggleButtonLogin.textContent();
    
    if (toggleTextLogin?.includes('Pas encore de compte')) {
      // On est déjà en mode connexion (le h1 affiche "Bienvenue" par défaut)
      // Pas besoin de cliquer
    } else if (toggleTextLogin?.includes('Déjà un compte')) {
      // Cliquer pour basculer vers la connexion
      await toggleButtonLogin.click();
      await page.waitForTimeout(500);
    }

    // Vérifier que le formulaire de connexion est visible
    // Le h1 affiche "Bienvenue" par défaut, on vérifie plutôt que le bouton "Se connecter" existe
    const signInButton = page.locator('button:has-text("Se connecter")');
    await expect(signInButton).toBeVisible({ timeout: 5000 });

    // Remplir le formulaire de connexion avec les mêmes identifiants
    const emailInputLogin = page.locator('input[type="email"]');
    const passwordInputLogin = page.locator('input[type="password"]');
    
    await expect(emailInputLogin).toBeVisible();
    await expect(passwordInputLogin).toBeVisible();
    
    await emailInputLogin.fill(testEmail);
    await passwordInputLogin.fill(testPassword);

    // Cliquer sur "Se connecter" (le bouton existe déjà)
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // Attendre la redirection vers la page d'accueil
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Attendre un peu pour que React mette à jour l'état de l'utilisateur
    await page.waitForTimeout(2000);
    
    // Vérifier que l'utilisateur est bien reconnecté
    // Le compteur anonyme ne devrait pas être visible
    const anonymousCounterAfterLogin = page.locator('[data-testid="anonymous-counter-text"]');
    let isCounterVisibleAfterLogin = await anonymousCounterAfterLogin.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Si le compteur est visible, recharger la page pour forcer la mise à jour
    if (isCounterVisibleAfterLogin) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      isCounterVisibleAfterLogin = await anonymousCounterAfterLogin.isVisible({ timeout: 2000 }).catch(() => false);
    }
    
    // Si le compteur anonyme n'est pas visible, c'est que l'utilisateur est connecté
    expect(isCounterVisibleAfterLogin).toBe(false);

    // Nettoyer
    await context.close();
  });
});

