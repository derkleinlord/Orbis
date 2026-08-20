import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { z } from "zod";

config({ path: resolve(fileURLToPath(new URL("../../../../.env", import.meta.url))) });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  DB_HOST: z.string().min(1).default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default("orbis"),
  DB_PASSWORD: z.string().default(""),
  DB_DATABASE: z.string().regex(/^[a-zA-Z0-9_]+$/).default("orbis"),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  SESSION_SECRET: z.string().min(32).default("dev-orbis-session-secret-change-now"),
  BOOTSTRAP_ADMIN_USERNAME: z.string().min(3).default("dennis"),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).default("orbis2026"),
  BOOTSTRAP_ADMIN_DISPLAY_NAME: z.string().min(1).default("Dennis Lucking")
});

export const env = schema.parse(process.env);
