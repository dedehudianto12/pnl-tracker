<template>
  <div class="space-y-4">
    <!-- Summary Cards -->
    <div v-if="summary" class="grid gap-4 md:grid-cols-4">
      <Card v-for="category in categoryList" :key="category.value">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium flex items-center gap-2">
            <Icon :name="category.icon" class="h-4 w-4 text-muted-foreground" />
            {{ category.label }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">
            {{
              formatCurrency(
                summary[category.value]?.actualTotal || 0,
                currency
              )
            }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ summary[category.value]?.count || 0 }} expenses
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Expense Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              {{ expenses.length }} total expenses
            </CardDescription>
          </div>
          <Button size="sm" @click="openAddDialog">
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="expense in expenses"
            :key="expense.id"
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div class="flex items-center gap-3 flex-1">
              <!-- Icon -->
              <div
                :class="['p-2 rounded-lg', getCategoryColor(expense.category)]"
              >
                <Icon
                  :name="getCategoryIcon(expense.category)"
                  class="h-5 w-5"
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium">{{ expense.name }}</p>
                  <Badge
                    v-if="expense.isRecurring"
                    variant="outline"
                    class="text-xs"
                  >
                    {{ expense.recurringInterval }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground truncate">
                  {{ expense.description || "No description" }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{
                    expense.dateIncurred
                      ? formatDate(expense.dateIncurred)
                      : "No date"
                  }}
                </p>
              </div>

              <!-- Costs -->
              <div class="text-right space-y-1">
                <div>
                  <p class="text-sm font-medium">
                    {{
                      formatCurrency(
                        Number(expense.actualCost || expense.estimatedCost),
                        currency
                      )
                    }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Est:
                    {{
                      formatCurrency(Number(expense.estimatedCost), currency)
                    }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <Icon name="lucide:more-vertical" class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openEditDialog(expense)">
                    <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive"
                    @click="handleDelete(expense.id)"
                  >
                    <Icon name="lucide:trash" class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="expenses.length === 0" class="text-center py-12">
            <Icon
              name="lucide:receipt"
              class="h-12 w-12 text-muted-foreground mx-auto mb-4"
            />
            <p class="text-muted-foreground mb-4">No expenses yet</p>
            <Button @click="openAddDialog">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Add First Expense
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Expense Dialog -->
    <ExpenseDialog
      v-model:open="isDialogOpen"
      :project-id="projectId"
      :expense="selectedExpense"
      @created="handleCreated"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Expense } from "~/types/models";
import ExpenseDialog from "./ExpenseDialog.vue";

interface Props {
  projectId: string;
  expenses: Expense[];
  summary: any;
  currency: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  refresh: [];
}>();

const toast = useToast();
const { deleteExpense } = useExpenses();

const isDialogOpen = ref(false);
const selectedExpense = ref<Expense | undefined>();

const categoryList = [
  { value: "MATERIALS", label: "Materials", icon: "lucide:package" },
  { value: "MANPOWER", label: "Manpower", icon: "lucide:users" },
  { value: "TOOLS", label: "Tools", icon: "lucide:wrench" },
  { value: "OTHER", label: "Other", icon: "lucide:more-horizontal" },
];

const getCategoryIcon = (category: string) => {
  const cat = categoryList.find((c) => c.value === category);
  return cat?.icon || "lucide:receipt";
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    MATERIALS: "bg-blue-100 text-blue-600",
    MANPOWER: "bg-green-100 text-green-600",
    TOOLS: "bg-orange-100 text-orange-600",
    OTHER: "bg-gray-100 text-gray-600",
  };
  return colors[category] || "bg-gray-100 text-gray-600";
};

const openAddDialog = () => {
  selectedExpense.value = undefined;
  isDialogOpen.value = true;
};

const openEditDialog = (expense: Expense) => {
  selectedExpense.value = expense;
  isDialogOpen.value = true;
};

const handleCreated = () => {
  emit("refresh");
};

const handleUpdated = () => {
  emit("refresh");
};

const handleDelete = async (expenseId: string) => {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    await deleteExpense(expenseId);
    toast.success("Success", "Expense deleted successfully");
    emit("refresh");
  } catch (err: any) {
    toast.error("Error", err.data?.error || "Failed to delete expense");
  }
};
</script>
