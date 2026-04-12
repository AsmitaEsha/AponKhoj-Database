import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as controller from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require auth
router.use(authMiddleware);

router.get('/', controller.getMyNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.delete('/clear', controller.clearMyNotifications);
router.patch('/:id/read', controller.markAsRead);
router.patch('/mark-all-read', controller.markAllAsRead);

export default router;