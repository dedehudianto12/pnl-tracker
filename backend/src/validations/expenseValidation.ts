import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.enum(['MATERIALS', 'MANPOWER', 'TOOLS', 'OTHER']),
    name: z.string().min(1, 'Expense name is required'),
    description: z.string().optional(),
    estimatedCost: z.number().positive('Estimated cost must be positive'),
    actualCost: z.number().positive().optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    dateIncurred: z.string().datetime().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    category: z.enum(['MATERIALS', 'MANPOWER', 'TOOLS', 'OTHER']).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    estimatedCost: z.number().positive().optional(),
    actualCost: z.number().positive().optional(),
    isRecurring: z.boolean().optional(),
    recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    dateIncurred: z.string().datetime().optional(),
  }),
});