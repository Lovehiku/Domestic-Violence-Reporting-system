import { getDb } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createFeedback = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    if (!comment) return res.status(400).json({ message: "Feedback comment is required." });
    
    const db = getDb();
    const feedback_id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO feedback (feedback_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)",
      [feedback_id, req.user.user_id, rating || 5, comment, now]
    );
    
    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
