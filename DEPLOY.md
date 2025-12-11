# Guide de déploiement sur GitHub Pages

## 🚀 Déploiement automatique (recommandé)

### 1. Prérequis
- Un repository GitHub
- GitHub Pages activé dans les paramètres du repository

### 2. Configuration initiale

1. **Activez GitHub Pages** :
   - Allez dans **Settings** → **Pages** de votre repository
   - Sous **Source**, sélectionnez **GitHub Actions** (pas "Deploy from a branch")
   - Sauvegardez

2. **Vérifiez le nom de votre repository** :
   - Le workflow utilise automatiquement le nom de votre repository
   - Si votre repository s'appelle `TP_PWA`, l'URL sera : `https://votre-username.github.io/TP_PWA/`
   - Si votre repository a un nom différent, modifiez le base path dans `vite.config.ts` :
     ```typescript
     base: '/nom-de-votre-repo/',
     ```

3. **Poussez votre code** :
   ```bash
   git add .
   git commit -m "Configuration pour GitHub Pages"
   git push origin main
   ```

### 3. Déploiement

Le déploiement se fait automatiquement :
- **Automatique** : À chaque push sur la branche `main`
- **Manuel** : Via l'onglet **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### 4. Vérification

- Allez dans l'onglet **Actions** de votre repository
- Vérifiez que le workflow "Deploy to GitHub Pages" s'est exécuté avec succès
- L'URL de votre site sera affichée dans les logs du workflow
- Votre site sera disponible à : `https://votre-username.github.io/nom-du-repo/`

## 🔧 Configuration avancée

### Changer le nom de la branche

Si votre branche principale s'appelle `master` au lieu de `main`, modifiez `.github/workflows/deploy.yml` :

```yaml
on:
  push:
    branches:
      - master  # Changez 'main' en 'master'
```

### Déploiement depuis un sous-dossier

Si votre application est dans un sous-dossier du repository, le workflow est déjà configuré pour cela (dossier `progressive_web_app`).

### Base path personnalisé

Pour un base path différent, modifiez `vite.config.ts` :

```typescript
base: '/mon-chemin-personnalise/',
```

## 🐛 Dépannage

### Le site ne se charge pas correctement
- Vérifiez que le base path dans `vite.config.ts` correspond au nom de votre repository
- Vérifiez que tous les assets (images, CSS, JS) sont chargés avec le bon chemin

### Le workflow échoue
- Vérifiez les logs dans l'onglet **Actions**
- Assurez-vous que `package-lock.json` est commité
- Vérifiez que Node.js 20 est disponible (le workflow l'utilise)

### Les chemins des assets sont incorrects
- Le base path doit commencer et se terminer par `/`
- Exemple : `/TP_PWA/` et non `/TP_PWA` ou `TP_PWA/`

## 📝 Notes importantes

- GitHub Pages nécessite HTTPS (automatique)
- Le service worker fonctionnera correctement sur GitHub Pages
- Les mises à jour peuvent prendre quelques minutes à se propager
- Le cache du navigateur peut nécessiter un rafraîchissement forcé (Ctrl+F5 / Cmd+Shift+R)
