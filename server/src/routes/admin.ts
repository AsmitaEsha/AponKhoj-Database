import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import * as controller from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', controller.stats);
router.get('/reports/recent', controller.recentReports);
router.get('/moderation/stats', controller.moderationStats);
router.get('/moderation/reports', controller.moderationReports);
router.get('/moderation/flagged-users', controller.moderationFlaggedUsers);
router.get('/moderation/appeals', controller.moderationAppeals);

export default router;