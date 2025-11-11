# Guide Simple : Corriger la Table user_profiles

## 🎯 Le Problème

La table `user_profiles` existe mais il manque la colonne `credit_balance` (et peut-être d'autres colonnes).

## ✅ Solution en 3 Étapes Simples

### ÉTAPE 1 : Voir ce qui existe actuellement

Dans le SQL Editor de Supabase, exécutez cette requête pour voir quelles colonnes existent déjà :

```sql
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Résultat attendu** : Vous verrez une liste des colonnes existantes (probablement juste `id`).

---

### ÉTAPE 2 : Ajouter les colonnes manquantes

1. **Ouvrez le fichier** `scripts/fix-user-profiles-table.sql` dans votre projet
2. **Sélectionnez tout le contenu** (Ctrl+A)
3. **Copiez** (Ctrl+C)
4. **Allez dans Supabase** → SQL Editor
5. **Collez** le contenu dans le SQL Editor (Ctrl+V)
6. **Cliquez sur "Run"** (ou "Exécuter")

**Ce que fait le script** :
- Vérifie si chaque colonne existe
- Ajoute les colonnes manquantes :
  - `credit_balance` (INTEGER, valeur par défaut: 5)
  - `plan` (TEXT, valeur par défaut: 'Découverte')
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Met à jour les profils existants avec les valeurs par défaut

**Résultat attendu** : Vous devriez voir des messages comme :
- `Colonne credit_balance ajoutée avec succès`
- `Colonne plan ajoutée avec succès`
- etc.

---

### ÉTAPE 3 : Vérifier que ça a fonctionné

Après avoir exécuté le script de l'ÉTAPE 2, exécutez cette requête pour vérifier que les colonnes existent maintenant :

```sql
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Résultat attendu** : Vous devriez maintenant voir toutes les colonnes :
- `id`
- `credit_balance`
- `plan`
- `created_at`
- `updated_at`

**Ensuite**, testez cette requête pour voir les profils (si vous en avez) :

```sql
SELECT id, credit_balance, plan 
FROM user_profiles 
LIMIT 10;
```

**Résultat attendu** : 
- Si vous avez des profils : vous verrez une liste avec les colonnes `id`, `credit_balance`, et `plan`
- Si vous n'avez pas de profils : vous verrez une liste vide (c'est normal, les profils seront créés lors de la première génération)

---

## 🚀 Après la Correction

Une fois que vous avez exécuté le script et vérifié que les colonnes existent :

1. **Relancez le test E2E** :
   ```bash
   npm run test:e2e -- flux-utilisateur-gratuit.spec.ts --project=chromium
   ```

2. **Le test devrait maintenant** :
   - Créer un profil avec 5 crédits lors de la génération
   - Décrémenter les crédits de 5 à 4 après la génération
   - Afficher le profil dans la page `/account`

---

## ❓ Questions Fréquentes

### Q : Que faire si le script échoue ?

**R :** Vérifiez les messages d'erreur dans Supabase. Le script est conçu pour être sûr (il vérifie si les colonnes existent avant de les ajouter), donc il ne devrait pas causer de problème.

### Q : Que faire si je vois "Colonne credit_balance existe déjà" ?

**R :** C'est normal ! Cela signifie que la colonne existe déjà. Le script continue et vérifie les autres colonnes.

### Q : Que faire si je n'ai pas de profils dans la table ?

**R :** C'est normal ! Les profils seront créés automatiquement lors de la première génération d'image par un utilisateur authentifié.

### Q : Comment savoir si le script a fonctionné ?

**R :** Exécutez la requête de l'ÉTAPE 3. Si vous voyez toutes les colonnes (`id`, `credit_balance`, `plan`, `created_at`, `updated_at`), c'est que ça a fonctionné !

---

## 📝 Résumé des Actions

1. ✅ Exécuter la requête de l'ÉTAPE 1 (pour voir ce qui existe)
2. ✅ Exécuter le script `fix-user-profiles-table.sql` (ÉTAPE 2)
3. ✅ Exécuter la requête de l'ÉTAPE 3 (pour vérifier que ça a fonctionné)
4. ✅ Relancer le test E2E

C'est tout ! 🎉

