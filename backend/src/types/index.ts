import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
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
