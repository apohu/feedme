import { Router } from 'express';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  generateMenuSuggestion
} from '../controllers/menuController';

const router = Router();

router.get('/', getAllMenus);
router.get('/:id', getMenuById);
router.post('/', createMenu);
router.post('/suggest', generateMenuSuggestion);
router.put('/:id', updateMenu);
router.delete('/:id', deleteMenu);

export default router;
