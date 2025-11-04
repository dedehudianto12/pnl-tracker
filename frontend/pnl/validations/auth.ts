import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "A valid email is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "A valid email is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
