import { z } from "zod";

export const CreateUserSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    username: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    password: z
        .string()
        .min(4, "Password must be at least 4 characters")
        .max(20, "Password cannot exceed 20 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const SigninSchema = z.object({
    username: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    password: z
        .string()
        .min(4, "Password must be at least 4 characters")
        .max(20, "Password cannot exceed 20 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(1).max(20),
})