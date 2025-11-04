import { z } from "zod";

export const ExpenseCategoryEnum = z.enum(
  ["MATERIALS", "MANPOWER", "TOOLS", "OTHER"],
  {
    message: "Please select a valid expense category.",
  }
);

export const RecurringIntervalEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"], {
  message: "Please select a valid recurring interval.",
});

export const CreateExpenseSchema = z.object({
  category: ExpenseCategoryEnum,
  name: z.string().min(1, { message: "Expense name is required." }),
  description: z.string().optional(),
  estimatedCost: z.coerce
    .number()
    .positive({ message: "Estimated cost must be positive." }),
  actualCost: z.coerce
    .number()
    .positive({ message: "Actual cost must be positive." })
    .optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: RecurringIntervalEnum.optional(),
  dateIncurred: z.string().optional(),
});

export const UpdateExpenseSchema = z.object({
  category: ExpenseCategoryEnum.optional(),
  name: z.string().min(1, { message: "Expense name is required." }).optional(),
  description: z.string().optional(),
  estimatedCost: z.coerce
    .number()
    .positive({ message: "Estimated cost must be positive." })
    .optional(),
  actualCost: z.coerce
    .number()
    .positive({ message: "Actual cost must be positive." })
    .optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: RecurringIntervalEnum.optional(),
  dateIncurred: z.string().optional(),
});

export type CreateExpenseFormValues = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseFormValues = z.infer<typeof UpdateExpenseSchema>;
