import { Recipe, MenuSuggestionCriteria, MealType } from '../types';
import { RecipeModel } from '../models/Recipe';

interface ScoredRecipe extends Recipe {
  score: number;
}

export class MenuSuggestionService {
  static async generateMenuSuggestions(criteria: MenuSuggestionCriteria): Promise<Recipe[]> {
    const cycleDays = criteria.cycle_days || 7;
    const mealsPerDay = 3; // breakfast, lunch, dinner
    const totalMeals = cycleDays * mealsPerDay;

    // Récupérer les recettes candidates
    const searchCriteria: {
      tags?: number[];
      maxCost?: number;
      maxPrepTime?: number;
      excludeIngredients?: number[];
    } = {};

    if (criteria.diet_tags) {
      searchCriteria.tags = criteria.diet_tags;
    }
    if (criteria.budget_per_meal) {
      searchCriteria.maxCost = criteria.budget_per_meal;
    }
    if (criteria.max_prep_time) {
      searchCriteria.maxPrepTime = criteria.max_prep_time;
    }
    if (criteria.excluded_ingredients) {
      searchCriteria.excludeIngredients = criteria.excluded_ingredients;
    }

    const candidateRecipes = await RecipeModel.searchByCriteria(searchCriteria);

    if (candidateRecipes.length === 0) {
      throw new Error('Aucune recette ne correspond aux critères');
    }

    // Enrichir chaque recette avec ses tags et ingrédients
    const enrichedRecipes = await Promise.all(
      candidateRecipes.map(async (recipe) => {
        const fullRecipe = await RecipeModel.getById(recipe.id!);
        return fullRecipe!;
      })
    );

    // Scorer les recettes selon les critères
    const scoredRecipes = this.scoreRecipes(enrichedRecipes, criteria);

    // Sélectionner les recettes pour le menu
    const selectedRecipes = this.selectRecipes(scoredRecipes, totalMeals, criteria);

    return selectedRecipes;
  }

  private static scoreRecipes(recipes: Recipe[], criteria: MenuSuggestionCriteria): ScoredRecipe[] {
    const weights = criteria.criteria_weights || {};

    return recipes.map((recipe) => {
      let score = 0;

      // Score basé sur le nutriscore (A=5, B=4, C=3, D=2, E=1)
      const nutriscoreValue = { A: 5, B: 4, C: 3, D: 2, E: 1 }[recipe.nutriscore || 'C'];
      score += nutriscoreValue * (weights.nutriscore || 2.0);

      // Score basé sur le coût (moins cher = meilleur)
      if (recipe.estimated_cost && criteria.budget_per_meal) {
        const costRatio = 1 - (recipe.estimated_cost / criteria.budget_per_meal);
        score += Math.max(0, costRatio * 5) * (weights.budget || 1.5);
      }

      // Score basé sur le temps de préparation (plus rapide = meilleur)
      if (recipe.prep_time_minutes && criteria.max_prep_time) {
        const timeRatio = 1 - (recipe.prep_time_minutes / criteria.max_prep_time);
        score += Math.max(0, timeRatio * 3) * (weights.prep_time || 1.0);
      }

      // Score basé sur les tags préférés
      if (criteria.cuisine_preference && recipe.tags) {
        const hasPreferredCuisine = recipe.tags.some(
          (tag) => criteria.cuisine_preference!.includes(tag.id!)
        );
        if (hasPreferredCuisine) {
          score += 3 * (weights.cuisine || 1.2);
        }
      }

      // Bonus pour les recettes végétariennes si demandé
      if (criteria.vegetarian_meals_count && recipe.tags) {
        const isVegetarian = recipe.tags.some(
          (tag) => tag.name.toLowerCase().includes('végétarien')
        );
        if (isVegetarian) {
          score += 2 * (weights.vegetarian || 1.0);
        }
      }

      // Ajout d'un facteur aléatoire pour la diversité (10% de variation)
      score *= (0.95 + Math.random() * 0.1);

      return {
        ...recipe,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }

  private static selectRecipes(
    scoredRecipes: ScoredRecipe[],
    totalMeals: number,
    criteria: MenuSuggestionCriteria
  ): Recipe[] {
    const selected: Recipe[] = [];
    const usedRecipes = new Set<number>();

    // Calculer combien de repas végétariens sont nécessaires
    const vegetarianMealsNeeded = criteria.vegetarian_meals_count || 0;
    let vegetarianMealsSelected = 0;

    // Séparer les recettes végétariennes et non-végétariennes
    const vegetarianRecipes = scoredRecipes.filter((r) =>
      r.tags?.some((tag) => tag.name.toLowerCase().includes('végétarien'))
    );
    const nonVegetarianRecipes = scoredRecipes.filter((r) =>
      !r.tags?.some((tag) => tag.name.toLowerCase().includes('végétarien'))
    );

    // Sélectionner d'abord les repas végétariens si nécessaire
    for (let i = 0; i < vegetarianMealsNeeded && vegetarianMealsSelected < vegetarianRecipes.length; i++) {
      const recipe = vegetarianRecipes[vegetarianMealsSelected];
      if (recipe && recipe.id) {
        selected.push(recipe);
        usedRecipes.add(recipe.id);
        vegetarianMealsSelected++;
      }
    }

    // Compléter avec d'autres recettes
    let currentIndex = 0;
    while (selected.length < totalMeals && currentIndex < scoredRecipes.length) {
      const recipe = scoredRecipes[currentIndex];
      if (recipe && recipe.id && !usedRecipes.has(recipe.id)) {
        selected.push(recipe);
        usedRecipes.add(recipe.id);
      }
      currentIndex++;
    }

    // Si pas assez de recettes, dupliquer les meilleures
    while (selected.length < totalMeals && scoredRecipes.length > 0) {
      const recipe = scoredRecipes[selected.length % scoredRecipes.length];
      if (recipe) {
        selected.push(recipe);
      } else {
        break; // Pas de recettes disponibles
      }
    }

    // Mélanger pour la diversité
    return this.shuffleArray(selected);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      const tempJ = shuffled[j];
      if (temp !== undefined && tempJ !== undefined) {
        shuffled[i] = tempJ;
        shuffled[j] = temp;
      }
    }
    return shuffled;
  }

  static distributeMealsInMenu(
    recipes: Recipe[],
    cycleDays: number
  ): { [day: number]: { [mealType: string]: Recipe } } {
    const menu: { [day: number]: { [mealType: string]: Recipe } } = {};
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

    let recipeIndex = 0;

    for (let day = 1; day <= cycleDays; day++) {
      menu[day] = {};
      for (const mealType of mealTypes) {
        if (recipeIndex < recipes.length) {
          const recipe = recipes[recipeIndex];
          if (recipe) {
            menu[day][mealType] = recipe;
            recipeIndex++;
          }
        }
      }
    }

    return menu;
  }
}
