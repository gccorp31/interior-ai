# Prochaines Étapes

Ce document liste les prochaines étapes pour finaliser MonDécorateurIA.

## ✅ Terminé

- [x] Configuration de base Supabase
- [x] Authentification utilisateur
- [x] Génération d'images avec Replicate
- [x] Gestion des crédits
- [x] Interface utilisateur de base
- [x] Tests E2E pour les flux principaux
- [x] Intégration Stripe (packs de crédits)
- [x] Galerie d'inspiration
- [x] Publication dans la galerie

## 🔄 En cours

- [ ] Validation complète des tests E2E
- [ ] Correction du bug de décrémentation des crédits
- [ ] Implémentation des modes de génération (inpainting, virtual staging)

## 📋 À faire

### Fonctionnalités manquantes

1. **Modes de génération avancés**
   - [ ] Implémenter l'inpainting (masque)
   - [ ] Implémenter le virtual staging
   - [ ] Ajouter le composant MaskCanvas dans l'interface

2. **Watermark**
   - [ ] Ajouter le watermark pour les utilisateurs anonymes
   - [ ] Utiliser le composant WatermarkImage
   - [ ] Tester l'affichage du watermark

3. **Abonnements Stripe**
   - [ ] Implémenter les abonnements mensuels/annuels
   - [ ] Gérer les webhooks Stripe pour les abonnements
   - [ ] Mettre à jour les crédits selon le plan

4. **Améliorations UI/UX**
   - [ ] Ajouter des animations de chargement
   - [ ] Améliorer les messages d'erreur
   - [ ] Ajouter des tooltips et aides contextuelles
   - [ ] Optimiser pour mobile

5. **Performance**
   - [ ] Optimiser les images
   - [ ] Implémenter le caching
   - [ ] Optimiser les requêtes Supabase

6. **Sécurité**
   - [ ] Valider toutes les entrées utilisateur
   - [ ] Implémenter la rate limiting
   - [ ] Ajouter la protection CSRF

7. **Tests**
   - [ ] Ajouter des tests unitaires
   - [ ] Ajouter des tests d'intégration
   - [ ] Améliorer la couverture de code

8. **Documentation**
   - [ ] Documenter l'API
   - [ ] Créer un guide utilisateur
   - [ ] Ajouter des exemples d'utilisation

## 🚀 Déploiement

1. **Préparation**
   - [ ] Configurer les variables d'environnement en production
   - [ ] Tester en staging
   - [ ] Préparer la base de données de production

2. **Déploiement**
   - [ ] Déployer sur Vercel
   - [ ] Configurer les domaines
   - [ ] Configurer les webhooks Stripe en production

3. **Post-déploiement**
   - [ ] Monitorer les erreurs
   - [ ] Vérifier les performances
   - [ ] Collecter les feedbacks utilisateurs

## 📝 Notes

- Les tests E2E doivent passer avant le déploiement
- La décrémentation des crédits doit être corrigée
- Les modes de génération avancés sont optionnels pour le MVP


