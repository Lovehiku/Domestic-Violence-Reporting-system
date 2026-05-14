import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";
import { sanitizeBody } from "../utils/sanitize.js";

export const createFeedback = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  if (!body.comment) return res.status(400).json({ message: "Feedback comment is required." });
  const rating = Number(body.rating || 5);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5." });
  }
  await db.run(
    `INSERT INTO feedback (feedback_id, user_id, rating, comment, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), req.user.user_id, rating, body.comment, new Date().toISOString()]
  );
  res.status(201).json({ message: "Feedback submitted successfully." });
};
