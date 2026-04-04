import { db } from '../db.js';
import { Request, Response } from 'express';

// Get all notifications for the logged-in user
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        reportType: n.reportType,
        reportId: n.reportId,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching notifications: ${(error as any).message}`,
    });
  }
};

// Mark a single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const notification = await db.notification.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await db.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as any).message });
  }
};

// Mark ALL notifications as read for the logged-in user
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as any).message });
  }
};

// Get unread count only (lightweight, used by navbar badge)
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const count = await db.notification.count({ where: { userId, isRead: false } });
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as any).message });
  }
};
