<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Projects</h1>
        <p class="text-muted-foreground mt-1">
          Manage all your projects in one place
        </p>
      </div>
      <Button @click="navigateTo('/projects/new')">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        New Project
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-primary" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="projects.length === 0" class="py-12">
      <CardContent class="flex flex-col items-center justify-center space-y-4">
        <Icon
          name="lucide:folder-open"
          class="h-16 w-16 text-muted-foreground"
        />
        <div class="text-center space-y-2">
          <h3 class="text-xl font-semibold">No projects yet</h3>
          <p class="text-sm text-muted-foreground max-w-sm">
            Get started by creating your first project to track profit and loss.
          </p>
        </div>
        <Button @click="navigateTo('/projects/new')" size="lg">
          <Icon name="lucide:plus" class="mr-2 h-5 w-5" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>

    <!-- Projects Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from "~/components/dashboard/ProjectCard.vue";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

definePageMeta({
  middleware: "auth",
});

const { fetchProjects } = useProjects();

const { data: projects, pending } = await useAsyncData(
  "all-projects",
  () => fetchProjects(),
  {
    default: () => [],
  }
);
</script>
