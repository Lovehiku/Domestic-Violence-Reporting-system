import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { env } from "./env.js";
import fs from "fs";
import path from "path";

let db;

export const initDatabase = async () => {
  try {
    db = await open({
      filename: env.dbPath,
      driver: sqlite3.Database,
    });
    console.log(`SQLite Database Connected at ${env.dbPath}`);

    // Run schema if needed
    const schemaPath = path.resolve("src/db/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      await db.exec(schema);
      console.log("Database schema applied");
    }

    return db;
  } catch (error) {
    console.error(`Error connecting to SQLite: ${error.message}`);
    process.exit(1);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase first.");
  }
  return db;
};
