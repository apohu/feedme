# 🎭 Installation de Playwright

## Pourquoi Playwright ?

SeLoger (et d'autres sites) bloquent les scrapers simples avec un **403 Forbidden**. Playwright utilise un **vrai navigateur headless** (Chrome/Firefox invisible) pour contourner ces protections.

## 📦 Installation

### Étape 1 : Installer le package Python

```powershell
pip install playwright
```

### Étape 2 : Installer les navigateurs

⚠️ **IMPORTANT** : Playwright a besoin de télécharger les navigateurs (Chromium, Firefox, Webkit).

```powershell
playwright install chromium
```

Cela télécharge ~150 MB de Chromium.

**Alternative (tous les navigateurs)** :
```powershell
playwright install
```

Cela télécharge ~450 MB (Chromium + Firefox + Webkit).

### Étape 3 : Vérifier l'installation

```powershell
playwright --version
```

Devrait afficher : `Version 1.40.0`

---

## 🚀 Utilisation

Le scraper SeLoger utilise maintenant automatiquement Playwright !

**Aucun changement de code nécessaire** - il fonctionne exactement comme avant, mais avec un vrai navigateur.

### Redémarrer l'application

```powershell
python main.py
```

Tu devrais voir :
```
[seloger] Initializing Playwright browser...
[seloger] Browser initialized successfully
[seloger] Fetching URL with browser...
```

---

## ⚙️ Configuration

### Mode Headless (par défaut)

Le navigateur est **invisible** par défaut. C'est ce qu'on veut en production.

### Mode Visible (pour debug)

Si tu veux **voir le navigateur** s'ouvrir (utile pour débugger), modifie `config.yaml` :

```yaml
scraping:
  headless: false  # Ajoute cette ligne
  interval_minutes: 5
  ...
```

Tu verras alors une fenêtre Chrome s'ouvrir et naviguer sur SeLoger ! 🎬

---

## 🐛 Dépannage

### "playwright: command not found"

Solution :
```powershell
python -m playwright install chromium
```

### "Browser was not installed"

Solution :
```powershell
playwright install --force chromium
```

### L'app est plus lente qu'avant

**Normal !** Playwright lance un vrai navigateur, c'est plus lent qu'un simple HTTP request.

- **Avant** : ~100ms par page
- **Avec Playwright** : ~2-5 secondes par page

Mais c'est le prix pour contourner les protections ! 💪

### Trop de RAM utilisée

Playwright utilise ~150-200 MB de RAM par instance de navigateur.

Pour réduire :
1. Augmente l'intervalle de scraping (moins de requêtes)
2. Limite le nombre de scrapers actifs simultanément

---

## 📊 Performance

### Avantages
- ✅ Contourne les 403 Forbidden
- ✅ Exécute le JavaScript
- ✅ Se comporte comme un vrai utilisateur
- ✅ Supporte les sites modernes (React, Vue, etc.)

### Inconvénients
- ⚠️ Plus lent (~2-5s par page au lieu de 100ms)
- ⚠️ Plus de RAM (~150 MB par navigateur)
- ⚠️ Installation plus complexe

---

## 🔧 Avancé

### Changer de navigateur

Par défaut : Chromium

Pour utiliser Firefox :
```python
# Dans browser_scraper.py, ligne 32
self.browser = self.playwright.firefox.launch(...)
```

Pour utiliser WebKit (Safari) :
```python
self.browser = self.playwright.webkit.launch(...)
```

### Ajouter des cookies/localStorage

Pour simuler une session authentifiée, tu peux ajouter des cookies :

```python
# Dans browser_scraper.py
self.context = self.browser.new_context(
    storage_state={
        'cookies': [
            {'name': 'session', 'value': 'abc123', 'domain': '.seloger.com', 'path': '/'}
        ]
    }
)
```

---

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/python/)
- [Exemples de scraping](https://playwright.dev/python/docs/scraping)
- [Sélecteurs CSS](https://playwright.dev/python/docs/selectors)

---

Bon scraping ! 🚀
