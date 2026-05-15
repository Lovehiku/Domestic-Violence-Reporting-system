import { getDb } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const adminListUsers = async (_req, res) => {
  try {
    const db = getDb();
    const users = await db.all(
      "SELECT user_id, full_name, email, role, phone, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body;
    const db = getDb();

    const exists = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (exists)
      return res.status(409).json({ message: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, full_name, email, hashedPassword, role, phone || "", now, now],
    );

    res.status(201).json({ message: "User created successfully.", user_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { full_name, email, role, phone } = req.body;
    const db = getDb();
    const now = new Date().toISOString();

    const result = await db.run(
      "UPDATE users SET full_name = ?, email = ?, role = ?, phone = ?, updated_at = ? WHERE user_id = ?",
      [full_name, email, role, phone || "", now, req.params.userId],
    );

    if (result.changes === 0)
      return res.status(404).json({ message: "User not found." });
    res.json({ message: "User updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run("DELETE FROM users WHERE user_id = ?", [
      req.params.userId,
    ]);
    if (result.changes === 0)
      return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminListReports = async (_req, res) => {
  try {
    const db = getDb();
    const reports = await db.all(
      `SELECT r.*, u.full_name, u.email 
       FROM arada_kefele_ketema_women_child_office_issues r 
       LEFT JOIN users u ON r.user_id = u.user_id 
       ORDER BY r.reported_at DESC`,
    );
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminUpdateReport = async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    const now = new Date().toISOString();

    const result = await db.run(
      "UPDATE arada_kefele_ketema_women_child_office_issues SET status = ?, updated_at = ? WHERE issue_id = ?",
      [status, now, req.params.issueId],
    );

    if (result.changes === 0)
      return res.status(404).json({ message: "Report not found." });
    res.json({ message: "Report updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminDeleteReport = async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run(
      "DELETE FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?",
      [req.params.issueId],
    );
    if (result.changes === 0)
      return res.status(404).json({ message: "Report not found." });
    res.json({ message: "Report deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
