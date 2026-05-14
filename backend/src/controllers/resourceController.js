import { getDb } from "../config/db.js";

export const listResources = async (_req, res) => {
  const db = getDb();
  const resources = await db.all("SELECT * FROM resources WHERE is_active = 1 ORDER BY category, name");
  res.json({ resources });
};
