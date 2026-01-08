import { Router } from 'express';
import recipeRoutes from './recipeRoutes';
import ingredientRoutes from './ingredientRoutes';
import tagRoutes from './tagRoutes';
import menuRoutes from './menuRoutes';
import calendarRoutes from './calendarRoutes';

const router = Router();

router.use('/recipes', recipeRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/tags', tagRoutes);
router.use('/menus', menuRoutes);
router.use('/calendar', calendarRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FeedMe API is running' });
});

export default router;
