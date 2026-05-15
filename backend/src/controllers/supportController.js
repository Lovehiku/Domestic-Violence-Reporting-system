import { getDb } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createSupportRequest = async (req, res) => {
  try {
    const { support_type, message, issue_id } = req.body;
    const db = getDb();
    const request_id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO support_requests (request_id, user_id, issue_id, support_type, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        request_id,
        req.user.user_id,
        issue_id || null,
        support_type,
        message,
        "open",
        now,
        now,
      ],
    );

    res.status(201).json({ message: "Support request sent", request_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySupportRequests = async (req, res) => {
  try {
    const db = getDb();
    const requests = await db.all(
      "SELECT * FROM support_requests WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.user_id],
    );
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSupportRequests = async (req, res) => {
  try {
    const db = getDb();
    const requests = await db.all(
      `SELECT sr.*, u.full_name, u.email 
       FROM support_requests sr 
       JOIN users u ON sr.user_id = u.user_id 
       ORDER BY sr.created_at DESC`,
    );
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
