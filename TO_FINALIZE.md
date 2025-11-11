# À Finaliser

Ce document liste les éléments à finaliser avant le lancement de MonDécorateurIA.

## 🔴 Critique (À faire avant le lancement)

### 1. Bug de décrémentation des crédits
- **Problème**: Les crédits ne se décrémentent pas correctement après une génération
- **Impact**: Les utilisateurs peuvent générer des images sans consommer de crédits
- **Solution**: 
  - Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est bien transmis au serveur
  - Vérifier que les politiques RLS permettent l'UPDATE avec `supabaseAdmin`
  - Tester la décrémentation dans les tests E2E

### 2. Tests E2E
- **Problème**: Les tests E2E doivent tous passer
- **Impact**: Impossible de valider que l'application fonctionne correctement
- **Solution**: 
  - Corriger les tests qui échouent
  - Valider tous les flux utilisateur
  - S'assurer que les tests sont stables

### 3. Watermark pour utilisateurs anonymes
- **Problème**: Les utilisateurs anonymes doivent avoir un watermark sur leurs images
- **Impact**: Les utilisateurs peuvent utiliser l'application gratuitement sans limite
- **Solution**: 
  - Implémenter le watermark dans l'API
  - Utiliser le composant WatermarkImage
  - Tester l'affichage du watermark

## 🟡 Important (À faire après le lancement)

### 1. Modes de génération avancés
- Inpainting (masque)
- Virtual staging
- Autres modes de génération

### 2. Abonnements Stripe
- Implémenter les abonnements mensuels/annuels
- Gérer les webhooks Stripe
- Mettre à jour les crédits selon le plan

### 3. Améliorations UI/UX
- Animations de chargement
- Messages d'erreur améliorés
- Tooltips et aides contextuelles
- Optimisation mobile

## 🟢 Optionnel (Améliorations futures)

### 1. Performance
- Optimisation des images
- Implémentation du caching
- Optimisation des requêtes Supabase

### 2. Sécurité
- Validation des entrées utilisateur
- Rate limiting
- Protection CSRF

### 3. Tests
- Tests unitaires
- Tests d'intégration
- Amélioration de la couverture de code

## 📋 Checklist de lancement

- [ ] Tous les tests E2E passent
- [ ] La décrémentation des crédits fonctionne
- [ ] Le watermark est implémenté pour les utilisateurs anonymes
- [ ] Les variables d'environnement sont configurées
- [ ] Les politiques RLS sont actives
- [ ] Le Storage est configuré
- [ ] Stripe est configuré (packs de crédits)
- [ ] Les webhooks Stripe sont configurés
- [ ] L'application est déployée sur Vercel
- [ ] Les domaines sont configurés
- [ ] Les erreurs sont monitorées
- [ ] Les performances sont vérifiées

## 🚀 Prochaines actions

1. Corriger le bug de décrémentation des crédits
2. Valider tous les tests E2E
3. Implémenter le watermark
4. Déployer en production
5. Monitorer les erreurs et performances


