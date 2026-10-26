import { env } from "../config/env.config";

export const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "BookMyShow Lite API",
        version: "1.0.0",
        description: "Production-grade backend for BookMyShow Lite ticket booking platform",
    },
    servers: [
        {
            url: `http://localhost:${env.PORT}`,
            description: "Development Server",
        },
    ],
    tags: [
        {
            name: "Health",
            description: "System health check endpoints",
        },
    ],
    paths: {
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Health Check",
                description: "Returns server status, timestamp, and uptime",
                responses: {
                    200: {
                        description: "Server is online and healthy",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "Online" },
                                        message: { type: "string", example: "Server is healthy and running smoothly" },
                                        timestamp: { type: "string", example: "2026-10-26T14:30:00.000Z" },
                                        uptime: { type: "number", example: 12.34 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
