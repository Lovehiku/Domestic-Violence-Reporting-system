import { getDb } from "../config/db.js";

export const getProfile = async (req, res) => {
  try {
    const db = getDb();
    const user = await db.get(
      "SELECT user_id, full_name, email, role, phone FROM users WHERE user_id = ?",
      [req.user.user_id],
    );
    res.json({ profile: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const db = getDb();
    const now = new Date().toISOString();

    await db.run(
      "UPDATE users SET full_name = ?, phone = ?, updated_at = ? WHERE user_id = ?",
      [full_name, phone, now, req.user.user_id],
    );

    const user = await db.get(
      "SELECT user_id, full_name, email, role, phone FROM users WHERE user_id = ?",
      [req.user.user_id],
    );
    res.json({ message: "Profile updated", profile: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
