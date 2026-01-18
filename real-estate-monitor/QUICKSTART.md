# 🚀 Guide de Démarrage Rapide

## Étape 1 : Créer un Bot Telegram (5 min)

### 1.1 - Créer le bot
1. Ouvrez **Telegram** sur votre téléphone ou PC
2. Cherchez **@BotFather** (compte officiel vérifié)
3. Démarrez une conversation et envoyez : `/newbot`
4. Choisissez un nom pour votre bot (ex: "Ma Veille Immo")
5. Choisissez un username (doit finir par "bot", ex: "ma_veille_immo_bot")
6. **Copiez le token** qui ressemble à : `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 1.2 - Obtenir votre Chat ID
1. Cherchez **@userinfobot** sur Telegram
2. Démarrez une conversation avec `/start`
3. Le bot vous donnera votre **ID** (ex: `123456789`)
4. **Copiez cet ID**

### 1.3 - Démarrer une conversation avec votre bot
1. Cherchez votre bot par son username (ex: @ma_veille_immo_bot)
2. Appuyez sur **Démarrer** ou envoyez `/start`

⚠️ **Important** : Si vous ne démarrez pas la conversation, le bot ne pourra pas vous envoyer de messages !

---

## Étape 2 : Configurer le Projet (2 min)

### 2.1 - Éditer le fichier .env
```bash
nano .env
```

Remplacez les valeurs :
```env
TELEGRAM_BOT_TOKEN=COLLEZ_VOTRE_TOKEN_ICI
TELEGRAM_CHAT_ID=COLLEZ_VOTRE_CHAT_ID_ICI
SCRAPING_INTERVAL_MINUTES=5
DATABASE_PATH=data/real_estate.db
LOG_LEVEL=INFO
```

Sauvegardez avec `Ctrl+O` puis `Entrée`, quittez avec `Ctrl+X`

### 2.2 - (Optionnel) Personnaliser les critères

Si vous voulez modifier vos critères de recherche :
```bash
nano config.yaml
```

Ajustez les valeurs selon vos besoins.

---

## Étape 3 : Lancer l'Application

### Option A : Avec Docker (Recommandé)

```bash
./start-docker.sh
```

L'application démarre automatiquement !

### Option B : Sans Docker

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer
./start.sh
```

---

## Étape 4 : Vérifier que Tout Fonctionne

### 4.1 - Test de Configuration
```bash
python test_config.py
```

Ce script va vérifier :
- ✅ Les dépendances Python
- ✅ Les variables d'environnement
- ✅ La connexion Telegram
- ✅ La base de données

Si tout est vert, vous êtes bon ! 🎉

### 4.2 - Vérifier les Notifications Telegram

Vous devriez recevoir sur Telegram :
```
✅ Test de connexion réussi !
```

### 4.3 - Accéder à l'API

Ouvrez votre navigateur :
- API Docs : http://localhost:8000/docs
- Statistiques : http://localhost:8000/api/stats
- Annonces : http://localhost:8000/api/listings

---

## 🎯 C'est Parti !

Votre veille immobilière est maintenant active !

### Ce qui va se passer :

1. **Toutes les 5 minutes** : Scraping automatique des sites
2. **Dès qu'une nouvelle annonce correspond** : Vous recevez une notification Telegram
3. **Toutes les annonces** sont sauvegardées en base SQLite

### Notifications Telegram

Vous recevrez des messages comme :
```
🏠 Nouvelle annonce à Cholet !

📍 Adresse : Rue de la République, Cholet
💰 Prix : 125000€
📐 Surface : 85m²
🚪 Pièces : 4
🛏️ Chambres : 3

✅ Critères : jardin, parking
⭐ Score : 95/100

🔗 [Voir l'annonce](https://...)

📅 Publiée le 18/01/2026
🏢 Source : SELOGER
```

---

## 📊 Commandes Utiles

### Voir les logs en temps réel
```bash
# Docker
docker-compose logs -f

# Local
tail -f logs/app.log
```

### Lancer un scraping manuel
```bash
curl -X POST http://localhost:8000/api/scrape/manual
```

### Voir les statistiques
```bash
curl http://localhost:8000/api/stats
```

### Redémarrer l'application
```bash
# Docker
docker-compose restart

# Local
# Ctrl+C puis ./start.sh
```

---

## ❓ Problèmes Fréquents

### "Le bot n'envoie pas de messages"
✅ **Solution** : Avez-vous démarré une conversation avec le bot sur Telegram ? Cherchez-le et envoyez `/start`

### "Token invalide"
✅ **Solution** : Vérifiez que vous avez bien copié le token complet depuis BotFather

### "Chat not found"
✅ **Solution** : Vérifiez votre Chat ID avec @userinfobot

### "Aucune annonce trouvée"
✅ **C'est normal au début** :
- Soit il n'y a vraiment pas d'annonces correspondantes
- Soit les scrapers ont besoin d'être ajustés (voir README.md section "Ajustement des Scrapers")

### "ModuleNotFoundError"
✅ **Solution** :
```bash
pip install -r requirements.txt
```

---

## 🎉 Félicitations !

Votre veille immobilière est opérationnelle. Vous serez désormais le premier informé des nouvelles offres à Cholet qui correspondent à vos critères !

### Prochaines Étapes

1. **Testez pendant quelques jours** pour voir les résultats
2. **Ajustez les critères** si nécessaire dans `config.yaml`
3. **Consultez les annonces** via l'API : http://localhost:8000/docs

---

**Besoin d'aide ?** Consultez le README.md complet pour plus de détails.

**Bonne recherche immobilière ! 🏡**
