# 🗺️ Feuille de Route - Finalisation MonDécorateurIA

**Objectif** : Finaliser l'application pour le lancement marketing le plus rapidement possible.

**Date de création** : $(date)

---

## 📊 État Actuel

### ✅ Fonctionnalités Validées
- ✅ **Flux 1 (Anonyme)** : Test E2E passe au vert
- ✅ **Flux 2 (Inscription/Connexion)** : Test E2E passe au vert
- ✅ Authentification Supabase (inscription, connexion, déconnexion)
- ✅ Génération d'images avec Replicate (mode mock pour tests)
- ✅ Interface utilisateur moderne et responsive
- ✅ Galerie d'inspiration publique
- ✅ Publication dans la galerie
- ✅ Intégration Stripe (packs de crédits)
- ✅ Page de compte utilisateur
- ✅ Compteur de générations anonymes

### ❌ Problèmes Bloquants
- ❌ **Flux 3 (Utilisateur Gratuit)** : Test E2E échoue
  - **Bug principal** : Décrémentation des crédits ne fonctionne pas (reste à 5 au lieu de 4)
  - **Symptôme secondaire** : Overlay Next.js bloque les interactions dans les tests
- ❌ Watermark pour utilisateurs anonymes non implémenté
- ⚠️ Modes de génération avancés (Inpainting, Virtual Staging) partiellement testés

---

## 🎯 Phase 1 : Correction des Bugs Critiques (PRIORITÉ MAXIMALE)

**Objectif** : Faire passer tous les tests E2E au vert.

**Durée estimée** : 2-4 heures

### 1.1 Corriger la Décrémentation des Crédits 🔴 CRITIQUE

**Problème** : Les crédits ne passent pas de 5 à 4 après une génération.

**Hypothèses à vérifier** :
1. `SUPABASE_SERVICE_ROLE_KEY` n'est pas transmise au serveur Next.js lancé par Playwright
2. L'UPDATE Supabase ne fonctionne pas (erreur RLS ou autre)
3. La page `/account` lit les données depuis un cache et ne rafraîchit pas

**Actions** :
- [ ] **Vérifier les logs serveur** pendant l'exécution du test Flux 3
  - Chercher les logs `[API] Résultat de l'UPDATE:`
  - Vérifier si `updateResult` contient des données
  - Vérifier si `updateErr` contient une erreur
- [ ] **Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est bien dans `playwright.config.ts`**
  - Le `webServer.env` doit contenir `SUPABASE_SERVICE_ROLE_KEY`
  - Vérifier que la variable est bien chargée depuis `.env.local`
- [ ] **Vérifier les politiques RLS Supabase**
  - Exécuter le script `scripts/add-user-profiles-update-policy.sql`
  - Vérifier que la politique UPDATE existe et fonctionne
- [ ] **Tester manuellement la décrémentation**
  - Créer un utilisateur de test
  - Appeler `/api/generate` manuellement
  - Vérifier dans Supabase que `credit_balance` a bien été décrémenté
- [ ] **Forcer le rafraîchissement de la page `/account`**
  - Utiliser `router.refresh()` après la génération
  - Ajouter un délai avant de vérifier les crédits
  - Utiliser `supabaseAdmin` pour forcer une lecture directe depuis la DB

