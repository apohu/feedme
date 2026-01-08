import { Request, Response } from 'express';
import { IngredientModel } from '../models/Ingredient';
import { Ingredient } from '../types';

export const getAllIngredients = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredients = await IngredientModel.getAll();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des ingrédients' });
  }
};

export const getIngredientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const ingredient = await IngredientModel.getById(id);

    if (!ingredient) {
      res.status(404).json({ error: 'Ingrédient non trouvé' });
      return;
    }

    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'ingrédient' });
  }
};

export const createIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredient: Ingredient = req.body;
    const id = await IngredientModel.create(ingredient);
    res.status(201).json({ id, message: 'Ingrédient créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'ingrédient' });
  }
};

export const updateIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const ingredient: Partial<Ingredient> = req.body;
    const success = await IngredientModel.update(id, ingredient);

    if (!success) {
      res.status(404).json({ error: 'Ingrédient non trouvé' });
      return;
    }

    res.json({ message: 'Ingrédient mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'ingrédient' });
  }
};

export const deleteIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const success = await IngredientModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'Ingrédient non trouvé' });
      return;
    }

    res.json({ message: 'Ingrédient supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'ingrédient' });
  }
};

export const searchIngredients = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = (req.query.name as string) || '';
    const ingredients = await IngredientModel.search(name);
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la recherche d\'ingrédients' });
  }
};
