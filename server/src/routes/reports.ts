import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Public / User routes
router.post('/', requireAuth, createReport);
router.get('/', requireAuth, getReports);
router.get('/:id', requireAuth, getReportById);

// Admin routes
router.put('/:id/:action(approve|decline)', requireAuth, updateReportStatus);

export default router;
