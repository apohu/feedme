import { Router } from 'express';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  addIngredientToRecipe,
  addTagToRecipe
} from '../controllers/recipeController';

const router = Router();

router.get('/', getAllRecipes);
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);
router.post('/:id/ingredients', addIngredientToRecipe);
router.post('/:id/tags', addTagToRecipe);

export default router;
