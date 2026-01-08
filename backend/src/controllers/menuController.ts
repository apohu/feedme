import { Request, Response } from 'express';
import { MenuModel } from '../models/Menu';
import { MenuSuggestionService } from '../services/MenuSuggestionService';
import { Menu, MenuSuggestionCriteria } from '../types';

export const getAllMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const menus = await MenuModel.getAll();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des menus' });
  }
};

export const getMenuById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const menu = await MenuModel.getById(id);

    if (!menu) {
      res.status(404).json({ error: 'Menu non trouvé' });
      return;
    }

    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu' });
  }
};

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const menu: Menu = req.body;
    const id = await MenuModel.create(menu);
    res.status(201).json({ id, message: 'Menu créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du menu' });
  }
};

export const generateMenuSuggestion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 Requête reçue - Body:', JSON.stringify(req.body, null, 2));
    console.log('📥 Content-Type:', req.headers['content-type']);

    const criteria: MenuSuggestionCriteria = req.body;

    if (!criteria || Object.keys(criteria).length === 0) {
      console.log('⚠️ Critères vides ou non définis');
      res.status(400).json({ error: 'Critères de recherche manquants' });
      return;
    }

    console.log('🔍 Critères de recherche reçus:', JSON.stringify(criteria, null, 2));

    const suggestedRecipes = await MenuSuggestionService.generateMenuSuggestions(criteria);
    console.log('✅ Recettes trouvées:', suggestedRecipes.length);

    const distributedMenu = MenuSuggestionService.distributeMealsInMenu(
      suggestedRecipes,
      criteria.cycle_days || 7
    );

    console.log('📤 Envoi de la réponse avec', suggestedRecipes.length, 'recettes');

    res.json({
      recipes: suggestedRecipes,
      distribution: distributedMenu,
      message: 'Suggestion de menu générée avec succès'
    });
  } catch (error: any) {
    console.error('❌ Erreur génération menu:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération de suggestions' });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const menu: Partial<Menu> = req.body;
    const success = await MenuModel.update(id, menu);

    if (!success) {
      res.status(404).json({ error: 'Menu non trouvé' });
      return;
    }

    res.json({ message: 'Menu mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const success = await MenuModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'Menu non trouvé' });
      return;
    }

    res.json({ message: 'Menu supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du menu' });
  }
};
