import { Request, Response } from "express";

export const getHealth = (req: Request, res: Response) => {
    res.status(200).json({
        status: "Online",
        message: "Server is healthy and running smoothly",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
}