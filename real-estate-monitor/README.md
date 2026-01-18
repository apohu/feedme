# 🏠 Scraping Immobilier - Veille Cholet

Application de veille immobilière pour être le premier informé des nouvelles offres à Cholet !

## 🎯 Fonctionnalités

- **Scraping automatique** de multiples sites d'agences immobilières (SeLoger, Foncia, Citya, etc.)
- **Filtrage intelligent** selon vos critères personnalisés
- **Notifications Telegram** instantanées pour chaque nouvelle annonce correspondante
- **API REST** pour consulter les annonces et les statistiques
- **Scheduler** configurable pour un scraping périodique
- **Base SQLite** pour historiser toutes les annonces

## 📋 Critères de Recherche (Configurés pour Cholet)

### Localisation
- **Ville** : Cholet intra-muros uniquement (49300)
- **Rayon** : 0 km (pas de villes alentours)

### Critères du Bien
- **Type** : Maison uniquement
- **Surface** : Minimum 70 m²
- **Pièces** : 3 pièces (idéal) ou 2 chambres si > 70 m²
- **Budget Achat** : Maximum 135 000 €
- **Budget Location** : Maximum 700 €/mois CC

### Critères Obligatoires
- Jardin (même minime)

### Critères Recommandés
- Parking
- Garage

### Critères Rédhibitoires
- Maison double mitoyenne

## 🚀 Installation

### Option 1 : Docker (Recommandé)

1. **Cloner le repo**
```bash
git clone https://github.com/votre-username/scrapImmo.git
cd scrapImmo
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
nano .env  # Éditer avec vos credentials Telegram
```

3. **Lancer avec Docker**
```bash
chmod +x start-docker.sh
./start-docker.sh
```

### Option 2 : Installation Locale

1. **Prérequis**
- Python 3.11+
- pip

2. **Installation**
```bash
git clone https://github.com/votre-username/scrapImmo.git
cd scrapImmo

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

3. **Configurer**
```bash
cp .env.example .env
nano .env  # Éditer avec vos credentials
```

4. **Lancer**
```bash
chmod +x start.sh
./start.sh
```

## 🔑 Configuration Telegram

### Créer un Bot Telegram

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Suivez les instructions et choisissez un nom
4. Copiez le **token** fourni
5. Collez-le dans `.env` : `TELEGRAM_BOT_TOKEN=votre_token`

### Obtenir votre Chat ID

1. Cherchez **@userinfobot** sur Telegram
2. Démarrez une conversation avec `/start`
3. Le bot vous donnera votre **ID**
4. Collez-le dans `.env` : `TELEGRAM_CHAT_ID=votre_chat_id`

### Tester la Connexion

Une fois l'application démarrée, vous devriez recevoir un message :
```
✅ Bot de veille immobilière connecté avec succès !
```

## ⚙️ Configuration

### Fichier `config.yaml`

Le fichier `config.yaml` contient tous les paramètres de recherche :

```yaml
location:
  city: "Cholet"
  postal_code: "49300"
  radius_km: 0

criteria:
  property_type: "maison"
  surface_min_m2: 70
  rooms_min: 3
  bedrooms_min: 2
  budget_max:
    achat: 135000
    location: 700
  required_features:
    - "jardin"
  preferred_features:
    - "parking"
    - "garage"
  excluded_features:
    - "mitoyenne double"

scraping:
  interval_minutes: 5  # Scraping toutes les 5 minutes
  timeout_seconds: 30
  retry_attempts: 3
```

Vous pouvez modifier ces paramètres selon vos besoins.

### Fichier `.env`

Variables d'environnement sensibles :

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
SCRAPING_INTERVAL_MINUTES=5
DATABASE_PATH=data/real_estate.db
LOG_LEVEL=INFO
```

## 📡 API REST

L'application expose une API REST sur `http://localhost:8000`

### Endpoints Principaux

- **GET /api/listings** - Liste des annonces
  - `?matching_only=true` - Seulement les annonces correspondantes
  - `?source=seloger` - Filtrer par source
  - `?limit=50` - Limiter le nombre de résultats

- **GET /api/listings/{id}** - Détails d'une annonce

- **GET /api/stats** - Statistiques globales

- **POST /api/scrape/manual** - Lancer un scraping manuel

- **GET /api/config** - Voir la configuration actuelle

### Documentation Interactive

Accédez à la documentation Swagger :
```
http://localhost:8000/docs
```

## 🔍 Sources de Données

### Sites Prioritaires (V1 - Implémentés)
- ✅ SeLoger.com
- ✅ Foncia.fr
- ✅ Citya.com

