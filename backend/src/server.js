import app from "./app.js";
import { env } from "./config/env.js";
import { initDatabase } from "./config/db.js";
import { seedDatabase } from "./db/seed.js";

const start = async () => {
  await initDatabase();
  await seedDatabase();
  app.listen(env.port, () => {
    console.log(`SafeHaven backend running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
