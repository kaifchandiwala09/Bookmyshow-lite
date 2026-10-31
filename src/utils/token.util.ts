import crypto from "node:crypto";
import net from "node:net";

export const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export const sanitizeIp = (rawIp?: string): string | null => {
    if (!rawIp) return null;
    const cleanIp = rawIp.replace(/^::ffff:/, "");
    return net.isIP(cleanIp) !== 0 ? cleanIp : null;
}