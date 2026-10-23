import dotenv from "dotenv";
import z from "zod";
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "staging"]).default("development"),
    PORT: z.coerce.number().default(5000),
    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET Must be atleast 32 character long"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET Must be atleast 32 character long"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.log('Invalid environment variables:');
    console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}

export const env = parsedEnv.data;