<template>
  <div v-if="pending" class="flex items-center justify-center py-12">
    <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-primary" />
  </div>

  <div v-else-if="project" class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <Button
        variant="ghost"
        size="sm"
        @click="navigateTo(`/projects/${project.id}`)"
      >
        <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
        Back to Project
      </Button>
      <h1 class="text-3xl font-bold tracking-tight mt-4">Edit Project</h1>
      <p class="text-muted-foreground mt-1">Update your project details</p>
    </div>

    <!-- Form Card -->
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
        <CardDescription>
          Make changes to your project details below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-6">
          <!-- Project Name -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Website Redesign"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Description -->
          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the project..."
                  v-bind="componentField"
                  rows="3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Project Value & Currency -->
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
              <FormField v-slot="{ componentField }" name="projectValue">
                <FormItem>
                  <FormLabel>Project Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50000"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div>
              <FormField v-slot="{ componentField }" name="currency">
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input
                      :value="project.currency"
                      disabled
                      class="bg-muted"
                    />
                  </FormControl>
                  <FormDescription class="text-xs">
                    Currency cannot be changed
                  </FormDescription>
                </FormItem>
              </FormField>
            </div>
          </div>

          <!-- Deadline -->
          <FormField v-slot="{ componentField }" name="deadline">
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" v-bind="componentField" />
              </FormControl>
              <FormDescription>
                When should this project be completed?
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Overhead Percentage -->
          <FormField v-slot="{ componentField }" name="overheadPercentage">
            <FormItem>
              <FormLabel>Overhead Percentage (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.1"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                Additional costs like admin, insurance, etc. (e.g., 10 for 10%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Status -->
          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>Project Status</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:file-text" class="h-4 w-4" />
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="ACTIVE">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:play-circle" class="h-4 w-4" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:check-circle" class="h-4 w-4" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="ARCHIVED">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:archive" class="h-4 w-4" />
                      Archived
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription> Change the project status </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Error Alert -->
          <Alert v-if="error" variant="destructive">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <!-- Actions -->
          <div class="flex gap-4">
            <Button type="submit" :disabled="isSubmitting" class="flex-1">
              <Icon
                v-if="isSubmitting"
                name="lucide:loader-2"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isSubmitting ? "Saving..." : "Save Changes" }}
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="navigateTo(`/projects/${project.id}`)"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Danger Zone -->
    <Card class="border-destructive">
      <CardHeader>
        <CardTitle class="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions that affect your project
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Delete this project</p>
            <p class="text-sm text-muted-foreground">
              Once deleted, this project and all its data will be gone forever
            </p>
          </div>
          <Button variant="destructive" @click="handleDelete">
            <Icon name="lucide:trash" class="mr-2 h-4 w-4" />
            Delete Project
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Form, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  UpdateProjectSchema,
  type UpdateProjectFormValues,
} from "~/validations/project";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const auth = useAuthStore();
const toast = useToast();
const { fetchProject, updateProject, deleteProject } = useProjects();

const projectId = route.params.id as string;
const error = ref<string | null>(null);

// Fetch project data
const { data: project, pending } = await useAsyncData(
  `project-edit-${projectId}`,
  () => fetchProject(projectId)
);

// Check if user is owner
const isOwner = computed(() => project.value?.ownerId === auth.user?.id);

// Redirect if not owner
// watch(
//   [isOwner, pending],
//   ([newIsOwner, newPending]) => {
//     // 1. Wait until data fetching is complete
//     if (newPending) {
//       return;
//     }

//     // 2. Perform the redirect check only after data is loaded and isOwner is confirmed false
//     if (!newIsOwner) {
//       // Use nextTick to ensure redirect happens outside the hydration flow
//       nextTick(() => {
//         toast.error(
//           "Access Denied",
//           "Only the project owner can edit this project"
//         );
//         navigateTo(`/projects/${projectId}`);
//       });
//     }
//   },
//   { immediate: true }
// ); // Keep immediate: true to run the check right after loading.

// Form setup
const formSchema = toTypedSchema(UpdateProjectSchema);

const { handleSubmit, isSubmitting, setValues } =
  useForm<UpdateProjectFormValues>({
    validationSchema: formSchema,
  });

// Populate form with existing data
watch(
  project,
  (newProject) => {
    if (newProject) {
      setValues({
        name: newProject.name,
        description: newProject.description || "",
        projectValue: Number(newProject.projectValue),
        deadline: new Date(newProject.deadline).toISOString().split("T")[0],
        overheadPercentage: newProject.overheadPercentage
          ? Number(newProject.overheadPercentage)
          : undefined,
        status: newProject.status,
      });
    }
  },
  { immediate: true }
);

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    await updateProject(projectId, values);
    toast.success("Success", "Project updated successfully");
    navigateTo(`/projects/${projectId}`);
  } catch (err: any) {
    error.value = err.data?.error || "Failed to update project";
  }
});

// Delete handler
const handleDelete = async () => {
  const confirmed = confirm(
    `Are you sure you want to delete "${project.value?.name}"?\n\nThis action cannot be undone. All expenses, milestones, and project data will be permanently deleted.`
  );

  if (!confirmed) return;

  try {
    await deleteProject(projectId);
    toast.success("Success", "Project deleted successfully");
    navigateTo("/projects");
  } catch (err: any) {
    toast.error("Error", err.data?.error || "Failed to delete project");
  }
};
</script>
