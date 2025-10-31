import prisma from '../config/database.js';
import { NotificationType, NotificationStatus } from '@prisma/client';

export const notificationService = {
  async createNotification(
    userId: string,
    projectId: string | null,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any
  ) {
    // Check if similar notification already exists (avoid duplicates)
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        projectId,
        type,
        status: 'UNREAD',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
        },
      },
    });

    if (existingNotification) {
      // Update existing notification instead of creating duplicate
      return prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          message,
          metadata,
          createdAt: new Date(),
        },
      });
    }

    return prisma.notification.create({
      data: {
        userId,
        projectId,
        type,
        title,
        message,
        metadata,
      },
    });
  },

  async checkAndCreateBudgetWarnings(
    projectId: string,
    ownerId: string,
    percentage: number,
    projectName: string
  ) {
    const notifications = [];

    if (percentage >= 100) {
      notifications.push(
        await this.createNotification(
          ownerId,
          projectId,
          'BUDGET_EXCEEDED',
          'Budget Exceeded!',
          `Project "${projectName}" has exceeded its budget (${percentage.toFixed(1)}%).`,
          { percentage, threshold: 100 }
        )
      );
    } else if (percentage >= 90) {
      notifications.push(
        await this.createNotification(
          ownerId,
          projectId,
          'BUDGET_WARNING_90',
          'Critical Budget Warning',
          `Project "${projectName}" has used ${percentage.toFixed(1)}% of its budget.`,
          { percentage, threshold: 90 }
        )
      );
    } else if (percentage >= 75) {
      notifications.push(
        await this.createNotification(
          ownerId,
          projectId,
          'BUDGET_WARNING_75',
          'Budget Warning',
          `Project "${projectName}" has used ${percentage.toFixed(1)}% of its budget.`,
          { percentage, threshold: 75 }
        )
      );
    } else if (percentage >= 50) {
      notifications.push(
        await this.createNotification(
          ownerId,
          projectId,
          'BUDGET_WARNING_50',
          'Budget Milestone',
          `Project "${projectName}" has used ${percentage.toFixed(1)}% of its budget.`,
          { percentage, threshold: 50 }
        )
      );
    }

    return notifications;
  },

  async getUserNotifications(
    userId: string,
    status?: NotificationStatus,
    limit = 50
  ) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  },

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });
  },
};