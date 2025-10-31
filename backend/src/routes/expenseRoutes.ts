import { Router } from 'express';
import { expenseController } from '../controllers/expenseController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
} from '../validations/expenseValidation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Expense CRUD
router.post(
  '/projects/:projectId/expenses',
  validate(createExpenseSchema),
  expenseController.createExpense
);
router.get(
  '/projects/:projectId/expenses',
  expenseController.getProjectExpenses
);
router.get('/expenses/:expenseId', expenseController.getExpenseById);
router.put(
  '/expenses/:expenseId',
  validate(updateExpenseSchema),
  expenseController.updateExpense
);
router.delete('/expenses/:expenseId', expenseController.deleteExpense);

export default router;