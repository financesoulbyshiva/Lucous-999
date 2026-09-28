try {
  require("dotenv").config();
} catch (_) {
  // dotenv not installed yet or loaded via Node --env-file
}

const env = {
  // Server
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  isDevelopment: (process.env.NODE_ENV || "development") !== "production",

  // Security / JWT
  JWT_SECRET: process.env.JWT_SECRET || "lucous-development-secret",

  // Database (used by Prisma datasource in schema.prisma)
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

module.exports = env;
module.exports.env = env;
