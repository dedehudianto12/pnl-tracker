export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  projectValue: number;
  deadline: string;
  overheadPercentage?: number;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: ProjectMember[];
  expenses?: Expense[];
  milestones?: Milestone[];
  calculations?: ProjectCalculations;
  alerts?: ProjectAlerts;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "MEMBER" | "EDITOR" | "VIEWER";
  addedAt: string;
  user: User;
}

export interface Expense {
  id: string;
  projectId: string;
  category: "MATERIALS" | "MANPOWER" | "TOOLS" | "OTHER";
  name: string;
  description?: string;
  estimatedCost: number;
  actualCost?: number;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY";
  dateIncurred?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetDate: string;
  completionPercentage: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  projectId?: string;
  type: string;
  title: string;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  metadata?: any;
  createdAt: string;
  readAt?: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface ProjectCalculations {
  totalEstimatedCost: number;
  totalActualCost: number;
  remainingBudget: number;
  netProfit: number;
  netProfitMargin: number;
  grossProfit: number;
  grossProfitMargin: number;
  overheadCost: number;
  budgetPercentage: number;
}

export interface BudgetAlert {
  level: "info" | "warning" | "danger" | "critical";
  percentage: number;
  message: string;
  shouldNotify: boolean;
}

export interface ProjectAlerts {
  budget: BudgetAlert | null;
  deadline: {
    daysRemaining: number;
    isOverdue: boolean;
    message: string;
  };
  milestones: {
    delayed: number;
    message: string;
  };
}
