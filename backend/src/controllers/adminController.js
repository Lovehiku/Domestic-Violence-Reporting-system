import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";
import { sanitizeBody, isValidEmail } from "../utils/sanitize.js";

export const adminListUsers = async (_req, res) => {
  const db = getDb();
  const users = await db.all("SELECT user_id, full_name, email, role, phone, created_at, updated_at FROM users ORDER BY created_at DESC");
  res.json({ users });
};

export const adminCreateUser = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  const role = ["victim", "support_staff", "admin"].includes(body.role) ? body.role : "victim";
  if (!body.full_name || !body.email || !body.password) {
    return res.status(400).json({ message: "full_name, email, and password are required." });
  }
  if (!isValidEmail(body.email)) return res.status(400).json({ message: "Invalid email format." });
  const exists = await db.get("SELECT user_id FROM users WHERE email = ?", [body.email.toLowerCase()]);
  if (exists) return res.status(409).json({ message: "Email already exists." });
  const now = new Date().toISOString();
  const userId = uuidv4();
  await db.run(
    "INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [userId, body.full_name, body.email.toLowerCase(), await bcrypt.hash(body.password, 10), role, body.phone || "", now, now]
  );
  res.status(201).json({ message: "User created successfully.", user_id: userId });
};

export const adminUpdateUser = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  const existing = await db.get("SELECT * FROM users WHERE user_id = ?", [req.params.userId]);
  if (!existing) return res.status(404).json({ message: "User not found." });
  const role = body.role && ["victim", "support_staff", "admin"].includes(body.role) ? body.role : existing.role;
  const fullName = body.full_name || existing.full_name;
  const email = (body.email || existing.email).toLowerCase();
  const phone = body.phone ?? existing.phone;
  if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email format." });
  await db.run("UPDATE users SET full_name = ?, email = ?, role = ?, phone = ?, updated_at = ? WHERE user_id = ?", [
    fullName,
    email,
    role,
    phone,
    new Date().toISOString(),
    req.params.userId
  ]);
  res.json({ message: "User updated successfully." });
};

export const adminDeleteUser = async (req, res) => {
  const db = getDb();
  const result = await db.run("DELETE FROM users WHERE user_id = ?", [req.params.userId]);
  if (!result.changes) return res.status(404).json({ message: "User not found." });
  res.json({ message: "User deleted successfully." });
};

export const adminListReports = async (_req, res) => {
  const db = getDb();
  const reports = await db.all("SELECT * FROM arada_kefele_ketema_women_child_office_issues ORDER BY reported_at DESC");
  res.json({ reports });
};

export const adminUpdateReport = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  const existing = await db.get("SELECT issue_id FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?", [
    req.params.issueId
  ]);
  if (!existing) return res.status(404).json({ message: "Report not found." });
  const allowed = ["under_review", "in_progress", "resolved", "ongoing", "solved"];
  const status = allowed.includes(body.status) ? body.status : "under_review";
  await db.run(
    "UPDATE arada_kefele_ketema_women_child_office_issues SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? IN ('resolved','solved') THEN ? ELSE resolved_at END WHERE issue_id = ?",
    [status, new Date().toISOString(), status, new Date().toISOString(), req.params.issueId]
  );
  res.json({ message: "Report updated successfully." });
};

export const adminDeleteReport = async (req, res) => {
  const db = getDb();
  const result = await db.run("DELETE FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?", [req.params.issueId]);
  if (!result.changes) return res.status(404).json({ message: "Report not found." });
  res.json({ message: "Report deleted successfully." });
};
