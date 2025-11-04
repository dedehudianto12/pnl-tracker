<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogDescription>
          Make changes to your project details
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description..."
                v-bind="componentField"
                rows="2"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Project Value -->
        <FormField v-slot="{ componentField }" name="projectValue">
          <FormItem>
            <FormLabel>Project Value</FormLabel>
            <FormControl>
              <Input type="number" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Deadline -->
        <FormField v-slot="{ componentField }" name="deadline">
          <FormItem>
            <FormLabel>Deadline</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Status -->
        <FormField v-slot="{ componentField }" name="status">
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Error Alert -->
        <Alert v-if="error" variant="destructive">
          <Icon name="lucide:alert-circle" class="h-4 w-4" />
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <!-- Actions -->
        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Icon
              v-if="isSubmitting"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  UpdateProjectSchema,
  type UpdateProjectFormValues,
} from "~/validations/project";

import type { Project } from "~/types/models";

interface Props {
  project: Project;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  updated: [];
}>();

const isOpen = defineModel<boolean>("open", { required: true });
const toast = useToast();
const { updateProject } = useProjects();
const error = ref<string | null>(null);

const formSchema = toTypedSchema(UpdateProjectSchema);

const { handleSubmit, isSubmitting, setValues } =
  useForm<UpdateProjectFormValues>({
    validationSchema: formSchema,
  });

// Populate form when dialog opens
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      setValues({
        name: newProject.name,
        description: newProject.description || "",
        projectValue: Number(newProject.projectValue),
        deadline: new Date(newProject.deadline).toISOString().split("T")[0],
        status: newProject.status,
      });
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    await updateProject(props.project.id, values);
    toast.success("Success", "Project updated successfully");
    isOpen.value = false;
    emit("updated");
  } catch (err: any) {
    error.value = err.data?.error || "Failed to update project";
  }
});
</script>
