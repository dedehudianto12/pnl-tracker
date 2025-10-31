import { notificationService } from "../../src/services/notificationService.js";
import { createTestUser, createTestProject } from "../utils/testHelpers.js";
import { prisma } from "../testPrismaClient.js";

describe("NotificationService", () => {
  let testUser: any;
  let project: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    project = await createTestProject(testUser.id);
  });

  describe("createNotification", () => {
    it("should create a new notification", async () => {
      const notification = await notificationService.createNotification(
        testUser.id,
        project.id,
        "BUDGET_WARNING_50",
        "Budget Warning",
        "You have used 50% of your budget",
        { percentage: 50 }
      );
      expect(notification.userId).toBe(testUser.id);
      expect(notification.projectId).toBe(project.id);
      expect(notification.type).toBe("BUDGET_WARNING_50");
      expect(notification.status).toBe("UNREAD");
    });

    it("should not create duplicate notifications", async () => {
      await notificationService.createNotification(
        testUser.id,
        project.id,
        "BUDGET_WARNING_50",
        "Budget Warning",
        "You have used 50% of your budget"
      );

      const notification2 = await notificationService.createNotification(
        testUser.id,
        project.id,
        "BUDGET_WARNING_50",
        "Budget Warning",
        "You have used 51% of your budget"
      );

      const allNotifications = await prisma.notification.findMany({
        where: { userId: testUser.id },
      });

      expect(allNotifications).toHaveLength(1);
      expect(notification2.message).toContain("51%");
    });
  });

  describe("checkAndCreateBudgetWarnings", () => {
    it("should create 50% warning", async () => {
      await notificationService.checkAndCreateBudgetWarnings(
        project.id,
        testUser.id,
        50,
        project.name
      );

      const notifications = await prisma.notification.findMany({
        where: { userId: testUser.id },
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe("BUDGET_WARNING_50");
    });

    it("should create 75% warning", async () => {
      await notificationService.checkAndCreateBudgetWarnings(
        project.id,
        testUser.id,
        75,
        project.name
      );

      const notifications = await prisma.notification.findMany({
        where: { userId: testUser.id },
      });

      expect(notifications[0].type).toBe("BUDGET_WARNING_75");
    });

    it("should create exceeded warning", async () => {
      await notificationService.checkAndCreateBudgetWarnings(
        project.id,
        testUser.id,
        105,
        project.name
      );

      const notifications = await prisma.notification.findMany({
        where: { userId: testUser.id },
      });

      expect(notifications[0].type).toBe("BUDGET_EXCEEDED");
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      const notification = await notificationService.createNotification(
        testUser.id,
        project.id,
        "BUDGET_WARNING_50",
        "Test",
        "Test"
      );

      const updated = await notificationService.markAsRead(
        notification.id,
        testUser.id
      );

      expect(updated.status).toBe("READ");
      expect(updated.readAt).toBeTruthy();
    });

    it("should throw error for wrong user", async () => {
      const otherUser = await createTestUser();
      const notification = await notificationService.createNotification(
        otherUser.id,
        project.id,
        "BUDGET_WARNING_50",
        "Test",
        "Test"
      );

      await expect(
        notificationService.markAsRead(notification.id, testUser.id)
      ).rejects.toThrow("Notification not found");
    });
  });

  describe("getUnreadCount", () => {
    it("should return correct unread count", async () => {
      await notificationService.createNotification(
        testUser.id,
        project.id,
        "BUDGET_WARNING_50",
        "Test 1",
        "Test 1"
      );

      const notification2 = await notificationService.createNotification(
        testUser.id,
        project.id,
        "BUDGET_WARNING_75",
        "Test 2",
        "Test 2"
      );

      let count = await notificationService.getUnreadCount(testUser.id);
      expect(count).toBe(2);

      await notificationService.markAsRead(notification2.id, testUser.id);

      count = await notificationService.getUnreadCount(testUser.id);
      expect(count).toBe(1);
    });
  });
});
