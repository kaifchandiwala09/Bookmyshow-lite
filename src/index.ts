import express from "express";
import healthRoutes from "./routes/health.routes";
import { env } from "./config/env.config";
import { AppError, errorHandler } from "./middlewares/error.middleware";
import { logger } from "./config/logger";
import { httpLogger } from "./middlewares/logger.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./docs/swagger";
import { prisma } from "./config/db.config";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(express.json());
app.use(httpLogger);

app.use("/health", healthRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1/auth", authRoutes);


app.use((req, _res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"));
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
    logger.info(`Server running at http://localhost:${env.PORT}`);
});

const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
        logger.info("HTTP server closed.");
        try {
            await prisma.$disconnect();
            logger.info("Database connection closed cleanly.");
            process.exit(0);
        } catch (error) {
            logger.error({ error }, "Error while closing database connection");
            process.exit(1);
        }
    });
    setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 10000).unref();
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

server.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
        logger.error(`Port ${env.PORT} is already in use.`);
    } else {
        logger.error({ err }, "Server failed to start");
    }
    process.exit(1);
});