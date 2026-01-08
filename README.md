# FeedMe - Application de Gestion Alimentaire

Application web complète pour gérer votre alimentation au quotidien avec des suggestions de menus personnalisées et un suivi nutritionnel.

## 🚀 Fonctionnalités

### 1. Gestion des Recettes
- Créer et organiser vos recettes avec ingrédients et tags
- Informations nutritionnelles détaillées
- Score Nutriscore (A à E)
- Estimation du coût et temps de préparation
- Support pour recettes externes (restaurants, fast-food, etc.)

### 2. Suggestion de Menus Intelligente
- Génération automatique de menus sur un cycle personnalisable (par défaut 1 semaine)
- Critères configurables :
  - Nombre de repas végétariens
  - Ingrédients exclus
  - Régime alimentaire spécifique
  - Style de cuisine (par pays, budget, difficulté)
  - Nombre de convives
  - Budget maximum par repas
  - Temps de préparation maximum
- Pondération personnalisable de chaque critère
- Algorithme mixte : règles + aléatoire + scoring

### 3. Calendrier Alimentaire Interactif
- Renseigner les plats consommés chaque jour
- Vue hebdomadaire avec tous les repas
- Score nutritionnel :
  - Par jour
  - Par semaine
  - Par mois
  - Sur période personnalisée
- Distribution des Nutriscores
- Statistiques nutritionnelles (calories, protéines, glucides, lipides)

### 4. Base de Données Complète
- Ingrédients avec informations nutritionnelles
- Tags par catégories (régime, cuisine, budget, difficulté, type de repas)
- Système de liaison flexible

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MySQL** pour la base de données
- Architecture MVC (Models, Controllers, Routes, Services)

### Frontend
- **Angular** (standalone components)
- **SCSS** pour les styles
- Routing Angular
- HttpClient pour les appels API

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- MySQL 8+
- Angular CLI (optionnel mais recommandé)

### 1. Cloner le repository
```bash
git clone <repository-url>
cd feedme
```

### 2. Configuration de la base de données

#### Créer la base de données
```bash
mysql -u root -p < database/schema.sql
```

Le script créera :
- La base de données `feedme`
- Toutes les tables nécessaires
- Des données d'exemple (tags, ingrédients, recettes)

#### Configuration de la connexion
Copier et éditer le fichier `.env` dans le dossier `backend` :

```bash
cd backend
cp .env.example .env
```

Éditer `.env` avec vos paramètres MySQL :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=feedme
```

### 3. Installation du Backend

```bash
cd backend
npm install
```

### 4. Installation du Frontend

```bash
cd frontend
npm install
```

## 🚀 Démarrage

### Démarrer le Backend
```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

API disponible sur : `http://localhost:3000/api`

### Démarrer le Frontend
```bash
cd frontend
npm start
```

L'application s'ouvre sur `http://localhost:4200`

## 📡 API Endpoints

### Recettes
- `GET /api/recipes` - Liste toutes les recettes
- `GET /api/recipes/:id` - Détails d'une recette
- `GET /api/recipes/search` - Recherche avec critères
- `POST /api/recipes` - Créer une recette
- `PUT /api/recipes/:id` - Modifier une recette
- `DELETE /api/recipes/:id` - Supprimer une recette

### Ingrédients
- `GET /api/ingredients` - Liste tous les ingrédients
- `GET /api/ingredients/:id` - Détails d'un ingrédient
- `GET /api/ingredients/search?name=...` - Recherche par nom
- `POST /api/ingredients` - Créer un ingrédient
- `PUT /api/ingredients/:id` - Modifier un ingrédient
- `DELETE /api/ingredients/:id` - Supprimer un ingrédient

### Tags
- `GET /api/tags` - Liste tous les tags
- `GET /api/tags/:id` - Détails d'un tag
- `GET /api/tags/category/:category` - Tags par catégorie
- `POST /api/tags` - Créer un tag
- `PUT /api/tags/:id` - Modifier un tag
- `DELETE /api/tags/:id` - Supprimer un tag

### Menus
- `GET /api/menus` - Liste tous les menus
- `GET /api/menus/:id` - Détails d'un menu
- `POST /api/menus` - Créer un menu
- `POST /api/menus/suggest` - Générer une suggestion
- `PUT /api/menus/:id` - Modifier un menu
- `DELETE /api/menus/:id` - Supprimer un menu

