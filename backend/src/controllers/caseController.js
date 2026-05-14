import { getDb } from "../config/db.js";

export const getCaseHistory = async (req, res) => {
  const db = getDb();
  const { userId } = req.params;

  if (req.user.role === "victim" && req.user.user_id !== userId) {
    return res.status(403).json({ message: "You may only view your own case history." });
  }
  if (req.user.role === "victim" || req.user.role === "support_staff" || req.user.role === "admin") {
    const reports = await db.all(
      "SELECT * FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ? ORDER BY reported_at DESC",
      [userId]
    );
    const supportRequests = await db.all("SELECT * FROM support_requests WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return res.json({ user_id: userId, reports, support_requests: supportRequests });
  }
  return res.status(403).json({ message: "Unauthorized role for case history." });
};
