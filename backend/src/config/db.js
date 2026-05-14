import { readFile } from "node:fs/promises";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { env } from "./env.js";

let db;

export const getDb = () => {
  if (!db) throw new Error("Database not initialized.");
  return db;
};

export const initDatabase = async () => {
  db = await open({
    filename: env.dbPath,
    driver: sqlite3.Database
  });
  await db.exec("PRAGMA foreign_keys = ON;");
  const schemaPath = path.resolve("src/db/schema.sql");
  const schema = await readFile(schemaPath, "utf8");
  await db.exec(schema);
  await db.exec("ALTER TABLE users ADD COLUMN report TEXT;").catch(() => {});
  await db.exec("ALTER TABLE users ADD COLUMN service_needed TEXT;").catch(() => {});
  return db;
};
