import { getDb } from "../config/db.js";

export const listNotifications = async (req, res) => {
  try {
    const db = getDb();
    const notifications = await db.all(
      "SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC",
      [req.user.user_id],
    );
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run(
      "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND (user_id = ? OR user_id IS NULL)",
      [req.params.notificationId, req.user.user_id],
    );
    if (result.changes === 0)
      return res.status(404).json({ message: "Notification not found." });
    res.json({ message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
