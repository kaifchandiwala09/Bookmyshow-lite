import z from "zod";

const RESERVED_USERNAMES = ["admin", "user", "root", "system", "support", "help", "staff", "manager", "owner", "superadmin"];

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(3, "Full name must be at least 3 characters long")
        .max(100, "Full name can't be longer than 100 characters"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username can't be more than 20 characters long")
        .regex(/^[a-zA-Z]/, "Username must start with a letter")
        .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores, and dots")
        .refine((val) => !/[._]{2,}/.test(val), "Username cannot have consecutive dots or underscores")
        .refine((val) => !RESERVED_USERNAMES.includes(val.toLowerCase()), "This username is reserved and cannot be used")
        .toLowerCase()
        .trim(),
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
    })
    .refine((data) => !data.password.toLowerCase().includes(data.username.toLowerCase()), {
        message: "Password must not contain your username",
        path: ["password"],
    })
    .refine((data) => {
        const emailPrefix = data.email.split("@")[0].toLowerCase();
        return !data.password.toLowerCase().includes(emailPrefix);
    }, {
        message: "Password must not contain your email username",
        path: ["password"],
    });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    identifier: z
        .string()
        .min(3, "Email or Username must be at least 2 characters long")
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

// Username Availability Query Schema
export const usernameAvailabilitySchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username can't be more than 20 characters long")
        .regex(/^[a-zA-Z]/, "Username must start with a letter")
        .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores, and dots")
        .refine((val) => !/[._]{2,}/.test(val), "Username cannot have consecutive dots or underscores")
        .refine((val) => !RESERVED_USERNAMES.includes(val.toLowerCase()), "This username is reserved and cannot be used")
        .toLowerCase()
        .trim(),
});

export type UsernameAvailabilityInput = z.infer<typeof usernameAvailabilitySchema>;