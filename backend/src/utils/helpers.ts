import { Request, Response } from 'express';

export const getIdParam = (req: Request, res: Response): number | null => {
  const idParam = req.params.id;
  if (!idParam) {
    res.status(400).json({ error: 'ID manquant' });
    return null;
  }
  return parseInt(idParam);
};

export const getDateParam = (req: Request, res: Response, paramName: string): string | null => {
  const dateParam = req.params[paramName];
  if (!dateParam) {
    res.status(400).json({ error: 'Date manquante' });
    return null;
  }
  return dateParam;
};
