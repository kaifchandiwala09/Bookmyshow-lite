import { env } from "../config/env.config";
import { prisma } from "../config/db.config";
import { AppError } from "../middlewares/error.middleware";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefereshToken } from "../utils/jwt.util";
import { access } from "node:fs";


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

export const loginUser = async (data: LoginInput) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: data.identifier },
                { username: data.identifier }
            ],
        },
        include: {
            role: true,
        }
    });

    if (!user) {
        throw new AppError("Invalid login credentials!", 401, "INVALID_LOGIN_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AppError("Invalid login credentials!", 401, "INVALID_LOGIN_CREDENTIALS");
    }

    const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role.name,
    });
    const refreshToken = generateRefereshToken(user.id);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            roleId: user.roleId,
            createdAt: user.createdAt,
        },
    };
}