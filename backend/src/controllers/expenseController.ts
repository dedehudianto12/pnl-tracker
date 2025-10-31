import { expenseService } from '../services/expenseService.js';
import { AuthRequest } from '../types/index.js';
import { Response } from 'express';

export const expenseController = {
  async createExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const expense = await expenseService.createExpense(
        projectId,
        userId,
        req.body
      );
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async getProjectExpenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const result = await expenseService.getProjectExpenses(projectId, userId);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async getExpenseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { expenseId } = req.params;
      const expense = await expenseService.getExpenseById(expenseId, userId);
      res.json(expense);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async updateExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { expenseId } = req.params;
      const expense = await expenseService.updateExpense(
        expenseId,
        userId,
        req.body
      );
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async deleteExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { expenseId } = req.params;
      const result = await expenseService.deleteExpense(expenseId, userId);
      res.json(result);
    } catch (error) {
      res.status(403).json({ error: (error as Error).message });
    }
  },
};