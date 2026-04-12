import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import * as controller from '../controllers/successStoriesController.js';

const router = express.Router();

/* ── Public routes ── */
router.get('/', controller.getPublishedStories);
router.get('/:id(\\d+)', controller.getStoryById);

/* ── Admin-only routes ── */
router.get('/admin/all',    authMiddleware, adminMiddleware, controller.getAllStoriesAdmin);
router.get('/admin/stats',  authMiddleware, adminMiddleware, controller.getStoryStats);
router.post('/',            authMiddleware, adminMiddleware, controller.createStory);
router.put('/:id',          authMiddleware, adminMiddleware, controller.updateStory);
router.patch('/:id/publish',authMiddleware, adminMiddleware, controller.togglePublish);
router.delete('/:id',       authMiddleware, adminMiddleware, controller.deleteStory);

export default router;
