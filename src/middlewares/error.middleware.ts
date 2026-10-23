import { Request, Response, NextFunction } from "express";


export class AppError extends Error {
    public statusCode: number;
    public code: string;

    constructor(message: string, statusCode: number, code: string = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}


export const errorHandler = (
    err: any,
    req_: Request,
    res: Response,
    next_: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const code = err.code || "INTERNAL_SERVER_ERROR";
    
    return res.status(statusCode).json({
        success: false,
        error: {
            code: code,
            message: message,
        }
    })
}