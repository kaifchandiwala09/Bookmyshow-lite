import { Request, Response, NextFunction } from "express";
import { checkUsernameAvailability, getUserProfile, loginUser, registerUser } from "../services/auth.service";
import { usernameAvailabilitySchema } from "../schemas/auth.schema";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await registerUser(req.body);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export const checkUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = usernameAvailabilitySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid username format",
                errors: parsed.error.format(),
            });
        }

        const result = await checkUsernameAvailability(parsed.data.username);
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await loginUser(req.body);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: result,
        })
    } catch (err) {
        next(err);
    }
}

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.sub;
        const user = await getUserProfile(userId);
        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: user
        });
    } catch (err) {
        next(err);
    }
}