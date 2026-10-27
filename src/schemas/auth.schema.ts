import z from "zod";

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(3, "Full name must be at least 3 characters long")
            .max(100, "Full name can't be longer than 100 characters"),
        username: z
            .string()
            .min(3, "Username must be at least 3 characters long")
            .max(30, "Username can't be more than 30 characters long")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
            .toLowerCase(),
        email: z
            .email("Provide a valid email address")
            .toLowerCase(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(32, "Password can't be longer than 32 characters")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z
            .string()
            .min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterInput = z.infer<typeof registerSchema>;
