import prisma from '../config/database.js';
import { ExpenseCategory, RecurringInterval, Prisma } from '@prisma/client';

export const expenseService = {
  async createExpense(
    projectId: string,
    userId: string,
    data: {
      category: ExpenseCategory;
      name: string;
      description?: string;
      estimatedCost: number;
      actualCost?: number;
      isRecurring?: boolean;
      recurringInterval?: RecurringInterval;
      dateIncurred?: string;
    }
  ) {
    // Check if user has access to project
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Project not found or access denied');
    }

    const expense = await prisma.expense.create({
      data: {
        ...data,
        projectId,
        dateIncurred: data.dateIncurred ? new Date(data.dateIncurred) : null,
      },
    });

    return expense;
  },

  async getProjectExpenses(projectId: string, userId: string) {
    // Check access
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Project not found or access denied');
    }

    const expenses = await prisma.expense.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals by category
    const summary = expenses.reduce(
      (acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = {
            estimatedTotal: 0,
            actualTotal: 0,
            count: 0,
          };
        }
        acc[category].estimatedTotal += Number(expense.estimatedCost);
        acc[category].actualTotal += expense.actualCost
          ? Number(expense.actualCost)
          : 0;
        acc[category].count += 1;
        return acc;
      },
      {} as Record<
        string,
        { estimatedTotal: number; actualTotal: number; count: number }
      >
    );

    return { expenses, summary };
  },

  async getExpenseById(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { project: true },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    const hasAccess = await this.checkProjectAccess(expense.projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return expense;
  },

  async updateExpense(
    expenseId: string,
    userId: string,
    data: Partial<{
      category: ExpenseCategory;
      name: string;
      description: string;
      estimatedCost: number;
      actualCost: number;
      isRecurring: boolean;
      recurringInterval: RecurringInterval;
      dateIncurred: string;
    }>
  ) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if user can edit (owner or editor)
    const canEdit = await this.checkEditPermission(expense.projectId, userId);
    if (!canEdit) {
      throw new Error('Insufficient permissions');
    }

    const updateData: Prisma.ExpenseUpdateInput = {};
    if (data.category) updateData.category = data.category;
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.estimatedCost) updateData.estimatedCost = data.estimatedCost;
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.recurringInterval !== undefined)
      updateData.recurringInterval = data.recurringInterval;
    if (data.dateIncurred)
      updateData.dateIncurred = new Date(data.dateIncurred);

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });

    return updatedExpense;
  },

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if user can delete (owner or editor)
    const canEdit = await this.checkEditPermission(expense.projectId, userId);
    if (!canEdit) {
      throw new Error('Insufficient permissions');
    }

    await prisma.expense.delete({ where: { id: expenseId } });
    return { message: 'Expense deleted successfully' };
  },

  // Helper methods
  async checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });
    return !!project;
  },

  async checkEditPermission(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['EDITOR', 'MEMBER'] } } } },
        ],
      },
    });
    return !!project;
  },
};