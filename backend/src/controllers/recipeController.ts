import { Request, Response } from 'express';
import { RecipeModel } from '../models/Recipe';
import { Recipe } from '../types';

export const getAllRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📚 getAllRecipes appelé');
    const recipes = await RecipeModel.getAll();
    console.log(`✅ ${recipes.length} recettes récupérées`);
    res.json(recipes);
  } catch (error) {
    console.error('❌ Erreur getAllRecipes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des recettes' });
  }
};

export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ error: 'ID manquant' });
      return;
    }
    const id = parseInt(idParam);
    const recipe = await RecipeModel.getById(id);

    if (!recipe) {
      res.status(404).json({ error: 'Recette non trouvée' });
      return;
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la recette' });
  }
};

export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('➕ createRecipe appelé avec:', JSON.stringify(req.body, null, 2));
    const recipe: Recipe = req.body;
    const id = await RecipeModel.create(recipe);
    console.log(`✅ Recette créée avec ID: ${id}`);
    res.status(201).json({ id, message: 'Recette créée avec succès' });
  } catch (error) {
    console.error('❌ Erreur createRecipe:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la recette' });
  }
};

export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ error: 'ID manquant' });
      return;
    }
    const id = parseInt(idParam);
    const recipe: Partial<Recipe> = req.body;
    const success = await RecipeModel.update(id, recipe);

    if (!success) {
      res.status(404).json({ error: 'Recette non trouvée' });
      return;
    }

    res.json({ message: 'Recette mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la recette' });
  }
};

export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ error: 'ID manquant' });
      return;
    }
    const id = parseInt(idParam);
    const success = await RecipeModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'Recette non trouvée' });
      return;
    }

    res.json({ message: 'Recette supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la recette' });
  }
};

export const searchRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const criteria: {
      tags?: number[];
      maxCost?: number;
      maxPrepTime?: number;
      nutriscore?: string[];
      excludeIngredients?: number[];
    } = {};

    if (req.query.tags) {
      criteria.tags = (req.query.tags as string).split(',').map(Number);
    }
    if (req.query.maxCost) {
      criteria.maxCost = parseFloat(req.query.maxCost as string);
    }
    if (req.query.maxPrepTime) {
      criteria.maxPrepTime = parseInt(req.query.maxPrepTime as string);
    }
    if (req.query.nutriscore) {
      criteria.nutriscore = (req.query.nutriscore as string).split(',');
    }
    if (req.query.excludeIngredients) {
      criteria.excludeIngredients = (req.query.excludeIngredients as string).split(',').map(Number);
    }

    const recipes = await RecipeModel.searchByCriteria(criteria);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la recherche de recettes' });
  }
};

export const addIngredientToRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ error: 'ID manquant' });
      return;
    }
    const recipeId = parseInt(idParam);
    const { ingredientId, quantity, unit } = req.body;

    await RecipeModel.addIngredient(recipeId, ingredientId, quantity, unit);
    res.json({ message: 'Ingrédient ajouté à la recette avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'ingrédient' });
  }
};

export const addTagToRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ error: 'ID manquant' });
      return;
    }
    const recipeId = parseInt(idParam);
    const { tagId } = req.body;

    await RecipeModel.addTag(recipeId, tagId);
    res.json({ message: 'Tag ajouté à la recette avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du tag' });
  }
};
