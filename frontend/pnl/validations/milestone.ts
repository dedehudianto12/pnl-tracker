import { z } from "zod";

export const MilestoneStatusEnum = z.enum(
  ["PENDING", "IN_PROGRESS", "COMPLETED", "DELAYED"],
  {
    message: "Please select a valid milestone status.",
  }
);

export const CreateMilestoneSchema = z.object({
  name: z.string().min(1, { message: "Milestone name is required." }),
  description: z.string().optional(),
  targetDate: z.string().min(1, { message: "Target date is required." }),
  completionPercentage: z.coerce.number().min(0).max(100).default(0),
  status: MilestoneStatusEnum.default("PENDING"),
  estimatedHours: z.coerce
    .number()
    .positive({ message: "Estimated hours must be positive." })
    .optional(),
  actualHours: z.coerce
    .number()
    .positive({ message: "Actual hours must be positive." })
    .optional(),
});

export const UpdateMilestoneSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Milestone name is required." })
    .optional(),
  description: z.string().optional(),
  targetDate: z
    .string()
    .min(1, { message: "Target date is required." })
    .optional(),
  completionPercentage: z.coerce.number().min(0).max(100).optional(),
  status: MilestoneStatusEnum.optional(),
  estimatedHours: z.coerce
    .number()
    .positive({ message: "Estimated hours must be positive." })
    .optional(),
  actualHours: z.coerce
    .number()
    .positive({ message: "Actual hours must be positive." })
    .optional(),
});

export type CreateMilestoneFormValues = z.infer<typeof CreateMilestoneSchema>;
export type UpdateMilestoneFormValues = z.infer<typeof UpdateMilestoneSchema>;
