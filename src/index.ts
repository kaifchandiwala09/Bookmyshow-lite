import express from "express";
import healthRoutes from "./routes/health.routes";
import { env } from "./config/env.config";
import z from "zod";
import { validate } from "./middlewares/validate.middleware";

const app = express();
app.use(express.json());


app.use("/health", healthRoutes)


const testSchema = z.object({
    name: z.string().min(3, "Name must be atleast 3 characters"),
    age: z.number().min(18, "Age must be atleast 18"),
});


app.post("/test-validation", validate(testSchema), (req, res) => {
    res.json({
        success: true,
        message: "Validation Successfull",
        data: req.body,
    });
});

const server = app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
});

server.on('error', (err) => {
    if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        console.error(`Port ${env.PORT} is already in use.`);
    } else {
        console.error('Server failed to start:', err);
    }
    process.exit(1);
});