<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{
          isEdit ? "Edit Milestone" : "Add Milestone"
        }}</DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? "Update milestone details"
              : "Add a new milestone to track project progress"
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
        <!-- Name -->
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Milestone Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Design Phase Complete"
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
                placeholder="What needs to be accomplished..."
                v-bind="componentField"
                rows="2"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Target Date & Status -->
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="targetDate">
            <FormItem>
              <FormLabel>Target Date</FormLabel>
              <FormControl>
                <Input type="date" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

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
                  <SelectItem value="PENDING">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:clock" class="h-4 w-4" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:play-circle" class="h-4 w-4" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:check-circle" class="h-4 w-4" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="DELAYED">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:alert-circle" class="h-4 w-4" />
                      Delayed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Completion Percentage -->
        <FormField v-slot="{ componentField }" name="completionPercentage">
          <FormItem>
            <FormLabel>Completion Percentage</FormLabel>
            <FormControl>
              <div class="space-y-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  v-bind="componentField"
                />
                <Progress
                  :model-value="Number(componentField.modelValue || 0)"
                />
              </div>
            </FormControl>
            <FormDescription> Current progress (0-100%) </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Estimated & Actual Hours -->
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="estimatedHours">
            <FormItem>
              <FormLabel>Estimated Hours (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="40"
                  min="0"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="actualHours">
            <FormItem>
              <FormLabel>Actual Hours (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="35"
                  min="0"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

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
            {{ isEdit ? "Update" : "Add" }} Milestone
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
  CreateMilestoneSchema,
  type CreateMilestoneFormValues,
} from "~/validations/milestone";
import type { Milestone } from "~/types/models";

interface Props {
  projectId: string;
  milestone?: Milestone;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  created: [];
  updated: [];
}>();

const isOpen = defineModel<boolean>("open", { required: true });
const toast = useToast();
const { createMilestone, updateMilestone } = useMilestones();
const error = ref<string | null>(null);

const isEdit = computed(() => !!props.milestone);

const formSchema = toTypedSchema(CreateMilestoneSchema);

const { handleSubmit, isSubmitting, setValues } =
  useForm<CreateMilestoneFormValues>({
    validationSchema: formSchema,
    initialValues: {
      name: "",
      description: "",
      targetDate: "",
      completionPercentage: 0,
      status: "PENDING",
      estimatedHours: undefined,
      actualHours: undefined,
    },
  });

// Populate form if editing
watch(
  () => props.milestone,
  (milestone) => {
    if (milestone) {
      setValues({
        name: milestone.name,
        description: milestone.description || "",
        targetDate: new Date(milestone.targetDate).toISOString().split("T")[0],
        completionPercentage: milestone.completionPercentage,
        status: milestone.status,
        estimatedHours: milestone.estimatedHours || undefined,
        actualHours: milestone.actualHours || undefined,
      });
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    if (isEdit.value && props.milestone) {
      await updateMilestone(props.milestone.id, values);
      toast.success("Success", "Milestone updated successfully");
      emit("updated");
    } else {
      await createMilestone(props.projectId, values);
      toast.success("Success", "Milestone added successfully");
      emit("created");
    }
    isOpen.value = false;
  } catch (err: any) {
    error.value =
      err.data?.error ||
      `Failed to ${isEdit.value ? "update" : "add"} milestone`;
  }
});
</script>
