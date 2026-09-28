import dotenv from "dotenv";

try {
  dotenv.config();
} catch (_) {
  // dotenv loaded via runtime flag or will be loaded when dependencies are installed
}

export interface BackendEnv {
  PORT: number;
  NODE_ENV: string;
  isProduction: boolean;
  isDevelopment: boolean;
  JWT_SECRET: string;
  MONGODB_URI: string;
  CORS_ORIGINS: string[];
  AI_PROVIDER: string;
  AI_API_KEY: string;
  AI_MODEL: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
}

export const env: BackendEnv = {
  // Server
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  isDevelopment: (process.env.NODE_ENV || "development") !== "production",

  // Security / JWT
  JWT_SECRET: process.env.JWT_SECRET || "lucous-development-secret",

  // Database
  MONGODB_URI: process.env.MONGODB_URI || "",

  // CORS
  CORS_ORIGINS: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],

  // AI Integration (OpenAI)
  AI_PROVIDER: (process.env.AI_PROVIDER || "openai").toLowerCase(),
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_MODEL: process.env.AI_MODEL || "gpt-4o-mini",

  // Razorpay Payments
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
};

export default env;
