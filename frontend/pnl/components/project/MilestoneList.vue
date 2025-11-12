<template>
  <div class="space-y-4">
    <!-- Summary -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground"
            >Total Milestones</CardTitle
          >
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-foreground">
            {{ milestones.length }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground"
            >Completed</CardTitle
          >
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-foreground">
            {{ completedCount }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ completionRate }}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground"
            >Average Progress</CardTitle
          >
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-foreground">
            {{ avgProgress }}%
          </div>
          <Progress :model-value="avgProgress" class="mt-2" />
        </CardContent>
      </Card>
    </div>

    <!-- Milestones -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Milestones</CardTitle>
            <CardDescription>
              Track project phases and progress
            </CardDescription>
          </div>
          <Button size="sm" @click="openAddDialog">
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="milestone in sortedMilestones"
            :key="milestone.id"
            class="border rounded-lg p-4 space-y-3"
          >
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3 flex-1">
                <div
                  :class="['p-2 rounded-lg', getStatusColor(milestone.status)]"
                >
                  <Icon
                    :name="getStatusIcon(milestone.status)"
                    class="h-5 w-5"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="font-semibold">{{ milestone.name }}</h4>
                    <Badge :variant="getStatusVariant(milestone.status)">
                      {{ milestone.status.replace("_", " ") }}
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ milestone.description || "No description" }}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <Icon name="lucide:more-vertical" class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditDialog(milestone)">
                    <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive"
                    @click="handleDelete(milestone.id)"
                  >
                    <Icon name="lucide:trash" class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- Progress -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Progress</span>
                <span class="font-medium"
                  >{{ milestone.completionPercentage }}%</span
                >
              </div>
              <Progress
                :model-value="milestone.completionPercentage"
                class="[&>div]:bg-blue-400"
              />
            </div>

            <!-- Meta Info -->
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-4 text-muted-foreground">
                <div class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="h-4 w-4" />
                  <span>{{ formatDate(milestone.targetDate) }}</span>
                </div>
                <div
                  v-if="milestone.estimatedHours"
                  class="flex items-center gap-1"
                >
                  <Icon name="lucide:clock" class="h-4 w-4" />
                  <span>
                    {{ milestone.actualHours || 0 }}/{{
                      milestone.estimatedHours
                    }}h
                  </span>
                </div>
              </div>
              <span
                :class="
                  getDeadlineColor(milestone.targetDate, milestone.status)
                "
              >
                {{ getDeadlineText(milestone.targetDate, milestone.status) }}
              </span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="milestones.length === 0" class="text-center py-12">
            <Icon
              name="lucide:flag"
              class="h-12 w-12 text-muted-foreground mx-auto mb-4"
            />
            <p class="text-muted-foreground mb-4">No milestones yet</p>
            <Button @click="openAddDialog">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Add First Milestone
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Milestone Dialog -->
    <MilestoneDialog
      v-model:open="isDialogOpen"
      :project-id="projectId"
      :milestone="selectedMilestone"
      @created="handleCreated"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Milestone } from "~/types/models";
import MilestoneDialog from "./MilestoneDialog.vue";
import Progress from "../ui/progress/Progress.vue";

interface Props {
  projectId: string;
  milestones: Milestone[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  refresh: [];
}>();

const toast = useToast();
const { deleteMilestone } = useMilestones();

const isDialogOpen = ref(false);
const selectedMilestone = ref<Milestone | undefined>();

const sortedMilestones = computed(() => {
  return [...props.milestones].sort(
    (a, b) =>
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );
});

const completedCount = computed(
  () => props.milestones.filter((m) => m.status === "COMPLETED").length
);

const completionRate = computed(() => {
  if (props.milestones.length === 0) return 0;
  return Math.round((completedCount.value / props.milestones.length) * 100);
});

const avgProgress = computed(() => {
  if (props.milestones.length === 0) return 0;
  const total = props.milestones.reduce(
    (sum, m) => sum + m.completionPercentage,
    0
  );
  return Math.round(total / props.milestones.length);
});

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    PENDING: "lucide:clock",
    IN_PROGRESS: "lucide:play-circle",
    COMPLETED: "lucide:check-circle",
    DELAYED: "lucide:alert-circle",
  };
  return icons[status] || "lucide:flag";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    COMPLETED: "bg-green-100 text-green-600",
    DELAYED: "bg-red-100 text-red-600",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, any> = {
    PENDING: "outline",
    IN_PROGRESS: "default",
    COMPLETED: "secondary",
    DELAYED: "destructive",
  };
  return variants[status] || "outline";
};

const getDeadlineText = (targetDate: string, status: string) => {
  if (status === "COMPLETED") return "Completed";

  const days = getDaysRemaining(targetDate);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

const getDeadlineColor = (targetDate: string, status: string) => {
  if (status === "COMPLETED") return "text-green-600";

  const days = getDaysRemaining(targetDate);
  if (days < 0) return "text-destructive font-medium";
  if (days <= 7) return "text-orange-500 font-medium";
  return "text-muted-foreground";
};

const openAddDialog = () => {
  selectedMilestone.value = undefined;
  isDialogOpen.value = true;
};

const openEditDialog = (milestone: Milestone) => {
  selectedMilestone.value = milestone;
  isDialogOpen.value = true;
};

const handleCreated = () => {
  emit("refresh");
};

const handleUpdated = () => {
  emit("refresh");
};

const handleDelete = async (milestoneId: string) => {
  if (!confirm("Are you sure you want to delete this milestone?")) return;

  try {
    await deleteMilestone(milestoneId);
    toast.success("Success", "Milestone deleted successfully");
    emit("refresh");
  } catch (err: any) {
    toast.error("Error", err.data?.error || "Failed to delete milestone");
  }
};
</script>
