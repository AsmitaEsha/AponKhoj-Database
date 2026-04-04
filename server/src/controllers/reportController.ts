import { Request, Response } from 'express';
import { db } from '../db.js';

export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { type, title, description, location, imageUrl } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and description are required.',
      });
    }

    const report = await db.report.create({
      data: {
        userId,
        type,
        title,
        description,
        location,
        imageUrl,
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully.',
      report,
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let reports;
    if (userRole === 'admin') {
      reports = await db.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
      });
    } else {
      reports = await db.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const report = await db.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (userRole !== 'admin' && report.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden access to this report.' });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id, action } = req.params; // action can be 'approve' or 'decline'
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can review reports.' });
    }

    if (action !== 'approve' && action !== 'decline') {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    const status = action === 'approve' ? 'approved' : 'declined';

    const report = await db.report.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json({
      success: true,
      message: `Report ${status} successfully.`,
      report,
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
