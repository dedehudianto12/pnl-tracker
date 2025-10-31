import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const status = req.query.status as any;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const notifications = await notificationService.getUserNotifications(
        userId,
        status,
        limit
      );

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { notificationId } = req.params;
      const notification = await notificationService.markAsRead(
        notificationId,
        userId
      );
      res.json(notification);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      await notificationService.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { notificationId } = req.params;
      await notificationService.deleteNotification(notificationId, userId);
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },
};
