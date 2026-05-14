import { getDb } from "../config/db.js";

export const listNotifications = async (req, res) => {
  const db = getDb();
  const rows = await db.all(
    `SELECT * FROM notifications
     WHERE user_id = ? OR user_id IS NULL
     ORDER BY created_at DESC`,
    [req.user.user_id]
  );
  res.json({ notifications: rows });
};

export const markNotificationRead = async (req, res) => {
  const db = getDb();
  const result = await db.run(
    "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND (user_id = ? OR user_id IS NULL)",
    [req.params.notificationId, req.user.user_id]
  );
  if (!result.changes) return res.status(404).json({ message: "Notification not found." });
  res.json({ message: "Notification marked as read." });
};
