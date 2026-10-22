import express from "express";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.use("/health", healthRoutes)


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});