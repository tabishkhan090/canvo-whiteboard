import { z } from "zod"

export const CreateUserSchema = z.object({
    password: z.string()
        .min(5, "Password must be at least 5 characters")
        .max(20)
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[a-z]/, "Must contain one lowercase letter")
        .regex(/[0-9]/, "Must contain one number")
        .regex(/[^A-Za-z0-9]/, "Must contain one special character"),

    email: z.string()
        .email("Invalid email format")
        .trim(),

    name: z.string()
        .min(1, "Name is required")
        .trim(),
});

export const SigninSchema = z.object({
    username: z.string()
        .email("Invalid email format")
        .trim(),
    password: z.string()
        .min(5, "Password must be at least 5 characters")
        .max(20)
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[a-z]/, "Must contain one lowercase letter")
        .regex(/[0-9]/, "Must contain one number")
        .regex(/[^A-Za-z0-9]/, "Must contain one special character"),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(1).max(20),
})