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
  const profit = projectValue - totalCostWithOverhead;
  const profitMargin = projectValue > 0 ? (profit / projectValue) * 100 : 0;

  return {
    totalEstimatedCost,
    totalActualCost,
    remainingBudget,
    profit,
    profitMargin,
    overheadCost,
  };
};
