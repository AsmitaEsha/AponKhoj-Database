import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import * as controller from '../controllers/foundPersonController.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/published', controller.getPublished);
router.get('/published/:id', controller.getPublishedById);
router.get('/stats', controller.getPublicStats);

// Authenticated user routes
router.post('/', authMiddleware, uploadMiddleware.single('photo'), controller.store);
router.get('/my', authMiddleware, controller.getMyReports);

// Admin routes
router.get('/admin/pending', authMiddleware, adminMiddleware, controller.getPending);
router.patch('/admin/:id/approve', authMiddleware, adminMiddleware, controller.approve);
router.patch('/admin/:id/reject', authMiddleware, adminMiddleware, controller.reject);

export default router;