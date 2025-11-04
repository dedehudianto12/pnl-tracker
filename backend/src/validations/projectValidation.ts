import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    projectValue: z.number().positive("Project value must be positive"),
    deadline: z.iso.date("Invalid deadline format"),
    overheadPercentage: z.number().min(0).max(100).optional(),
    currency: z.string().default("USD"),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    projectValue: z.number().positive().optional(),
    deadline: z.iso.date().optional(),
    overheadPercentage: z.number().min(0).max(100).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    role: z.enum(["MEMBER", "EDITOR", "VIEWER"]).default("MEMBER"),
  }),
});
