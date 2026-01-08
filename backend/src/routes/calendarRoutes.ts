import { Router } from 'express';
import {
  getEntriesByDate,
  getEntriesByDateRange,
  createEntry,
  updateEntry,
  deleteEntry,
  calculateScore
} from '../controllers/calendarController';

const router = Router();

router.get('/date/:date', getEntriesByDate);
router.get('/range', getEntriesByDateRange);
router.get('/score', calculateScore);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
