import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../config/logger";

export const httpLogger = pinoHttp({
    logger,
    genReqId: (req, res) => {
        const existingId = req.headers["x-request-id"];
        if (existingId) return existingId as string;

        const id = randomUUID();
        res.setHeader("X-Request-Id", id);
        return id;
    },
    
    customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },
});
