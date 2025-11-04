import type { User } from "./models.ts";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  projectValue: number;
  deadline: string;
  overheadPercentage?: number;
  currency?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  projectValue?: number;
  deadline?: string;
  overheadPercentage?: number;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
}

export interface CreateExpenseRequest {
  category: "MATERIALS" | "MANPOWER" | "TOOLS" | "OTHER";
  name: string;
  description?: string;
  estimatedCost: number;
  actualCost?: number;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY";
  dateIncurred?: string;
}

export interface CreateMilestoneRequest {
  name: string;
  description?: string;
  targetDate: string;
  completionPercentage?: number;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  estimatedHours?: number;
  actualHours?: number;
}

export interface ApiError {
  error: string;
  details?: any;
}
