import { Router } from 'express';
import {
  getAllTags,
  getTagById,
  getTagsByCategory,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController';

const router = Router();

router.get('/', getAllTags);
router.get('/category/:category', getTagsByCategory);
router.get('/:id', getTagById);
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;
