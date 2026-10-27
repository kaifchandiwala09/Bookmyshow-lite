import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";


export interface AccessTokenPayload {
    sub: string;
    email: string;
    role: string;
}

export interface RefershTokenPayload {
    sub: string;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFERSH_TOKEN_EXPIRY = "7d";

export const generateAccessToken = (payload: AccessTokenPayload): string => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        algorithm: "HS256",
        issuer: "BookMyShow-Lite"
    });
}

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export const generateRefereshToken = (userId: string): string => {
    const payload: RefershTokenPayload = { sub: userId };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: REFERSH_TOKEN_EXPIRY,
        algorithm: "HS256",
        issuer: "BookMyShow-Lite"
    });
};

export const verifyRefreshToken = (token: string): RefershTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefershTokenPayload;
}
