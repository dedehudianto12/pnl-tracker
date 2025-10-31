import { Project, Expense, Milestone } from '@prisma/client';
import { ProjectAlerts, BudgetAlert } from '../types/index.js';

export const calculateBudgetAlert = (
  projectValue: number,
  totalActualCost: number,
  overheadCost: number
): BudgetAlert | null => {
  const totalCost = totalActualCost + overheadCost;
  const percentage = (totalCost / projectValue) * 100;

  if (percentage >= 100) {
    return {
      level: 'critical',
      percentage: Math.round(percentage * 100) / 100,
      message: `Budget exceeded! You've spent ${percentage.toFixed(1)}% of the project value.`,
      shouldNotify: true,
    };
  }

  if (percentage >= 90) {
    return {
      level: 'danger',
      percentage: Math.round(percentage * 100) / 100,
      message: `Critical: ${percentage.toFixed(1)}% of budget used. Only ${(100 - percentage).toFixed(1)}% remaining.`,
      shouldNotify: true,
    };
  }

  if (percentage >= 75) {
    return {
      level: 'warning',
      percentage: Math.round(percentage * 100) / 100,
      message: `Warning: ${percentage.toFixed(1)}% of budget used. Consider reviewing expenses.`,
      shouldNotify: true,
    };
  }

  if (percentage >= 50) {
    return {
      level: 'info',
      percentage: Math.round(percentage * 100) / 100,
      message: `Info: ${percentage.toFixed(1)}% of budget used. Project is on track.`,
      shouldNotify: true,
    };
  }

  return null;
};

export const calculateDeadlineAlert = (deadline: Date) => {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  let message = '';
  if (isOverdue) {
    message = `Project is ${Math.abs(daysRemaining)} days overdue!`;
  } else if (daysRemaining <= 7) {
    message = `Deadline approaching! Only ${daysRemaining} days remaining.`;
  } else if (daysRemaining <= 30) {
    message = `${daysRemaining} days until deadline.`;
  } else {
    message = `${daysRemaining} days remaining.`;
  }

  return { daysRemaining, isOverdue, message };
};

export const calculateMilestoneAlerts = (milestones: Milestone[]) => {
  const now = new Date();
  const delayedMilestones = milestones.filter(
    (m) =>
      m.status !== 'COMPLETED' &&
      new Date(m.targetDate).getTime() < now.getTime()
  );

  return {
    delayed: delayedMilestones.length,
    message:
      delayedMilestones.length > 0
        ? `${delayedMilestones.length} milestone${delayedMilestones.length > 1 ? 's' : ''} delayed!`
        : 'All milestones on track.',
  };
};

export const generateProjectAlerts = (
  project: Project & { expenses: Expense[]; milestones: Milestone[] },
  totalActualCost: number,
  overheadCost: number
): ProjectAlerts => {
  return {
    budget: calculateBudgetAlert(
      Number(project.projectValue),
      totalActualCost,
      overheadCost
    ),
    deadline: calculateDeadlineAlert(project.deadline),
    milestones: calculateMilestoneAlerts(project.milestones),
  };
};