**Fichiers à modifier** :
- `src/app/api/generate/route.ts` (logique de décrémentation)
- `src/lib/supabaseAdmin.ts` (initialisation du client admin)
- `playwright.config.ts` (transmission des variables d'environnement)
- `src/app/account/page.tsx` (rafraîchissement des données)
- `scripts/add-user-profiles-update-policy.sql` (politiques RLS)

### 1.2 Corriger l'Overlay Next.js dans les Tests 🔴 CRITIQUE

**Problème** : L'overlay d'erreur Next.js bloque les interactions dans les tests.

**Actions** :
- [ ] **Identifier la cause de l'overlay**
  - Vérifier les logs du serveur Next.js pendant les tests
  - Chercher les erreurs JavaScript côté client
  - Vérifier s'il y a des erreurs dans les composants React
- [ ] **Corriger l'erreur sous-jacente**
  - Si c'est une erreur de syntaxe, corriger le code
  - Si c'est une erreur d'exécution, ajouter des try-catch
  - Si c'est une erreur de configuration, corriger les variables d'environnement
- [ ] **Améliorer la gestion de l'overlay dans les tests**
  - Fermer l'overlay automatiquement avec `Escape`
  - Utiliser JavaScript pour contourner l'overlay si nécessaire
  - Ajouter des timeouts plus longs si l'overlay apparaît de manière intermittente

**Fichiers à modifier** :
- `e2e/flux-utilisateur-gratuit.spec.ts` (gestion de l'overlay)
- `src/app/page.tsx` (erreurs potentielles)
- `src/components/*.tsx` (erreurs potentielles)

### 1.3 Valider le Flux 3 Complet ✅

**Actions** :
- [ ] Faire passer le test `flux-utilisateur-gratuit.spec.ts` au vert
- [ ] Vérifier que la décrémentation fonctionne (5 → 4)
- [ ] Vérifier que les modes Inpainting et Virtual Staging fonctionnent
- [ ] Vérifier que la publication dans la galerie fonctionne

**Critères de succès** :
- ✅ Test `flux-utilisateur-gratuit.spec.ts` passe au vert
- ✅ Les crédits passent de 5 à 4 après une génération
- ✅ La page `/account` affiche correctement les crédits mis à jour

---

## 🎯 Phase 2 : Fonctionnalités Essentielles pour le MVP

**Objectif** : Implémenter les fonctionnalités minimales pour le lancement.

**Durée estimée** : 4-8 heures

### 2.1 Implémenter le Watermark pour Utilisateurs Anonymes 🔴 CRITIQUE

**Problème** : Les utilisateurs anonymes doivent avoir un watermark sur leurs images générées.

**État actuel** :
- ✅ Le composant `WatermarkImage` existe mais utilise seulement un overlay CSS (pas un vrai watermark sur l'image)
- ❌ La bibliothèque `sharp` n'est pas installée
- ❌ Le watermark n'est pas appliqué côté serveur dans l'API
- ❌ Le watermark n'est pas utilisé dans `page.tsx` pour afficher les images
- ❌ Le champ `has_watermark` n'est pas utilisé dans la table `generations`

**Actions** :
- [ ] **Option 1 : Watermark CSS (Rapide, moins sécurisé)**
  - Utiliser le composant `WatermarkImage` existant
  - Ajouter `hasWatermark={true}` pour les utilisateurs anonymes
  - Marquer `has_watermark=true` dans la table `generations` pour les utilisateurs anonymes
  - ⚠️ **Note** : Ce watermark peut être facilement retiré (inspecteur de code)
  
- [ ] **Option 2 : Watermark serveur avec Sharp (Recommandé, plus sécurisé)**
  - Installer `sharp` : `npm install sharp`
  - Créer une fonction pour ajouter un watermark avec `sharp`
  - Dans `/api/generate`, après réception de l'image de Replicate :
    - Si utilisateur anonyme : télécharger l'image, ajouter le watermark avec `sharp`, uploader dans Supabase Storage
    - Marquer `has_watermark=true` dans la table `generations`
  - Utiliser le composant `WatermarkImage` pour l'affichage (optionnel, car le watermark est déjà dans l'image)
  - ✅ **Note** : Ce watermark est intégré à l'image et ne peut pas être facilement retiré

- [ ] **Afficher le watermark dans l'interface**
  - Dans `page.tsx`, utiliser `WatermarkImage` avec `hasWatermark={isAnonymous}` pour les utilisateurs anonymes
  - Dans `GenerationsGallery.tsx`, utiliser `WatermarkImage` avec `hasWatermark={generation.has_watermark}`

- [ ] **Tester le watermark**
  - Vérifier que les utilisateurs anonymes voient le watermark
  - Vérifier que les utilisateurs authentifiés ne voient pas de watermark
  - Vérifier que le watermark est visible sur les images générées

**Recommandation** : Commencer par l'Option 1 (rapide) pour le MVP, puis passer à l'Option 2 (sécurisé) après le lancement.

**Fichiers à modifier** :
- `package.json` (ajouter `sharp` si Option 2)
- `src/app/api/generate/route.ts` (ajout du watermark serveur si Option 2)
- `src/app/page.tsx` (affichage conditionnel du watermark)
- `src/components/GenerationsGallery.tsx` (affichage du watermark)
- `src/components/WatermarkImage.tsx` (améliorer le watermark CSS si Option 1)

### 2.2 Finaliser les Modes de Génération Avancés 🟡 IMPORTANT

**État actuel** : Les modes Inpainting et Virtual Staging sont dans le test mais peuvent ne pas être complètement fonctionnels.

**Actions** :
- [ ] **Vérifier que le mode Inpainting fonctionne**
  - Tester le dessin de masque avec `MaskCanvas`
  - Vérifier que le masque est bien envoyé à l'API
  - Vérifier que Replicate reçoit les bons paramètres
- [ ] **Vérifier que le mode Virtual Staging fonctionne**
  - Tester la génération en mode Virtual Staging
  - Vérifier que les paramètres sont corrects
- [ ] **Améliorer l'interface utilisateur pour ces modes**
  - Ajouter des instructions claires pour l'utilisateur
  - Améliorer l'UX du dessin de masque
  - Ajouter des messages d'erreur explicites

**Fichiers à vérifier** :
- `src/components/MaskCanvas.tsx` (dessin de masque)
- `src/app/page.tsx` (interface des modes)
- `src/app/api/generate/route.ts` (paramètres Replicate)

### 2.3 Vérifier l'Intégration Stripe Complète 🟡 IMPORTANT

**Actions** :
- [ ] **Tester les packs de crédits**
  - Vérifier que l'achat de packs fonctionne
  - Vérifier que les crédits sont bien ajoutés après l'achat
  - Vérifier que le webhook Stripe fonctionne
- [ ] **Tester les abonnements** (si implémentés)
  - Vérifier que les abonnements fonctionnent
  - Vérifier que les crédits sont bien attribués selon le plan
  - Vérifier que le portail Stripe fonctionne
- [ ] **Vérifier les webhooks Stripe**
  - Tester le webhook en mode test
  - Vérifier que les événements sont bien traités
  - Vérifier que les erreurs sont bien gérées

**Fichiers à vérifier** :
- `src/app/api/stripe/create-checkout-session/route.ts`
- `src/app/api/stripe/create-subscription/route.ts`
- `src/app/api/stripe/create-portal-session/route.ts`
- `src/app/api/webhook/stripe/route.ts`

---

## 🎯 Phase 3 : Préparation au Déploiement

**Objectif** : Préparer l'application pour le déploiement en production.

**Durée estimée** : 2-4 heures

### 3.1 Configuration Production 🟡 IMPORTANT

**Actions** :
- [ ] **Configurer les variables d'environnement en production**
  - Créer un fichier `.env.production` avec les vraies clés
  - Configurer les variables dans Vercel
  - Vérifier que toutes les variables sont bien définies
- [ ] **Configurer Supabase en production**
  - Créer un projet Supabase de production
  - Exécuter les scripts SQL de migration
  - Configurer les politiques RLS
  - Configurer le Storage (bucket `uploads`)
- [ ] **Configurer Stripe en production**
  - Créer les produits et prix en mode production
  - Configurer les webhooks Stripe avec l'URL de production
  - Tester les paiements en mode production
- [ ] **Configurer Replicate**
  - Vérifier que le token Replicate est valide
  - Tester une génération réelle (pas en mode mock)
  - Vérifier les coûts et limites

### 3.2 Tests de Validation Production 🟡 IMPORTANT

**Actions** :
- [ ] **Tester tous les flux en production**
  - Flux anonyme
  - Flux inscription/connexion
  - Flux utilisateur gratuit
  - Achat de packs de crédits
  - Génération d'images réelles
- [ ] **Vérifier les performances**
  - Temps de chargement des pages
  - Temps de génération d'images
  - Temps de réponse des API
- [ ] **Vérifier la sécurité**
  - Validation des entrées utilisateur
  - Protection contre les attaques courantes
  - Vérification des permissions RLS

### 3.3 Déploiement sur Vercel 🟡 IMPORTANT

**Actions** :
- [ ] **Préparer le déploiement**
  - Vérifier que `next build` fonctionne sans erreur
  - Vérifier que tous les tests passent
  - Préparer les variables d'environnement
- [ ] **Déployer sur Vercel**
  - Connecter le repository à Vercel
  - Configurer les variables d'environnement
  - Déployer en production
- [ ] **Configurer les domaines**
  - Configurer le domaine personnalisé
  - Configurer le SSL
  - Vérifier que le site est accessible

---

## 🎯 Phase 4 : Optimisations et Améliorations (POST-LANCEMENT)

**Objectif** : Améliorer l'expérience utilisateur et les performances.

**Durée estimée** : 8-16 heures (peut être fait après le lancement)

### 4.1 Améliorations UI/UX 🟢 OPTIONNEL

**Actions** :
- [ ] Ajouter des animations de chargement
- [ ] Améliorer les messages d'erreur
- [ ] Ajouter des tooltips et aides contextuelles
- [ ] Optimiser pour mobile
- [ ] Ajouter des indicateurs de progression pour la génération
- [ ] Améliorer la galerie d'inspiration

### 4.2 Optimisations Performance 🟢 OPTIONNEL

**Actions** :
- [ ] Optimiser les images (compression, formats modernes)
- [ ] Implémenter le caching (Next.js Image Optimization)
- [ ] Optimiser les requêtes Supabase (index, pagination)
- [ ] Implémenter la mise en cache côté client
- [ ] Optimiser le bundle JavaScript

### 4.3 Sécurité et Robustesse 🟢 OPTIONNEL

**Actions** :
- [ ] Valider toutes les entrées utilisateur
- [ ] Implémenter la rate limiting
- [ ] Ajouter la protection CSRF
- [ ] Implémenter un système de logs et de monitoring
- [ ] Ajouter des alertes pour les erreurs critiques

### 4.4 Tests et Documentation 🟢 OPTIONNEL

**Actions** :
- [ ] Ajouter des tests unitaires
- [ ] Ajouter des tests d'intégration
- [ ] Améliorer la couverture de code
- [ ] Documenter l'API
- [ ] Créer un guide utilisateur
- [ ] Ajouter des exemples d'utilisation

---

## 📋 Checklist de Lancement Minimale

### Avant le Déploiement (OBLIGATOIRE)

- [ ] **Tests E2E** : Tous les tests passent au vert
  - [ ] `flux-anonyme.spec.ts` ✅ (déjà validé)
  - [ ] `flux-inscription.spec.ts` ✅ (déjà validé)
  - [ ] `flux-utilisateur-gratuit.spec.ts` ❌ (à corriger)

- [ ] **Fonctionnalités Critiques**
  - [ ] Décrémentation des crédits fonctionne
  - [ ] Watermark pour utilisateurs anonymes implémenté
  - [ ] Génération d'images fonctionne (mode réel, pas mock)
  - [ ] Authentification fonctionne (inscription, connexion, déconnexion)
  - [ ] Galerie d'inspiration fonctionne
  - [ ] Publication dans la galerie fonctionne

- [ ] **Configuration**
  - [ ] Variables d'environnement configurées (Supabase, Stripe, Replicate)
  - [ ] Politiques RLS Supabase actives
  - [ ] Storage Supabase configuré (bucket `uploads`)
  - [ ] Stripe configuré (produits, prix, webhooks)
  - [ ] Replicate configuré (token, modèle)

- [ ] **Déploiement**
  - [ ] Application déployée sur Vercel
  - [ ] Domaines configurés
  - [ ] SSL configuré
  - [ ] Variables d'environnement en production configurées

### Après le Déploiement (RECOMMANDÉ)

- [ ] **Monitoring**
  - [ ] Erreurs monitorées (Sentry, LogRocket, etc.)
  - [ ] Performances monitorées (Vercel Analytics, etc.)
  - [ ] Alertes configurées pour les erreurs critiques

- [ ] **Tests Post-Déploiement**
  - [ ] Tous les flux testés en production
  - [ ] Paiements testés en production
  - [ ] Générations d'images testées en production

---

## 🚀 Plan d'Action Immédiat (Priorité 1)

### Étape 1 : Corriger le Bug de Décrémentation (2-3 heures)

1. **Diagnostic** :
   - Lancer le test `flux-utilisateur-gratuit.spec.ts`
   - Examiner les logs du serveur Next.js
   - Vérifier si l'UPDATE Supabase fonctionne
   - Vérifier si `SUPABASE_SERVICE_ROLE_KEY` est bien transmise

2. **Correction** :
   - Si la clé n'est pas transmise : Corriger `playwright.config.ts`
   - Si l'UPDATE échoue : Vérifier les politiques RLS
   - Si le cache pose problème : Forcer le rafraîchissement dans `/account`

3. **Validation** :
   - Relancer le test
   - Vérifier que les crédits passent de 5 à 4
   - Vérifier que le test passe au vert

### Étape 2 : Implémenter le Watermark (1-2 heures)

1. **Vérification** :
   - Vérifier que le composant `WatermarkImage` existe
   - Vérifier que la bibliothèque `sharp` est installée

2. **Implémentation** :
   - Ajouter le watermark dans l'API `/api/generate` pour les utilisateurs anonymes
   - Utiliser `sharp` pour ajouter le watermark à l'image
   - Sauvegarder l'image avec watermark dans Supabase Storage

3. **Affichage** :
   - Utiliser le composant `WatermarkImage` pour afficher les images avec watermark
   - S'assurer que le watermark est visible

### Étape 3 : Déployer en Production (1-2 heures)

1. **Préparation** :
   - Configurer les variables d'environnement en production
   - Vérifier que `next build` fonctionne
   - Préparer la base de données de production

2. **Déploiement** :
   - Déployer sur Vercel
   - Configurer les domaines
   - Configurer les webhooks Stripe

3. **Validation** :
   - Tester tous les flux en production
   - Vérifier que tout fonctionne correctement

---

## ⏱️ Estimation Totale

### Phase 1 (Bugs Critiques) : 2-4 heures
### Phase 2 (Fonctionnalités Essentielles) : 4-8 heures
### Phase 3 (Préparation Déploiement) : 2-4 heures

**Total minimum pour le lancement** : **8-16 heures**

### Phase 4 (Optimisations) : 8-16 heures (post-lancement)

**Total pour une version complète** : **16-32 heures**

---

## 🎯 Objectif Final

**Lancer l'application en production avec** :
- ✅ Tous les tests E2E au vert
- ✅ Décrémentation des crédits fonctionnelle
- ✅ Watermark pour utilisateurs anonymes
- ✅ Génération d'images fonctionnelle
- ✅ Intégration Stripe fonctionnelle
- ✅ Application déployée sur Vercel
- ✅ Monitoring et alertes configurés

**Date cible de lancement** : **Dès que la Phase 1 et la Phase 2.1 sont terminées**

---

## 📝 Notes Importantes

1. **Priorité** : Se concentrer d'abord sur la Phase 1 (bugs critiques) avant de passer aux autres phases.

2. **Tests** : Ne pas déployer en production tant que tous les tests E2E ne passent pas au vert.

3. **Watermark** : Le watermark est critique pour empêcher l'utilisation gratuite illimitée de l'application.

4. **Décrémentation** : La décrémentation des crédits est critique pour la monétisation de l'application.

5. **Mode Mock** : En production, désactiver le mode mock Replicate pour utiliser les vraies générations.

---

## 🔧 Commandes Utiles

### Tests E2E
```bash
# Lancer tous les tests
npm run test:e2e

# Lancer un test spécifique
npm run test:e2e flux-utilisateur-gratuit.spec.ts -- --project=chromium

# Lancer les tests en mode UI
npm run test:e2e:ui
```

### Build et Déploiement
```bash
# Build de production
npm run build

# Démarrer en mode production
npm start

# Vérifier les erreurs de lint
npm run lint
```

### Supabase
```bash
# Exécuter un script SQL
psql -h <host> -U <user> -d <database> -f scripts/add-user-profiles-update-policy.sql
```

---

## 📞 Support et Ressources

- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Stripe** : https://stripe.com/docs
- **Documentation Replicate** : https://replicate.com/docs
- **Documentation Next.js** : https://nextjs.org/docs
- **Documentation Playwright** : https://playwright.dev/docs

---

**Dernière mise à jour** : $(date)

**Prochaine révision** : Après correction du bug de décrémentation

