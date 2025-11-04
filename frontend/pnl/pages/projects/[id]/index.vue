<template>
  <div v-if="pending" class="flex items-center justify-center py-12">
    <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-primary" />
  </div>

  <div v-else-if="project" class="space-y-6">
    <!-- Header -->
    <div>
      <Button variant="ghost" size="sm" @click="navigateTo('/projects')">
        <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <div class="flex items-start justify-between mt-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold tracking-tight">
              {{ project.name }}
            </h1>
            <Badge :variant="statusVariant">{{ project.status }}</Badge>
          </div>
          <p class="text-muted-foreground mt-1">
            {{ project.description || "No description" }}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="icon">
              <Icon name="lucide:more-vertical" class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              @click="navigateTo(`/projects/${project.id}/edit`)"
              :disabled="!isOwner"
            >
              <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @click="handleDelete">
              <Icon name="lucide:trash" class="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Budget Alert -->
    <Alert v-if="project.alerts?.budget" :variant="alertVariant">
      <Icon :name="alertIcon" class="h-4 w-4" />
      <AlertTitle>{{ alertTitle }}</AlertTitle>
      <AlertDescription>{{ project.alerts.budget.message }}</AlertDescription>
    </Alert>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Total Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(Number(project.projectValue), project.currency) }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Total Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{
              formatCurrency(
                project.calculations?.totalActualCost || 0,
                project.currency
              )
            }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ project.alerts?.budget?.percentage.toFixed(1) }}% of budget
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div :class="['text-2xl font-bold', profitColor]">
            {{
              formatCurrency(
                project.calculations?.profit || 0,
                project.currency
              )
            }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ (project.calculations?.profitMargin || 0).toFixed(1) }}% margin
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Deadline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatDate(project.deadline) }}
          </div>
          <p :class="['text-xs mt-1', deadlineColor]">
            {{ daysRemainingText }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Tabs -->
    <Tabs default-value="expenses" class="space-y-4">
      <TabsList>
        <TabsTrigger value="expenses">
          <Icon name="lucide:receipt" class="mr-2 h-4 w-4" />
          Expenses
        </TabsTrigger>
        <TabsTrigger value="milestones">
          <Icon name="lucide:flag" class="mr-2 h-4 w-4" />
          Milestones
        </TabsTrigger>
        <TabsTrigger value="members">
          <Icon name="lucide:users" class="mr-2 h-4 w-4" />
          Members
        </TabsTrigger>
      </TabsList>

      <!-- Expenses Tab -->
      <TabsContent value="expenses" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Expenses</h3>
          <Button size="sm">
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        <Card v-if="!project.expenses || project.expenses.length === 0">
          <CardContent class="flex flex-col items-center justify-center py-12">
            <Icon
              name="lucide:receipt"
              class="h-12 w-12 text-muted-foreground mb-4"
            />
            <p class="text-sm text-muted-foreground">No expenses yet</p>
          </CardContent>
        </Card>

        <div v-else class="space-y-4">
          <!-- Expense list will go here -->
          <p class="text-sm text-muted-foreground">
            {{ project.expenses.length }} expenses
          </p>
        </div>
      </TabsContent>

      <!-- Milestones Tab -->
      <TabsContent value="milestones" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Milestones</h3>
          <Button size="sm">
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        </div>

        <Card v-if="!project.milestones || project.milestones.length === 0">
          <CardContent class="flex flex-col items-center justify-center py-12">
            <Icon
              name="lucide:flag"
              class="h-12 w-12 text-muted-foreground mb-4"
            />
            <p class="text-sm text-muted-foreground">No milestones yet</p>
          </CardContent>
        </Card>

        <div v-else class="space-y-4">
          <!-- Milestone list will go here -->
          <p class="text-sm text-muted-foreground">
            {{ project.milestones.length }} milestones
          </p>
        </div>
      </TabsContent>

      <!-- Members Tab -->
      <TabsContent value="members" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">Team Members</h3>
          <Button size="sm" v-if="isOwner">
            <Icon name="lucide:user-plus" class="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        <Card>
          <CardContent class="pt-6">
            <div class="space-y-4">
              <!-- Owner -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <span class="text-sm font-medium">
                      {{ project.owner?.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ project.owner?.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ project.owner?.email }}
                    </p>
                  </div>
                </div>
                <Badge>Owner</Badge>
              </div>

              <!-- Members -->
              <div
                v-for="member in project.members"
                :key="member.id"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <span class="text-sm font-medium">
                      {{ member.user.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ member.user.name }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ member.user.email }}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{{ member.role }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const auth = useAuthStore();
const toast = useToast();
const { fetchProject, deleteProject } = useProjects();

const projectId = route.params.id as string;

const { data: project, pending } = await useAsyncData(
  `project-${projectId}`,
  () => fetchProject(projectId)
);

const isOwner = computed(() => project.value?.ownerId === auth.user?.id);

const statusVariant = computed(() => {
  const variants: Record<string, any> = {
    DRAFT: "outline",
    ACTIVE: "default",
    COMPLETED: "secondary",
    ARCHIVED: "destructive",
  };
  return variants[project.value?.status || "ACTIVE"] || "default";
});

const alertVariant = computed(() => {
  const level = project.value?.alerts?.budget?.level;
  if (level === "critical" || level === "danger") return "destructive";
  return "default";
});

const alertIcon = computed(() => {
  const level = project.value?.alerts?.budget?.level;
  if (level === "critical" || level === "danger")
    return "lucide:alert-triangle";
  return "lucide:alert-circle";
});

const alertTitle = computed(() => {
  const level = project.value?.alerts?.budget?.level;
  if (level === "critical") return "Critical Budget Alert";
  if (level === "danger") return "Budget Alert";
  if (level === "warning") return "Budget Warning";
  return "Budget Info";
});

const profitColor = computed(() => {
  const profit = project.value?.calculations?.profit || 0;
  if (profit > 0) return "text-green-600";
  if (profit < 0) return "text-destructive";
  return "text-muted-foreground";
});

const daysRemaining = computed(() => {
  if (!project.value) return 0;
  return getDaysRemaining(project.value.deadline);
});

const daysRemainingText = computed(() => {
  const days = daysRemaining.value;
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `${days} days remaining`;
});

const deadlineColor = computed(() => {
  const days = daysRemaining.value;
  if (days < 0) return "text-destructive font-medium";
  if (days <= 7) return "text-orange-500 font-medium";
  return "text-muted-foreground";
});

const handleDelete = async () => {
  if (
    !confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await deleteProject(projectId);
    toast.success("Success", "Project deleted successfully");
    navigateTo("/projects");
  } catch (err: any) {
    toast.error("Error", err.data?.error || "Failed to delete project");
  }
};
</script>
