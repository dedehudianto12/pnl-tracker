<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <Button
          variant="ghost"
          size="sm"
          @click="navigateTo('/projects')"
          class="mb-2"
        >
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ project?.name || "Project Details" }}
        </h1>
        <p class="text-muted-foreground mt-1">
          {{
            project?.description || "Manage your project expenses and revenue"
          }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          @click="navigateTo(`/projects/${route.params.id}/edit`)"
        >
          <Icon name="lucide:edit" class="mr-2 h-4 w-4" />
          Edit Project
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="h-8 w-8 animate-spin text-primary" />
    </div>

    <!-- Project Overview -->
    <div v-else-if="project" class="space-y-6">
      <!-- Project Stats -->
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium">Project Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{
                formatCurrency(
                  Number(project.projectValue) || 0,
                  project.currency
                )
              }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ formatCurrency(totalExpenses, project.currency) }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="text-2xl font-bold"
              :class="netProfit >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(netProfit, project.currency) }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="text-2xl font-bold"
              :class="profitMargin >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ profitMargin.toFixed(1) }}%
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
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

        <TabsContent value="expenses" class="mt-6">
          <ExpenseList
            :project-id="route.params.id as string"
            :expenses="expenses"
            :summary="expenseSummary"
            :currency="project.currency"
            @refresh="refreshExpenses"
          />
        </TabsContent>

        <TabsContent value="milestones" class="mt-6">
          <MilestoneList
            :project-id="route.params.id as string"
            :milestones="milestones"
            @refresh="refreshMilestones"
          />
        </TabsContent>

        <TabsContent value="members" class="mt-6">
          <MemberList
            :project-id="route.params.id as string"
            :owner="projectOwner"
            :members="members"
            :is-owner="isOwner"
            @refresh="refreshMembers"
          />
        </TabsContent>
      </Tabs>
    </div>

    <!-- Not Found State -->
    <Card v-else class="py-12">
      <CardContent class="flex flex-col items-center justify-center space-y-4">
        <Icon
          name="lucide:alert-circle"
          class="h-16 w-16 text-muted-foreground"
        />
        <div class="text-center space-y-2">
          <h3 class="text-xl font-semibold">Project not found</h3>
          <p class="text-sm text-muted-foreground max-w-sm">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
        <Button @click="navigateTo('/projects')">
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import ExpenseList from "~/components/project/ExpenseList.vue";
import MilestoneList from "~/components/project/MilestoneList.vue";
import MemberList from "~/components/project/MemberList.vue";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type {
  Project,
  Expense,
  Milestone,
  ProjectMember,
  User,
} from "~/types/models";
import { useAuthStore } from "~/stores/auth"; // Adjust the path to your auth store

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const authStore = useAuthStore();
const { fetchProject } = useProjects();
const { fetchExpenses } = useExpenses();
const { fetchMilestones } = useMilestones();

// Get current user from Pinia store
const currentUser = computed(() => authStore.currentUser);

// Active tab state
const activeTab = ref("expenses");

// Fetch project details
const { data: project, pending } = await useAsyncData(
  `project-${route.params.id}`,
  () => fetchProject(route.params.id as string),
  {
    default: () => null,
  }
);

// Check if current user is owner
const isOwner = computed(() => {
  return project.value?.ownerId === currentUser.value?.id;
});

// Get project owner
const projectOwner = computed<User>(() => {
  if (project.value?.owner) {
    return project.value.owner;
  }
  // Fallback if owner is not populated
  return {
    id: project.value?.ownerId || "",
    email: "",
    name: "Project Owner",
    createdAt: "",
  };
});

// Fetch expenses
const expenses = ref<Expense[]>([]);
const expenseSummary = ref<
  Record<string, { actualTotal: number; count: number }>
>({});

const loadExpenses = async () => {
  try {
    const data = await fetchExpenses(route.params.id as string);
    expenses.value = data.expenses || [];
    expenseSummary.value = data.summary || {};
    calculateSummary();
  } catch (err) {
    console.error("Failed to fetch expenses:", err);
    expenses.value = [];
  }
};

const calculateSummary = () => {
  const summary: Record<string, { actualTotal: number; count: number }> = {
    MATERIALS: { actualTotal: 0, count: 0 },
    MANPOWER: { actualTotal: 0, count: 0 },
    TOOLS: { actualTotal: 0, count: 0 },
    OTHER: { actualTotal: 0, count: 0 },
  };

  expenses.value.forEach((expense) => {
    const category = expense.category || "OTHER";
    const cost = Number(expense.actualCost || expense.estimatedCost || 0);

    if (!summary[category]) {
      summary[category] = { actualTotal: 0, count: 0 };
    }

    summary[category].actualTotal += cost;
    summary[category].count += 1;
  });

  expenseSummary.value = summary;
};

// Fetch milestones
const milestones = ref<Milestone[]>([]);

const loadMilestones = async () => {
  try {
    const data = await fetchMilestones(route.params.id as string);
    milestones.value = data.milestones || [];
  } catch (err) {
    console.error("Failed to fetch milestones:", err);
    milestones.value = [];
  }
};

// Fetch members
const members = ref<ProjectMember[]>([]);

const loadMembers = async () => {
  try {
    // If project includes members, use those
    if (project.value?.members) {
      members.value = project.value.members;
    }
  } catch (err) {
    console.error("Failed to fetch members:", err);
    members.value = [];
  }
};

// Computed values
const totalExpenses = computed(() => {
  return expenses.value.reduce((total, expense) => {
    return total + Number(expense.actualCost || expense.estimatedCost || 0);
  }, 0);
});

const netProfit = computed(() => {
  return (project.value?.projectValue || 0) - totalExpenses.value;
});

const profitMargin = computed(() => {
  if (!project.value?.projectValue) return 0;
  return (netProfit.value / project.value.projectValue) * 100;
});

// Refresh functions
const refreshExpenses = async () => {
  await loadExpenses();
};

const refreshMilestones = async () => {
  await loadMilestones();
};

const refreshMembers = async () => {
  await loadMembers();
};

// Load all data on mount
onMounted(() => {
  loadExpenses();
  loadMilestones();
  loadMembers();
});
</script>
