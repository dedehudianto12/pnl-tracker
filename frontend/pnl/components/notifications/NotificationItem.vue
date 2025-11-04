<template>
  <button
    class="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div :class="['mt-0.5 shrink-0', iconColor]">
        <Icon :name="icon" class="h-5 w-5" />
      </div>

      <!-- Content -->
      <div class="flex-1 space-y-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-medium leading-tight">
            {{ notification.title }}
          </p>
          <Badge
            v-if="notification.status === 'UNREAD'"
            variant="default"
            class="h-2 w-2 p-0 rounded-full"
          />
        </div>

        <p class="text-xs text-muted-foreground line-clamp-2">
          {{ notification.message }}
        </p>

        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ formatRelativeTime(notification.createdAt) }}</span>
          <span v-if="notification.project">•</span>
          <span v-if="notification.project" class="truncate">
            {{ notification.project.name }}
          </span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Notification } from "~/types/models";
import Badge from "../ui/badge/Badge.vue";

const props = defineProps<{
  notification: Notification;
}>();

defineEmits<{
  click: [];
}>();

const icon = computed(() => {
  const type = props.notification.type;
  if (type.includes("BUDGET")) return "lucide:wallet";
  if (type.includes("DEADLINE")) return "lucide:calendar";
  if (type.includes("MILESTONE")) return "lucide:flag";
  if (type.includes("MEMBER")) return "lucide:users";
  return "lucide:bell";
});

const iconColor = computed(() => {
  const type = props.notification.type;
  if (type.includes("EXCEEDED") || type.includes("OVERDUE"))
    return "text-destructive";
  if (type.includes("WARNING_90")) return "text-orange-500";
  if (type.includes("WARNING_75")) return "text-yellow-600";
  return "text-primary";
});
</script>
