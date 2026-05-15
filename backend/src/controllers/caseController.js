import { getDb } from "../config/db.js";

export const getCaseHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();

    if (req.user.role === "victim" && req.user.user_id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You may only view your own case history." });
    }

    const reports = await db.all(
      "SELECT * FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ? ORDER BY reported_at DESC",
      [userId],
    );

    const supportRequests = await db.all(
      "SELECT * FROM support_requests WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    return res.json({
      user_id: userId,
      reports,
      support_requests: supportRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
