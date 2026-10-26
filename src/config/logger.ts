import pino from "pino";
import { env } from "./env.config";

export const logger = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "*.password",
            "token",
            "*.token",
            "cardNumber",
            "cvv",
        ],

        censor: "[REDACTED]"
    },

    transport:
        env.NODE_ENV !== "production" ?
            {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
                    ignore: "pid,hostname",
                },
            }
            : undefined,
});