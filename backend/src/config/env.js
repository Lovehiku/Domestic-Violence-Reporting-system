import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "safehaven-dev-secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  dbPath: process.env.DB_PATH || "./safehaven.sqlite"
};
