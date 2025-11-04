import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }),
  description: z.string().optional(),
  projectValue: z
    .number()
    .positive({ message: "Project value must be positive." }),
  deadline: z.string().min(1, { message: "Deadline is required." }),
  overheadPercentage: z.number().min(0).max(100).optional(),
  currency: z.string().default("USD"),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }).optional(),
  description: z.string().optional(),
  projectValue: z.coerce
    .number()
    .positive({ message: "Project value must be positive." })
    .optional(),
  deadline: z.string().min(1, { message: "Deadline is required." }).optional(),
  overheadPercentage: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export const AddMemberSchema = z.object({
  email: z.string().email({ message: "A valid email is required." }),
  role: z.enum(["MEMBER", "EDITOR", "VIEWER"], {
    message: "Please select a valid role.",
  }),
});

export type CreateProjectFormValues = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof UpdateProjectSchema>;
export type AddMemberFormValues = z.infer<typeof AddMemberSchema>;
