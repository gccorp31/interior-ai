# 📤 Pousser votre Code sur GitHub - Guide Simple

Votre repository GitHub est vide. Voici comment pousser votre code local vers GitHub.

---

## 🎯 Méthode 1 : Utiliser Git Bash (Recommandé)

### Étape 1 : Ouvrir Git Bash

1. **Cliquez droit** sur le dossier `mon-decorateur-ia` dans l'explorateur Windows
2. **Cliquez sur "Git Bash Here"** (si Git est installé)
3. OU **Ouvrez Git Bash** et naviguez vers le dossier :
   ```bash
   cd /c/interior-ai/mon-decorateur-ia
   ```

### Étape 2 : Vérifier Git

```bash
git --version
```

**Si vous voyez une erreur** : Git n'est pas installé. Installez-le depuis [git-scm.com](https://git-scm.com/download/win)

### Étape 3 : Initialiser Git (si nécessaire)

```bash
# Vérifier si Git est déjà initialisé
git status
```

**Si vous voyez "not a git repository"** :
```bash
git init
```

### Étape 4 : Ajouter tous les Fichiers

```bash
git add .
```

### Étape 5 : Faire un Commit

```bash
git commit -m "Ready for deployment"
```

### Étape 6 : Connecter à GitHub

```bash
git remote add origin https://github.com/gccorp31/interior-ai.git
```

**⚠️ Si vous avez une erreur "remote origin already exists"** :
```bash
git remote set-url origin https://github.com/gccorp31/interior-ai.git
```

### Étape 7 : Pousser sur GitHub

```bash
# Créer et pousser sur la branche main
git branch -M main
git push -u origin main
```

**✅ C'est tout !** Votre code est maintenant sur GitHub !

---

## 🎯 Méthode 2 : Utiliser l'Interface GitHub (Plus Simple)

Si vous préférez ne pas utiliser la ligne de commande :

### Étape 1 : Créer un Fichier README

1. **Allez sur** [github.com/gccorp31/interior-ai](https://github.com/gccorp31/interior-ai)
2. **Cliquez sur "creating a new file"** (lien dans le message)
3. **Nom du fichier** : `README.md`
4. **Contenu** : `# Interior AI - Mon Décorateur IA`
5. **Cliquez sur "Commit new file"** (en bas)

### Étape 2 : Uploader vos Fichiers

1. **Cliquez sur "uploading an existing file"** (lien dans le message)
2. **Glissez-déposez** tous les fichiers de votre dossier `mon-decorateur-ia` (sauf `node_modules`)
3. **Cliquez sur "Commit changes"**

**⚠️ Cette méthode est longue** si vous avez beaucoup de fichiers. La méthode 1 (Git Bash) est plus rapide.

---

## 🎯 Méthode 3 : Utiliser VS Code (Si vous utilisez VS Code)

### Étape 1 : Ouvrir dans VS Code

1. **Ouvrez VS Code**
2. **File > Open Folder** > Sélectionnez le dossier `mon-decorateur-ia`

### Étape 2 : Utiliser l'Interface Git de VS Code

1. **Cliquez sur l'icône Git** dans la barre latérale (ou `Ctrl+Shift+G`)
2. **Cliquez sur "Initialize Repository"** (si Git n'est pas initialisé)
3. **Cliquez sur "+"** à côté de "Changes" pour ajouter tous les fichiers
4. **Tapez un message** : `Ready for deployment`
5. **Cliquez sur "Commit"** (icône ✓)
6. **Cliquez sur "..."** (menu) > **"Push"** > **"Publish Branch"**
7. **Sélectionnez** `https://github.com/gccorp31/interior-ai.git`
8. **Cliquez sur "OK"**

---

## 🔍 Vérification

Après avoir poussé votre code :

1. **Allez sur** [github.com/gccorp31/interior-ai](https://github.com/gccorp31/interior-ai)
2. **Rafraîchissez la page** (F5)
3. **Vous devriez voir** :
   - ✅ Des fichiers (package.json, src/, etc.)
   - ✅ Plus le message "This repository is empty"

---

## 🎯 Retourner dans Vercel

Une fois que votre code est sur GitHub :

1. **Retournez dans Vercel**
2. **Cliquez sur "Deploy"** à nouveau
3. **Cela devrait fonctionner maintenant** ✅

---

## 🆘 Problèmes Courants

### Erreur : "git is not recognized"

**Solution** : Installez Git depuis [git-scm.com](https://git-scm.com/download/win)

### Erreur : "remote origin already exists"

**Solution** : Utilisez `git remote set-url origin https://github.com/gccorp31/interior-ai.git`

### Erreur : "branch main does not exist"

**Solution** : Utilisez `git branch -M main` avant de pousser

### Erreur : "authentication failed"

**Solution** : GitHub a peut-être changé l'authentification. Utilisez un **Personal Access Token** :
1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token
3. Copiez le token
4. Utilisez-le comme mot de passe lors du `git push`

---

## 💡 Recommandation

**Je recommande la Méthode 1 (Git Bash)** car c'est la plus rapide et la plus standard.

**Si Git n'est pas installé**, installez-le d'abord depuis [git-scm.com](https://git-scm.com/download/win)

---

**Une fois votre code poussé sur GitHub, dites-moi et on continue avec Vercel !** 🚀

