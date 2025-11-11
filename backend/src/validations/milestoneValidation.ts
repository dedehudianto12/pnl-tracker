import { z } from "zod";

export const createMilestoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Milestone name is required"),
    description: z.string().optional(),
    targetDate: z.iso.date("Invalid deadline format"),
    completionPercentage: z.number().min(0).max(100).default(0),
    status: z
      .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "DELAYED"])
      .default("PENDING"),
    estimatedHours: z.number().positive().optional(),
    actualHours: z.number().positive().optional(),
  }),
});

export const updateMilestoneSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    targetDate: z.iso.date().optional(),
    completionPercentage: z.number().min(0).max(100).optional(),
    status: z
      .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "DELAYED"])
      .optional(),
    estimatedHours: z.number().positive().optional(),
    actualHours: z.number().positive().optional(),
  }),
});
