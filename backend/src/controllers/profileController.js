import { getDb } from "../config/db.js";
import { sanitizeBody, isValidEmail } from "../utils/sanitize.js";

export const getProfile = async (req, res) => {
  res.json({ profile: req.user });
};

export const updateProfile = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  if (body.email && !isValidEmail(body.email)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }
  const fullName = body.full_name || body.name || req.user.full_name;
  const email = (body.email || req.user.email).toLowerCase();
  const phone = body.phone ?? req.user.phone;
  const updatedAt = new Date().toISOString();

  await db.run(
    `UPDATE users
     SET full_name = ?, email = ?, phone = ?, updated_at = ?
     WHERE user_id = ?`,
    [fullName, email, phone, updatedAt, req.user.user_id]
  );

  const profile = await db.get(
    "SELECT user_id, full_name, email, role, phone, created_at, updated_at FROM users WHERE user_id = ?",
    [req.user.user_id]
  );
  res.json({ message: "Profile updated successfully.", profile });
};
