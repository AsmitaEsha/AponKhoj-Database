import { db } from '../db.js';
import { Request, Response } from 'express';

type NotificationScope = 'all' | 'alerts' | 'dashboard';

const getScope = (scopeRaw: unknown): NotificationScope => {
  if (scopeRaw === 'alerts') return 'alerts';
  if (scopeRaw === 'dashboard') return 'dashboard';
  return 'all';
};

const buildNotificationScopeWhere = (userId: number, scope: NotificationScope) => {
  if (scope === 'dashboard') {
    return { userId, NOT: { type: 'area_alert' } };
  }
  return { userId };
};

// Get all notifications for the logged-in user
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const scope = getScope(req.query.scope);

    if (scope === 'alerts') {
      const alerts = await db.alertNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = await db.alertNotification.count({
        where: { userId, isRead: false },
      });

      return res.json({
        success: true,
        count: alerts.length,
        unreadCount,
        notifications: alerts.map((n) => ({
          id: n.id,
          type: 'area_alert',
          title: n.title,
          message: n.message,
          reportType: 'missing_person',
          reportId: n.reportId,
          district: n.district,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),
      });
    }

    const scopeWhere = buildNotificationScopeWhere(userId, scope);

    const notifications = await db.notification.findMany({
      where: scopeWhere,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { ...scopeWhere, isRead: false },
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
    const scope = getScope(req.query.scope);

    if (scope === 'alerts') {
      const alert = await db.alertNotification.findFirst({
        where: { id: parseInt(id), userId },
      });

      if (!alert) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      await db.alertNotification.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
      });

      return res.json({ success: true, message: 'Marked as read' });
    }

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
    const scope = getScope(req.query.scope);

    if (scope === 'alerts') {
      await db.alertNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const scopeWhere = buildNotificationScopeWhere(userId, scope);

    await db.notification.updateMany({
      where: { ...scopeWhere, isRead: false },
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
    const scope = getScope(req.query.scope);

    if (scope === 'alerts') {
      const count = await db.alertNotification.count({ where: { userId, isRead: false } });
      return res.json({ success: true, unreadCount: count });
    }

    const scopeWhere = buildNotificationScopeWhere(userId, scope);
    const count = await db.notification.count({ where: { ...scopeWhere, isRead: false } });
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as any).message });
  }
};

// Clear notifications for the logged-in user (supports optional scope)
export const clearMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const scope = getScope(req.query.scope);

    if (scope === 'alerts') {
      const result = await db.alertNotification.deleteMany({ where: { userId } });

      return res.json({
        success: true,
        deletedCount: result.count,
        message: 'Notifications cleared',
      });
    }

    const scopeWhere = buildNotificationScopeWhere(userId, scope);

    const result = await db.notification.deleteMany({ where: scopeWhere });

    res.json({
      success: true,
      deletedCount: result.count,
      message: 'Notifications cleared',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as any).message });
  }
};
