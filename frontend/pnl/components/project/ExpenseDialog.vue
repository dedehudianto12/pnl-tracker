<template>
  <Dialog v-model:open="isOpen" class="bg-blue-400">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? "Edit Expense" : "Add Expense" }}</DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? "Update expense details"
              : "Add a new expense to track project costs"
          }}
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
        <!-- Category -->
        <FormField v-slot="{ componentField }" name="category">
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="MATERIALS">
                  <div class="flex items-center gap-2">
                    <Icon name="lucide:package" class="h-4 w-4" />
                    Materials
                  </div>
                </SelectItem>
                <SelectItem value="MANPOWER">
                  <div class="flex items-center gap-2">
                    <Icon name="lucide:users" class="h-4 w-4" />
                    Manpower
                  </div>
                </SelectItem>
                <SelectItem value="TOOLS">
                  <div class="flex items-center gap-2">
                    <Icon name="lucide:wrench" class="h-4 w-4" />
                    Tools
                  </div>
                </SelectItem>
                <SelectItem value="OTHER">
                  <div class="flex items-center gap-2">
                    <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Name -->
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Expense Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Design Software License"
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
                placeholder="Additional details about this expense..."
                v-bind="componentField"
                rows="2"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Estimated & Actual Cost -->
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="estimatedCost">
            <FormItem>
              <FormLabel>Estimated Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="actualCost">
            <FormItem>
              <FormLabel>Actual Cost (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="4500"
                  min="0"
                  step="0.01"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Date Incurred -->
        <FormField v-slot="{ componentField }" name="dateIncurred">
          <FormItem>
            <FormLabel>Date Incurred (Optional)</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormDescription> When was this expense incurred? </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Recurring -->
        <FormField v-slot="{ value, handleChange }" name="isRecurring">
          <FormItem
            class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
          >
            <FormControl>
              <Checkbox :checked="value" @update:checked="handleChange" />
            </FormControl>
            <div class="space-y-1 leading-none">
              <FormLabel> Recurring Expense </FormLabel>
              <FormDescription>
                This expense repeats at regular intervals
              </FormDescription>
            </div>
          </FormItem>
        </FormField>

        <!-- Recurring Interval -->
        <FormField
          v-slot="{ componentField }"
          name="recurringInterval"
          v-if="watchIsRecurring"
        >
          <FormItem>
            <FormLabel>Recurring Interval</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
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
            {{ isEdit ? "Update" : "Add" }} Expense
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
  CreateExpenseSchema,
  type CreateExpenseFormValues,
} from "~/validations/expense";
import type { Expense } from "~/types/models";
import Dialog from "../ui/dialog/Dialog.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import DialogHeader from "../ui/dialog/DialogHeader.vue";
import DialogTitle from "../ui/dialog/DialogTitle.vue";
import DialogDescription from "../ui/dialog/DialogDescription.vue";

interface Props {
  projectId: string;
  expense?: Expense;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  created: [];
  updated: [];
}>();

const isOpen = defineModel<boolean>("open", { required: true });
const toast = useToast();
const { createExpense, updateExpense } = useExpenses();
const error = ref<string | null>(null);

const isEdit = computed(() => !!props.expense);

const formSchema = toTypedSchema(CreateExpenseSchema);

const { handleSubmit, isSubmitting, setValues, values } =
  useForm<CreateExpenseFormValues>({
    validationSchema: formSchema,
    initialValues: {
      category: "MATERIALS",
      name: "",
      description: "",
      estimatedCost: 0,
      actualCost: undefined,
      isRecurring: false,
      recurringInterval: undefined,
      dateIncurred: "",
    },
  });

const watchIsRecurring = computed(() => values.isRecurring);

// Populate form if editing
watch(
  () => props.expense,
  (expense) => {
    if (expense) {
      setValues({
        category: expense.category,
        name: expense.name,
        description: expense.description || "",
        estimatedCost: Number(expense.estimatedCost),
        actualCost: expense.actualCost ? Number(expense.actualCost) : undefined,
        isRecurring: expense.isRecurring,
        recurringInterval: expense.recurringInterval || undefined,
        dateIncurred: expense.dateIncurred
          ? new Date(expense.dateIncurred).toISOString().split("T")[0]
          : "",
      });
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    if (isEdit.value && props.expense) {
      await updateExpense(props.expense.id, values);
      toast.success("Success", "Expense updated successfully");
      emit("updated");
    } else {
      await createExpense(props.projectId, values);
      toast.success("Success", "Expense added successfully");
      emit("created");
    }
    isOpen.value = false;
  } catch (err: any) {
    error.value =
      err.data?.error || `Failed to ${isEdit.value ? "update" : "add"} expense`;
  }
});
</script>
