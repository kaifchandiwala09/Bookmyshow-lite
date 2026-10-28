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

export const checkUsernameAvailability = async (rawUsername: string) => {
    const username = rawUsername.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    })

    if (!existingUser) {
        return { available: true }
    }
    const candidates: string[] = [];
    const currentYear = new Date().getFullYear().toString().slice(-2);

    candidates.push(`${username}${Math.floor(10 + Math.random() * 90)}`);
    candidates.push(`${username}_${Math.floor(10 + Math.random() * 90)}`);
    candidates.push(`${username}.${currentYear}`);
    candidates.push(`${username}_dev`);
    candidates.push(`${username}${Math.floor(100 + Math.random() * 900)}`);

    const validCandidates = candidates.filter((c) => c.length <= 20);

    const takenRecords = await prisma.user.findMany({
        where: {
            username: { in: validCandidates },
        },
        select: {
            username: true
        }
    });

    const takenUsernames = new Set(takenRecords.map((r) => r.username.toLowerCase()));

    const availableSuggestions = validCandidates
        .filter((candidate) => !takenUsernames.has(candidate.toLowerCase()))
        .slice(0, 3);

    return {
        available: false,
        suggestions: availableSuggestions
    }
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

    if (!user || !user.passwordHash) {
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

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
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
                }
            },
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return user;
}