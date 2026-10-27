import { env } from "../config/env.config";
import { prisma } from "../config/db.config";
import { AppError } from "../middlewares/error.middleware";
import { RegisterInput } from "../schemas/auth.schema";
import bcrypt from "bcrypt";


export const registerUser = async (data: RegisterInput) => {
    const existingUser = await prisma.user.findFirst({
        where:
        {
            OR: [
                { email: data.email },
                { username: data.username },
            ]
        }
    })

    if (existingUser) {
        if (existingUser.email === data.email) {
            throw new AppError("An account with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
        }
        throw new AppError("This username is already taken", 409, "USERNAME_TAKEN");
    }

    const customerRole = await prisma.role.findUnique({
        where: { name: "customer" },
    });

    if (!customerRole) {
        throw new AppError("Default customer role is not configured in database", 500, "ROLE_NOT_CONFIGURED");
    }

    const passwordHash = await bcrypt.hash(data.password, env.SALT_ROUNDS);
    const newUser = await prisma.user.create({
        data: {
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            passwordHash,
            roleId: customerRole.id
        },

        select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            isVerified: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdAt: true,
        },
    });

    return newUser;
}