# 🔧 Résoudre : "Repository does not contain the requested branch"

**Erreur** : `The provided GitHub repository does not contain the requested branch or commit reference. Please ensure the repository is not empty.`

---

## 🎯 Diagnostic : Vérifier votre Repository GitHub

### Étape 1 : Vérifier que le Code est sur GitHub

1. **Allez sur** [github.com](https://github.com)
2. **Connectez-vous** avec votre compte
3. **Cherchez votre repository** `mon-decorateur-ia` (ou `interior-ai`)
4. **Cliquez sur le repository**

**❓ Que voyez-vous ?**

**A. Le repository est vide** (pas de fichiers)
→ Votre code n'est pas sur GitHub, vous devez le pousser (voir Solution 1)

**B. Le repository contient des fichiers** (vous voyez des fichiers comme `package.json`, `src/`, etc.)
→ Le problème est la branche (voir Solution 2)

---

## 🎯 Solution 1 : Pousser votre Code sur GitHub

**Si votre repository GitHub est vide**, vous devez pousser votre code local vers GitHub.

### Étape 1 : Vérifier que Git est Initialisé

Dans votre terminal, dans le dossier `mon-decorateur-ia` :

```bash
# Vérifier si Git est initialisé
git status
```

**Si vous voyez une erreur** : Git n'est pas initialisé, passez à l'Étape 2.
**Si vous voyez des fichiers** : Git est initialisé, passez à l'Étape 3.

### Étape 2 : Initialiser Git (si nécessaire)

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Initial commit - Ready for deployment"
```

### Étape 3 : Connecter à GitHub

```bash
# Ajouter le remote GitHub (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/mon-decorateur-ia.git

# Vérifier que le remote est bien configuré
git remote -v
```

**⚠️ Si vous avez déjà un remote** : Vous verrez une erreur. Dans ce cas, utilisez :
```bash
git remote set-url origin https://github.com/VOTRE_USERNAME/mon-decorateur-ia.git
```

### Étape 4 : Pousser le Code

```bash
# Pousser sur la branche main
git push -u origin main
```

**⚠️ Si vous avez une erreur "branch main does not exist"** :
```bash
# Créer la branche main
git branch -M main

# Pousser
git push -u origin main
```

**⚠️ Si votre branche s'appelle "master"** :
```bash
# Pousser sur master
git push -u origin master
```

### Étape 5 : Vérifier sur GitHub

1. **Retournez sur GitHub.com**
2. **Rafraîchissez la page** de votre repository (F5)
3. **Vous devriez maintenant voir tous vos fichiers** ✅

### Étape 6 : Retourner dans Vercel

1. **Retournez dans Vercel**
2. **Cliquez sur "Deploy"** à nouveau
3. **Cela devrait fonctionner maintenant** ✅

---

## 🎯 Solution 2 : Changer la Branche dans Vercel

**Si votre repository contient des fichiers mais Vercel ne trouve pas la branche** :

### Étape 1 : Vérifier le Nom de votre Branche

1. **Allez sur GitHub.com**
2. **Ouvrez votre repository**
3. **En haut de la page**, vous verrez le nom de la branche (ex: `main`, `master`, `develop`)

### Étape 2 : Changer la Branche dans Vercel

1. **Dans Vercel**, sur la page de configuration
2. **Cherchez le champ "Branch"** ou **"Production Branch"**
3. **Changez** `main` en `master` (ou vice versa, selon votre branche GitHub)
4. **Cliquez sur "Deploy"** à nouveau

---

## 🎯 Solution 3 : Créer un Repository GitHub (Si vous n'en avez pas)

**Si vous n'avez pas encore de repository sur GitHub** :

### Étape 1 : Créer le Repository sur GitHub

1. **Allez sur** [github.com](https://github.com)
2. **Cliquez sur "+"** (en haut à droite) > **"New repository"**
3. **Nom** : `mon-decorateur-ia` (ou le nom que vous voulez)
4. **Description** : (optionnel)
5. **Public** ou **Private** (selon votre choix)
6. **⚠️ NE COCHEZ PAS** "Initialize with README" (si vous avez déjà du code)
7. **Cliquez sur "Create repository"**

### Étape 2 : Pousser votre Code

Suivez les étapes de la **Solution 1** ci-dessus pour pousser votre code.

---

## 🔍 Vérification Rapide

### Checklist

- [ ] Mon repository GitHub contient des fichiers (pas vide)
- [ ] J'ai poussé mon code avec `git push`
- [ ] Je vois mes fichiers sur GitHub.com
- [ ] La branche dans Vercel correspond à ma branche GitHub (main/master)

---

## 💡 Astuce : Vérifier Rapidement

**Test rapide** : Allez sur `https://github.com/VOTRE_USERNAME/mon-decorateur-ia` (remplacez VOTRE_USERNAME)

**Si vous voyez** :
- ✅ Des fichiers (package.json, src/, etc.) → Le problème est la branche (Solution 2)
- ❌ Une page vide ou "This repository is empty" → Le problème est que le code n'est pas poussé (Solution 1)

---

## 🆘 Si Rien ne Fonctionne

1. **Vérifiez que vous êtes connecté au bon compte GitHub** dans Vercel
2. **Vérifiez les permissions** : Vercel doit avoir accès à votre repository
3. **Essayez de supprimer et recréer le projet** dans Vercel
4. **Contactez le support Vercel** si le problème persiste

---

**Dites-moi ce que vous voyez sur GitHub.com et je vous guide précisément !** 🚀

