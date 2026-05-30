import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1).describe("DATABASE_URL is required"),
  DIRECT_URL: optionalString,

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: optionalString,
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  
  ADMIN_BOOTSTRAP_SECRET: z.string().min(32, 'ADMIN_BOOTSTRAP_SECRET must be at least 32 characters'),

  // URLs
  CLIENT_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  PORT: z.string().default("5000"),

  // Redis
  REDIS_URL: optionalUrl,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,

  // Email - optional in development
  SMTP_HOST: optionalString,
  SMTP_PORT: z.preprocess(emptyToUndefined, z.string().default("587")),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,

  // Payment
  PAYSTACK_SECRET_KEY: optionalString,

  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.parse(process.env);

export const env: Env = parsedEnv;
