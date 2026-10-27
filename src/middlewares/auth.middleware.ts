import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "./error.middleware";
import { verifyAccessToken } from "../utils/jwt.util";


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Access token is missing or malformed", "TOKEN_MISSING");
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new UnauthorizedError("Access token has expired", "TOKEN_EXPIRED");
        }
        throw new UnauthorizedError("Invalid access token", "INVALID_TOKEN");
    }
}

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ForbiddenError(`Access denied. Requires one of [${allowedRoles.join(",")}]`, "FORBIDDEN_ROLE");
        }

        next();
    }
}