### Sites Secondaires (À venir)
- O'Coeur de l'Immo
- Safti
- Côté Particuliers
- Sevre Loire Habitat
- Square Habitat
- Griffon Choloux
- Nestenn
- La Forêt
- Logic Immo
- AJP Immobilier
- Orpi
- Century 21
- L'Adresse
- Vivre Ici
- Hyacinthe Immobilier
- Agence LENAIN

## 🛠️ Architecture Technique

### Stack Technologique
- **Backend** : Python 3.11 + FastAPI
- **Scraping** : BeautifulSoup + Requests
- **Base de données** : SQLite
- **Scheduler** : APScheduler
- **Notifications** : python-telegram-bot
- **Conteneurisation** : Docker + Docker Compose

### Structure du Projet
```
scrapImmo/
├── app/
│   ├── models/          # Modèles de données (SQLAlchemy)
│   ├── scrapers/        # Scrapers par site
│   ├── services/        # Services métier
│   ├── api/             # Routes FastAPI
│   └── scheduler.py     # Orchestration
├── data/                # Base SQLite
├── logs/                # Fichiers de logs
├── config.yaml          # Configuration
├── .env                 # Variables d'environnement
├── main.py              # Point d'entrée
└── docker-compose.yml   # Configuration Docker
```

## 📊 Fonctionnement

1. **Scraping Périodique** : Toutes les X minutes (configurable), l'app scrape les sites configurés
2. **Filtrage** : Chaque annonce est comparée aux critères définis
3. **Déduplication** : Les annonces déjà vues ne sont pas re-notifiées
4. **Scoring** : Chaque annonce reçoit un score de matching (0-100)
5. **Notification** : Les nouvelles annonces correspondantes sont envoyées sur Telegram
6. **Historisation** : Toutes les annonces sont sauvegardées en base

## 🔧 Commandes Utiles

### Docker
```bash
# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Reconstruire
docker-compose up --build -d
```

### API
```bash
# Lancer un scraping manuel
curl -X POST http://localhost:8000/api/scrape/manual

# Voir les statistiques
curl http://localhost:8000/api/stats

# Lister les annonces correspondantes
curl http://localhost:8000/api/listings?matching_only=true
```

## 📝 Logs

Les logs sont disponibles dans :
- `logs/app.log` - Logs de l'application
- Console Docker - `docker-compose logs -f`

Niveaux de logs configurables dans `.env` :
- `DEBUG` - Très verbeux
- `INFO` - Normal (recommandé)
- `WARNING` - Avertissements uniquement
- `ERROR` - Erreurs uniquement

## ⚠️ Important - Scrapers

**Note** : Les scrapers sont fournis avec une structure de base. Les sélecteurs CSS devront être ajustés après inspection des sites web réels car :

1. Les structures HTML changent fréquemment
2. Certains sites utilisent du JavaScript pour charger le contenu
3. Des mécanismes anti-scraping peuvent être en place

### Ajustement des Scrapers

Pour ajuster un scraper :

1. Inspecter le HTML du site cible
2. Identifier les bons sélecteurs CSS
3. Modifier le fichier correspondant dans `app/scrapers/`
4. Tester avec un scraping manuel

### Alternatives si le Scraping Échoue

Si un site bloque le scraping :
- Utiliser Selenium/Playwright pour les sites JavaScript
- Implémenter des proxies rotatifs
- Utiliser une API officielle si disponible

## 🚨 Limitations et Considérations

### Légalité
- Le web scraping peut être soumis aux CGU des sites
- Respectez les robots.txt
- Ne surchargez pas les serveurs (délais entre requêtes)
- Usage personnel uniquement

### Performance
- Scraping toutes les 5 minutes = 12 fois par heure
- Ajuster selon votre besoin vs charge serveur

### Fiabilité
- Les sites peuvent changer leur structure HTML
- Les sites peuvent bloquer les scrapers
- Certaines annonces peuvent être manquées

## 🔜 Améliorations Futures

- [ ] Ajouter plus de sources (agences secondaires)
- [ ] Interface web pour visualiser les annonces
- [ ] Alertes par email en plus de Telegram
- [ ] Analyse de tendances de prix
- [ ] Export des données (CSV, Excel)
- [ ] Notifications WhatsApp
- [ ] Support multi-villes
- [ ] Machine Learning pour scoring personnalisé

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Auteur

Créé pour une veille immobilière efficace à Cholet.

## 🙏 Remerciements

- BeautifulSoup pour le parsing HTML
- FastAPI pour l'API moderne
- python-telegram-bot pour les notifications
- La communauté open-source Python

---

**Note** : Ce projet est un POC (Proof of Concept). En production, envisagez des solutions plus robustes comme Scrapy, Selenium ou des APIs officielles d'agrégateurs immobiliers.
