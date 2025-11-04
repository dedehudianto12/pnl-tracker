import { defineStore } from "pinia";
import type { Notification } from "~/types/models";

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    loading: false,
  }),

  getters: {
    unreadNotifications: (state) =>
      state.notifications.filter((n) => n.status === "UNREAD"),

    readNotifications: (state) =>
      state.notifications.filter((n) => n.status === "READ"),
  },

  actions: {
    async fetchNotifications(status?: string) {
      this.loading = true;
      try {
        const { apiFetch } = useApi();
        const query = status ? `?status=${status}` : "";
        this.notifications = await apiFetch<Notification[]>(
          `/notifications${query}`
        );
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchUnreadCount() {
      try {
        const { apiFetch } = useApi();
        const data = await apiFetch<{ count: number }>(
          "/notifications/unread-count"
        );
        this.unreadCount = data.count;
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    },

    async markAsRead(notificationId: string) {
      try {
        const { apiFetch } = useApi();
        await apiFetch(`/notifications/${notificationId}/read`, {
          method: "PUT",
        });

        // Update local state
        const notification = this.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification) {
          notification.status = "READ";
          notification.readAt = new Date().toISOString();
        }

        this.unreadCount = Math.max(0, this.unreadCount - 1);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },

    async markAllAsRead() {
      try {
        const { apiFetch } = useApi();
        await apiFetch("/notifications/mark-all-read", {
          method: "PUT",
        });

        // Update local state
        this.notifications.forEach((n) => {
          if (n.status === "UNREAD") {
            n.status = "READ";
            n.readAt = new Date().toISOString();
          }
        });

        this.unreadCount = 0;
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    },

    async deleteNotification(notificationId: string) {
      try {
        const { apiFetch } = useApi();
        await apiFetch(`/notifications/${notificationId}`, {
          method: "DELETE",
        });

        // Remove from local state
        const index = this.notifications.findIndex(
          (n) => n.id === notificationId
        );
        if (index !== -1) {
          const notification = this.notifications[index];
          if (notification && notification.status === "UNREAD") {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.notifications.splice(index, 1);
        }
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    },
  },
});
