import { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "../services/auth.service";

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