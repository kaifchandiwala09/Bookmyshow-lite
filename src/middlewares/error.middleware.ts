import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, code: string = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request", code: string = "BAD_REQUEST") {
        super(message, 400, code)
    }
}

export class UnauthorizedError  extends AppError {
    constructor(message: string = "Unauthorized", code: string = "UNAUTHORIZED") {
        super(message, 401, code);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden", code: string = "FORBIDDEN") {
        super(message, 403, code);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource Not Found", code: string = "NOT_FOUND") {
        super(message, 404, code);
    }
}
export class ConflictError extends AppError {
    constructor(message: string = "Conflict", code: string = "CONFLICT") {
        super(message, 409, code);
    }
}

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }

    console.error("UNEXPECTED BUG:", err);

    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong on our end",
        },
    });
}