import { Request, Response } from 'express';
import { CalendarEntryModel } from '../models/CalendarEntry';
import { CalendarEntry } from '../types';

export const getEntriesByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = new Date(req.params.date);
    const entries = await CalendarEntryModel.getByDate(date);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des entrées' });
  }
};

export const getEntriesByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const entries = await CalendarEntryModel.getByDateRange(startDate, endDate);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des entrées' });
  }
};

export const createEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry: CalendarEntry = req.body;
    const id = await CalendarEntryModel.create(entry);
    res.status(201).json({ id, message: 'Entrée créée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'entrée' });
  }
};

export const updateEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const entry: Partial<CalendarEntry> = req.body;
    const success = await CalendarEntryModel.update(id, entry);

    if (!success) {
      res.status(404).json({ error: 'Entrée non trouvée' });
      return;
    }

    res.json({ message: 'Entrée mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entrée' });
  }
};

export const deleteEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const success = await CalendarEntryModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'Entrée non trouvée' });
      return;
    }

    res.json({ message: 'Entrée supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'entrée' });
  }
};

export const calculateScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    const score = await CalendarEntryModel.calculateNutritionScore(startDate, endDate);
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du calcul du score nutritionnel' });
  }
};
