<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <Button variant="ghost" size="sm" @click="navigateTo('/projects')">
        <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
        Back to Projects
      </Button>
      <h1 class="text-3xl font-bold tracking-tight mt-4">Create New Project</h1>
      <p class="text-muted-foreground mt-1">
        Set up a new project to track profit and loss
      </p>
    </div>

    <!-- Form Card -->
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>
          Fill in the information below to create your project
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

            <FormField v-slot="{ componentField }" name="currency">
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="IDR">IDR (Rp)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
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
              {{ isSubmitting ? "Creating..." : "Create Project" }}
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="navigateTo('/projects')"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  CreateProjectSchema,
  type CreateProjectFormValues,
} from "~/validations/project";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

definePageMeta({
  middleware: "auth",
});

const { createProject } = useProjects();
const toast = useToast();
const error = ref<string | null>(null);

const formSchema = toTypedSchema(CreateProjectSchema);

const { handleSubmit, isSubmitting, setFieldValue } =
  useForm<CreateProjectFormValues>({
    validationSchema: formSchema,
    initialValues: {
      name: "",
      description: "",
      projectValue: 0,
      deadline: "",
      overheadPercentage: 10,
      currency: "USD",
    },
  });

// Set default deadline to 3 months from now
onMounted(() => {
  const defaultDeadline = new Date();
  defaultDeadline.setMonth(defaultDeadline.getMonth() + 3);
  setFieldValue("deadline", defaultDeadline.toISOString().split("T")[0]!);
});

const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    await createProject(values);
    toast.success("Success", "Project created successfully");
    navigateTo("/projects");
  } catch (err: any) {
    error.value = err.data?.error || "Failed to create project";
  }
});
</script>
