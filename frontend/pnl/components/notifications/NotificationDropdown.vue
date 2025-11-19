<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="relative">
        <Icon name="lucide:bell" class="h-5 w-5" />
        <Badge
          v-if="unreadCount > 0"
          variant="destructive"
          class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {{ unreadCount > 9 ? "9+" : unreadCount }}
        </Badge>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-80">
      <DropdownMenuLabel class="flex items-center justify-between">
        <span>Notifications</span>
        <Button
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          class="h-auto p-0 text-xs"
          @click="markAllAsRead"
        >
          Mark all as read
        </Button>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <Icon
          name="lucide:loader-2"
          class="h-6 w-6 animate-spin text-muted-foreground"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="notifications.length === 0"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <Icon
          name="lucide:bell-off"
          class="h-8 w-8 text-muted-foreground mb-2"
        />
        <p class="text-sm text-muted-foreground">No notifications</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="max-h-[400px] overflow-y-auto">
        <NotificationItem
          v-for="notification in notifications.slice(0, 5)"
          :key="notification.id"
          :notification="notification"
          @click="handleNotificationClick(notification)"
        />
      </div>

      <DropdownMenuSeparator v-if="notifications.length > 0" />

      <div class="p-2">
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          @click="navigateTo('/notifications')"
        >
          View All Notifications
        </Button>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Button } from "~/components/ui/button";
import Badge from "../ui/badge/Badge.vue";
import NotificationItem from "./NotificationItem.vue";

const notificationStore = useNotificationsStore();

const loading = computed(() => notificationStore.loading);
const notifications = computed(() => notificationStore.unreadNotifications);
const unreadCount = computed(() => notificationStore.unreadCount);

// Fetch notifications on mount
onMounted(() => {
  notificationStore.fetchUnreadCount();
  notificationStore.fetchNotifications("UNREAD");
  const refreshInterval = setInterval(() => {
    notificationStore.fetchUnreadCount();
  }, 30000);
  onUnmounted(() => {
    clearInterval(refreshInterval);
  });
});

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleNotificationClick = async (notification: any) => {
  await notificationStore.markAsRead(notification.id);

  // Navigate to project if notification has projectId
  if (notification.projectId) {
    navigateTo(`/projects/${notification.projectId}`);
  }
};
</script>
