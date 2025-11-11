import { Expense, Project } from "@prisma/client";
import { ProjectCalculations } from "../types/index.js";

export const calculateProjectMetrics = (
  project: Project,
  expenses: Expense[]
): ProjectCalculations => {
  const totalEstimatedCost = expenses.reduce(
    (sum, exp) => sum + Number(exp.estimatedCost),
    0
  );

  const totalActualCost = expenses.reduce(
    (sum, exp) => sum + (exp.actualCost ? Number(exp.actualCost) : 0),
    0
  );

  const overheadPercentage = project.overheadPercentage
    ? Number(project.overheadPercentage)
    : 0;
  const overheadCost = (totalActualCost * overheadPercentage) / 100;

  const totalCostWithOverhead = totalActualCost + overheadCost;
  const projectValue = Number(project.projectValue);

  const remainingBudget = projectValue - totalActualCost;

  const grossProfit = projectValue - totalActualCost;
  const grossProfitMargin =
    projectValue > 0 ? (grossProfit / projectValue) * 100 : 0;

  const netProfit = projectValue - totalCostWithOverhead;
  const netProfitMargin =
    projectValue > 0 ? (netProfit / projectValue) * 100 : 0;

  const budgetPercentage =
    totalEstimatedCost > 0 ? (totalActualCost / projectValue) * 100 : 0;

  return {
    totalEstimatedCost,
    totalActualCost,
    remainingBudget,
    grossProfit,
    grossProfitMargin,
    netProfit,
    netProfitMargin,
    overheadCost,
    budgetPercentage,
  };
};
