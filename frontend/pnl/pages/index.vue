<template>
  <div class="space-y-10">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p class="text-muted-foreground mt-1">
        Welcome back, {{ auth.user?.name }}!
      </p>
    </div>

    <!-- Stats Cards -->
    <div v-if="!pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card class="bg-card border border-border">
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium text-muted-foreground"
            >Total Projects</CardTitle
          >
          <Icon name="lucide:briefcase" class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-foreground">
            {{ projects.length }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ activeProjects }} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium text-muted-foreground"
            >Active Projects</CardTitle
          >
          <Icon name="lucide:check-circle" class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-foreground">
            {{ activeProjects }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Currently in progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Total Budget</CardTitle>
          <Icon name="lucide:banknote" class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-emerald-600">
            {{ totalBudget }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">Across all projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">Total Profit</CardTitle>
          <Icon name="lucide:trending-up" class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-emerald-600">
            {{ totalProfit }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">Net profit to date</p>
        </CardContent>
      </Card>
    </div>

    <!-- Projects Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-foreground font-semibold text-xl tracking-tight">
          Your Projects
        </h2>
        <Button @click="navigateTo('/projects/new')">
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <Icon
          name="lucide:loader-2"
          class="h-8 w-8 animate-spin text-primary"
        />
      </div>

      <!-- Empty State -->
      <Card v-else-if="projects.length === 0" class="py-12">
        <CardContent
          class="flex flex-col items-center justify-center space-y-4"
        >
          <Icon
            name="lucide:folder-open"
            class="h-12 w-12 text-muted-foreground"
          />
          <div class="text-center space-y-2">
            <h3 class="text-lg font-semibold">No projects yet</h3>
            <p class="text-sm text-muted-foreground max-w-sm">
              Get started by creating your first project to track profit and
              loss.
            </p>
          </div>
          <Button @click="navigateTo('/projects/new')" size="lg">
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>
        </CardContent>
      </Card>

      <!-- Projects Grid -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from "~/components/dashboard/ProjectCard.vue";

definePageMeta({
  middleware: "auth",
});

const auth = useAuthStore();
const { fetchProjects } = useProjects();

const { data: projects, pending } = await useAsyncData(
  "projects",
  () => fetchProjects(),
  {
    default: () => [],
  }
);

const activeProjects = computed(
  () => projects.value?.filter((p) => p.status === "ACTIVE").length || 0
);

const totalBudget = computed(() => {
  const total =
    projects.value?.reduce((sum, p) => sum + Number(p.projectValue), 0) || 0;
  return formatCurrency(total, "IDR");
});

const totalProfit = computed(() => {
  const total =
    projects.value?.reduce((sum, p) => {
      return sum + (p.calculations?.netProfit || 0);
    }, 0) || 0;
  return formatCurrency(total, "IDR");
});
</script>
