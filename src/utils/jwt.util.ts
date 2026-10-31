import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";


export interface AccessTokenPayload {
    sub: string;
    email: string;
    role: string;
}

export interface RefreshTokenPayload {
    sub: string;
    jti: string;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

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
    const payload: RefreshTokenPayload = { sub: userId, jti: crypto.randomUUID() };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        algorithm: "HS256",
        issuer: "BookMyShow-Lite"
    });
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
