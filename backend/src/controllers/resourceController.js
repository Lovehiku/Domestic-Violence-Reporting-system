import { getDb } from "../config/db.js";

export const listResources = async (_req, res) => {
  try {
    const db = getDb();
    const resources = await db.all(
      "SELECT * FROM resources WHERE is_active = 1 ORDER BY category, name",
    );
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
