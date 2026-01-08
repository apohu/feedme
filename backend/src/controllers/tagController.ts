import { Request, Response } from 'express';
import { TagModel } from '../models/Tag';
import { Tag, TagCategory } from '../types';

export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await TagModel.getAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tags' });
  }
};

export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const tag = await TagModel.getById(id);

    if (!tag) {
      res.status(404).json({ error: 'Tag non trouvé' });
      return;
    }

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du tag' });
  }
};

export const getTagsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryParam = req.params.category;
    if (!categoryParam) {
      res.status(400).json({ error: 'Catégorie manquante' });
      return;
    }
    const category = categoryParam as TagCategory;
    const tags = await TagModel.getByCategory(category);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tags par catégorie' });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tag: Tag = req.body;
    const id = await TagModel.create(tag);
    res.status(201).json({ id, message: 'Tag créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du tag' });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const tag: Partial<Tag> = req.body;
    const success = await TagModel.update(id, tag);

    if (!success) {
      res.status(404).json({ error: 'Tag non trouvé' });
      return;
    }

    res.json({ message: 'Tag mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du tag' });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) { res.status(400).json({ error: 'ID manquant' }); return; }
    const id = parseInt(idParam);
    const success = await TagModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'Tag non trouvé' });
      return;
    }

    res.json({ message: 'Tag supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du tag' });
  }
};
