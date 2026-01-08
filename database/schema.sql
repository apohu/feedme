-- FeedMe Database Schema
-- Drop existing database and create new one
DROP DATABASE IF EXISTS feedme;
CREATE DATABASE feedme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE feedme;
SET NAMES utf8mb4;

-- Table des ingrédients
CREATE TABLE ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  nutriscore ENUM('A', 'B', 'C', 'D', 'E') DEFAULT 'C',
  calories_per_100g DECIMAL(10, 2) DEFAULT 0,
  proteins_per_100g DECIMAL(10, 2) DEFAULT 0,
  carbs_per_100g DECIMAL(10, 2) DEFAULT 0,
  fats_per_100g DECIMAL(10, 2) DEFAULT 0,
  fiber_per_100g DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_nutriscore (nutriscore)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des tags (catégories, styles de cuisine, régimes alimentaires)
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('diet', 'cuisine', 'budget', 'difficulty', 'meal_type', 'other') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des recettes
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings INT DEFAULT 1,
  estimated_cost DECIMAL(10, 2),
  nutriscore ENUM('A', 'B', 'C', 'D', 'E') DEFAULT 'C',
  is_external BOOLEAN DEFAULT FALSE,
  external_source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_nutriscore (nutriscore),
  INDEX idx_is_external (is_external)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison recette-ingrédients
CREATE TABLE recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  notes VARCHAR(255),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_recipe_ingredient (recipe_id, ingredient_id),
  INDEX idx_recipe (recipe_id),
  INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison recette-tags
CREATE TABLE recipe_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_recipe_tag (recipe_id, tag_id),
  INDEX idx_recipe (recipe_id),
  INDEX idx_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des préférences utilisateur (critères et poids)
CREATE TABLE user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preference_key VARCHAR(100) NOT NULL UNIQUE,
  preference_value TEXT,
  weight DECIMAL(5, 2) DEFAULT 1.0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (preference_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des cycles/menus planifiés
CREATE TABLE menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cycle_days INT DEFAULT 7,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison menu-recettes (par jour et type de repas)
CREATE TABLE menu_recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_id INT NOT NULL,
  recipe_id INT NOT NULL,
  day_of_cycle INT NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  servings INT DEFAULT 1,
  notes TEXT,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_menu (menu_id),
  INDEX idx_recipe (recipe_id),
  INDEX idx_day (day_of_cycle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table du calendrier (repas effectivement consommés)
CREATE TABLE calendar_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  recipe_id INT,
  servings INT DEFAULT 1,
  notes TEXT,
  nutriscore ENUM('A', 'B', 'C', 'D', 'E'),
  daily_score DECIMAL(5, 2),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
  INDEX idx_date (date),
  INDEX idx_meal_type (meal_type),
  INDEX idx_recipe (recipe_id),
  UNIQUE KEY unique_date_meal (date, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de quelques tags par défaut
INSERT INTO tags (name, category, description) VALUES
('Végétarien', 'diet', 'Recettes sans viande ni poisson'),
('Végétalien', 'diet', 'Recettes sans produits animaux'),
('Sans gluten', 'diet', 'Recettes sans gluten'),
('Low carb', 'diet', 'Recettes faibles en glucides'),
('Français', 'cuisine', 'Cuisine française'),
('Italien', 'cuisine', 'Cuisine italienne'),
('Asiatique', 'cuisine', 'Cuisine asiatique'),
('Mexicain', 'cuisine', 'Cuisine mexicaine'),
('Petit budget', 'budget', 'Recettes économiques'),
('Budget moyen', 'budget', 'Recettes avec budget moyen'),
('Budget élevé', 'budget', 'Recettes avec ingrédients coûteux'),
('Facile', 'difficulty', 'Recettes faciles à réaliser'),
('Moyen', 'difficulty', 'Recettes de difficulté moyenne'),
('Difficile', 'difficulty', 'Recettes complexes'),
('Petit-déjeuner', 'meal_type', 'Recettes pour le petit-déjeuner'),
('Déjeuner', 'meal_type', 'Recettes pour le déjeuner'),
('Dîner', 'meal_type', 'Recettes pour le dîner'),
('Snack', 'meal_type', 'Encas et collations');

-- Insertion d'ingrédients de base
INSERT INTO ingredients (name, nutriscore, calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g) VALUES
('Tomate', 'A', 18, 0.9, 3.9, 0.2, 1.2),
('Carotte', 'A', 41, 0.9, 10, 0.2, 2.8),
('Poulet', 'B', 165, 31, 0, 3.6, 0),
('Riz blanc', 'B', 130, 2.7, 28, 0.3, 0.4),
('Pâtes', 'B', 131, 5, 25, 1.1, 1.8),
('Huile d\'olive', 'C', 884, 0, 0, 100, 0),
('Beurre', 'D', 717, 0.9, 0.1, 81, 0),
('Fromage', 'D', 402, 25, 1.3, 33, 0),
('Sucre', 'E', 387, 0, 100, 0, 0),
('Farine', 'C', 364, 10, 76, 1, 2.7);

-- Insertion de recettes d'exemple
INSERT INTO recipes (name, description, prep_time_minutes, cook_time_minutes, servings, estimated_cost, nutriscore) VALUES
('Salade de tomates', 'Une salade simple et fraîche', 10, 0, 2, 3.50, 'A'),
('Poulet rôti', 'Poulet rôti au four avec herbes', 15, 60, 4, 12.00, 'B'),
('Pâtes carbonara', 'Pâtes avec sauce crémeuse', 10, 20, 4, 8.00, 'C');

-- Liaison recettes-ingrédients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES
(1, 1, 400, 'g'),
(2, 3, 1200, 'g'),
(3, 5, 400, 'g'),
(3, 8, 100, 'g');

-- Liaison recettes-tags
INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
(1, 1),  -- Salade végétarienne
(1, 9),  -- Petit budget
(1, 12), -- Facile
(2, 10), -- Poulet budget moyen
(2, 13), -- Moyen
(3, 10), -- Carbonara budget moyen
(3, 12); -- Facile

-- Préférences par défaut
INSERT INTO user_preferences (preference_key, preference_value, weight, description) VALUES
('vegetarian_meals_per_week', '3', 1.0, 'Nombre de repas végétariens par semaine'),
('max_prep_time', '45', 0.8, 'Temps de préparation maximum en minutes'),
('preferred_cuisine', 'Français', 1.2, 'Style de cuisine préféré'),
('budget_per_meal', '10', 1.5, 'Budget moyen par repas en euros'),
('servings_per_meal', '2', 1.0, 'Nombre de convives par repas');
