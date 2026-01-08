export type Nutriscore = 'A' | 'B' | 'C' | 'D' | 'E';
export type TagCategory = 'diet' | 'cuisine' | 'budget' | 'difficulty' | 'meal_type' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Ingredient {
  id?: number;
  name: string;
  description?: string;
  nutriscore?: Nutriscore;
  calories_per_100g?: number;
  proteins_per_100g?: number;
  carbs_per_100g?: number;
  fats_per_100g?: number;
  fiber_per_100g?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Tag {
  id?: number;
  name: string;
  category: TagCategory;
  description?: string;
  created_at?: Date;
}

export interface Recipe {
  id?: number;
  name: string;
  description?: string;
  instructions?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  estimated_cost?: number;
  nutriscore?: Nutriscore;
  is_external?: boolean;
  external_source?: string;
  created_at?: Date;
  updated_at?: Date;
  ingredients?: RecipeIngredient[];
  tags?: Tag[];
}

export interface RecipeIngredient {
  id?: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
  notes?: string;
  ingredient?: Ingredient;
  ingredient_name?: string; // Added from SQL JOIN
  nutriscore?: Nutriscore;  // Added from SQL JOIN
}

export interface Menu {
  id?: number;
  name: string;
  start_date: Date | string;
  end_date: Date | string;
  cycle_days?: number;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  recipes?: MenuRecipe[];
}

export interface MenuRecipe {
  id?: number;
  menu_id: number;
  recipe_id: number;
  day_of_cycle: number;
  meal_type: MealType;
  servings?: number;
  notes?: string;
  recipe?: Recipe;
}

export interface CalendarEntry {
  id?: number;
  date: Date | string;
  meal_type: MealType;
  recipe_id?: number;
  servings?: number;
  notes?: string;
  nutriscore?: Nutriscore;
  daily_score?: number;
  recipe?: Recipe;
}

export interface MenuSuggestionCriteria {
  cycle_days?: number;
  vegetarian_meals_count?: number;
  excluded_ingredients?: number[];
  diet_tags?: number[];
  cuisine_preference?: number[];
  budget_per_meal?: number;
  servings_per_meal?: number;
  max_prep_time?: number;
  criteria_weights?: {
    [key: string]: number;
  };
}

export interface NutritionScore {
  daily_score: number;
  weekly_score: number;
  monthly_score: number;
  period_score?: number;
  breakdown: {
    nutriscore_distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
    };
    average_calories: number;
    average_proteins: number;
    average_carbs: number;
    average_fats: number;
  };
}