### Calendrier
- `GET /api/calendar/date/:date` - Entrées d'un jour
- `GET /api/calendar/range?startDate=...&endDate=...` - Entrées sur une période
- `GET /api/calendar/score?startDate=...&endDate=...` - Score nutritionnel
- `POST /api/calendar` - Créer une entrée
- `PUT /api/calendar/:id` - Modifier une entrée
- `DELETE /api/calendar/:id` - Supprimer une entrée

## 🏗️ Architecture

### Structure du Projet
```
feedme/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── config/         # Configuration (DB)
│   │   ├── models/         # Modèles de données
│   │   ├── controllers/    # Logique métier
│   │   ├── routes/         # Routes Express
│   │   ├── services/       # Services (algorithme de suggestion)
│   │   ├── types/          # Types TypeScript
│   │   └── index.ts        # Point d'entrée
│   └── package.json
├── frontend/               # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Composants Angular
│   │   │   ├── services/   # Services HTTP
│   │   │   ├── models/     # Types/Interfaces
│   │   │   └── app.*.ts    # Configuration app
│   │   └── environments/   # Configuration environnement
│   └── package.json
├── database/               # Scripts SQL
│   └── schema.sql         # Schéma complet de la DB
└── README.md              # Ce fichier
```

### Schéma de Base de Données

**Tables principales :**
- `ingredients` - Ingrédients avec infos nutritionnelles
- `tags` - Tags de catégorisation
- `recipes` - Recettes
- `recipe_ingredients` - Liaison recettes-ingrédients
- `recipe_tags` - Liaison recettes-tags
- `menus` - Cycles de menus planifiés
- `menu_recipes` - Liaison menus-recettes par jour/repas
- `calendar_entries` - Repas effectivement consommés
- `user_preferences` - Préférences utilisateur

## 🎯 Utilisation

### 1. Créer des Ingrédients et Tags
Utiliser l'interface ou l'API pour ajouter vos ingrédients et tags personnalisés.

### 2. Créer des Recettes
- Ajouter le nom, description, instructions
- Lier les ingrédients avec quantités
- Ajouter des tags (régime, cuisine, etc.)
- Définir le nutriscore, coût, temps de préparation

### 3. Générer un Menu
- Aller dans "Suggestion de Menu"
- Définir vos critères (nombre de jours, budget, préférences)
- Cliquer sur "Générer le menu"
- Visualiser et sauvegarder le menu suggéré

### 4. Suivre votre Alimentation
- Aller dans "Calendrier"
- Ajouter les repas consommés chaque jour
- Consulter votre score nutritionnel
- Analyser les tendances hebdomadaires/mensuelles

## 🔧 Algorithme de Suggestion

L'algorithme utilise une approche multi-critères :

1. **Scoring des recettes** basé sur :
   - Nutriscore (poids : 2.0)
   - Budget (poids : 1.5)
   - Temps de préparation (poids : 1.0)
   - Cuisine préférée (poids : 1.2)
   - Végétarien si demandé (poids : 1.0)

2. **Sélection intelligente** :
   - Respect du nombre de repas végétariens
   - Exclusion des ingrédients indésirables
   - Éviter les répétitions
   - Facteur aléatoire pour la diversité

3. **Distribution optimale** :
   - Répartition sur le cycle demandé
   - Organisation par type de repas
   - Mélange pour variété

## 📊 Score Nutritionnel

Le score est calculé sur la base des Nutriscores des repas :
- **A = 5 points** (meilleur)
- **B = 4 points**
- **C = 3 points**
- **D = 2 points**
- **E = 1 point** (moins bon)

Le score final est normalisé sur 100 avec une répartition détaillée par catégorie.

## 🚧 Développement Futur

Fonctionnalités potentielles :
- [ ] Authentification multi-utilisateurs
- [ ] Export PDF des menus
- [ ] Intégration API externes de recettes
- [ ] Application mobile
- [ ] Partage de recettes entre utilisateurs
- [ ] Système de favoris
- [ ] Historique et tendances
- [ ] Recommandations basées sur l'IA
- [ ] Liste de courses automatique

## 📝 License

Ce projet est sous licence ISC.

## 👨‍💻 Auteur

Développé avec ❤️ pour une alimentation équilibrée

---

**Note :** Cette application est conçue pour un usage local et éducatif. Pour un usage en production, ajoutez des mesures de sécurité appropriées (authentification, validation, rate limiting, etc.).