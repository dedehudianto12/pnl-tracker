<template>
  <Card
    class="hover:shadow-lg transition-shadow cursor-pointer"
    @click="navigateTo(`/projects/${project.id}`)"
  >
    <CardHeader>
      <div class="flex justify-between items-start">
        <div class="space-y-1 flex-1">
          <CardTitle class="text-lg">{{ project.name }}</CardTitle>
          <CardDescription class="line-clamp-2">
            {{ project.description || "No description" }}
          </CardDescription>
        </div>
        <Badge :variant="statusVariant">
          {{ project.status }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Budget Alert -->
      <Alert v-if="project.alerts?.budget" :variant="alertVariant" class="py-2">
        <Icon :name="alertIcon" class="h-4 w-4" />
        <AlertDescription class="text-xs">
          {{ project.alerts.budget.message }}
        </AlertDescription>
      </Alert>

      <!-- Budget Progress -->
      <div class="space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="text-muted-foreground">Budget Usage</span>
          <span class="font-medium"> {{ budgetPercentage }}% </span>
        </div>
        <Progress :model-value="budgetPercentage" :class="progressColor" />
        <div class="flex justify-between text-xs text-muted-foreground">
          <span>{{ formatCurrency(totalSpent, project.currency) }} spent</span>
          <span
            >{{
              formatCurrency(Number(project.projectValue), project.currency)
            }}
            total</span
          >
        </div>
      </div>

      <Separator />

      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground">Profit</p>
          <p :class="['text-sm font-semibold', profitColor]">
            {{
              formatCurrency(
                project.calculations?.profit || 0,
                project.currency
              )
            }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground">Margin</p>
          <p :class="['text-sm font-semibold', profitColor]">
            {{ (project.calculations?.profitMargin || 0).toFixed(1) }}%
          </p>
        </div>
      </div>

      <!-- Deadline -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2 text-muted-foreground">
          <Icon name="lucide:calendar" class="h-4 w-4" />
          <span>{{ formatDate(project.deadline) }}</span>
        </div>
        <span :class="deadlineColor">
          {{ daysRemainingText }}
        </span>
      </div>

      <!-- Milestones Progress -->
      <div
        v-if="project.milestones && project.milestones.length > 0"
        class="flex items-center gap-2 text-sm"
      >
        <Icon name="lucide:flag" class="h-4 w-4 text-muted-foreground" />
        <span class="text-muted-foreground">
          {{ completedMilestones }}/{{ project.milestones.length }} milestones
        </span>
      </div>
    </CardContent>

    <CardFooter class="pt-0">
      <Button
        variant="ghost"
        size="sm"
        class="w-full"
        @click.stop="navigateTo(`/projects/${project.id}`)"
      >
        View Details
        <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import type { Project } from "~/types/models";
import Badge from "../ui/badge/Badge.vue";

const props = defineProps<{
  project: Project;
}>();

// Status badge variant
const statusVariant = computed(() => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    DRAFT: "outline",
    ACTIVE: "default",
    COMPLETED: "secondary",
    ARCHIVED: "destructive",
  };
  return variants[props.project.status] || "default";
});

// Budget calculations
const budgetPercentage = computed(() => {
  return Math.round(props.project.alerts?.budget?.percentage || 0);
});

const totalSpent = computed(() => {
  return props.project.calculations?.totalActualCost || 0;
});

const progressColor = computed(() => {
  const percentage = budgetPercentage.value;
  if (percentage >= 90) return "text-destructive";
  if (percentage >= 75) return "text-orange-500";
  if (percentage >= 50) return "text-yellow-500";
  return "text-primary";
});

// Alert variant
const alertVariant = computed(() => {
  const level = props.project.alerts?.budget?.level;
  if (level === "critical") return "destructive";
  if (level === "danger") return "destructive";
  if (level === "warning") return "default";
  return "default";
});

const alertIcon = computed(() => {
  const level = props.project.alerts?.budget?.level;
  if (level === "critical" || level === "danger")
    return "lucide:alert-triangle";
  if (level === "warning") return "lucide:alert-circle";
  return "lucide:info";
});

// Profit color
const profitColor = computed(() => {
  const profit = props.project.calculations?.profit || 0;
  if (profit > 0) return "text-green-600";
  if (profit < 0) return "text-destructive";
  return "text-muted-foreground";
});

// Deadline
const daysRemaining = computed(() => {
  return getDaysRemaining(props.project.deadline);
});

const daysRemainingText = computed(() => {
  const days = daysRemaining.value;
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
});

const deadlineColor = computed(() => {
  const days = daysRemaining.value;
  if (days < 0) return "text-destructive font-medium";
  if (days <= 7) return "text-orange-500 font-medium";
  return "text-muted-foreground";
});

// Milestones
const completedMilestones = computed(() => {
  return (
    props.project.milestones?.filter((m) => m.status === "COMPLETED").length ||
    0
  );
});
</script>
