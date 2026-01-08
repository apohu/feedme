import { Router } from 'express';
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  searchIngredients
} from '../controllers/ingredientController';

const router = Router();

router.get('/', getAllIngredients);
router.get('/search', searchIngredients);
router.get('/:id', getIngredientById);
router.post('/', createIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);

export default router;
