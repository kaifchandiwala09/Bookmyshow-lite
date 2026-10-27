import { env } from "../config/env.config";

export const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "BookMyShow Lite API",
        version: "1.0.0",
        description: "Production-grade backend for BookMyShow-Lite ticket booking platform",
    },
    servers: [
        {
            url: `http://${env.API_HOST}:${env.PORT}`,
            description: "Development Server",
        },
    ],
    tags: [
        {
            name: "Health",
            description: "System health check endpoints",
        },
        {
            name: "Auth",
            description: "Authentication APIs",
        },
    ],
    paths: {

        // Health API
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

        // Register User
        "/api/v1/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register a new user",
                description: "Creates a new user account",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "fullName",
                                    "username",
                                    "email",
                                    "password",
                                    "confirmPassword",
                                ],
                                properties: {
                                    fullName: {
                                        type: "string",
                                        example: "Rahul Sharma",
                                    },
                                    username: {
                                        type: "string",
                                        example: "rahul123",
                                    },
                                    email: {
                                        type: "string",
                                        format: "email",
                                        example: "rahul@example.com",
                                    },
                                    password: {
                                        type: "string",
                                        format: "password",
                                        example: "SecurePass123!",
                                    },
                                    confirmPassword: {
                                        type: "string",
                                        format: "password",
                                        example: "SecurePass123!",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "User registered successfully",
                    },
                    409: {
                        description: "Invalid registration Email or username taken",
                    },
                    500: {
                        description: "Internal server error",
                    },
                },
            },
        },
    },
};
