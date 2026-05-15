import { getDb } from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "support_staff";
    const db = getDb();
    
    let stats = {};

    if (isAdmin) {
      const totalReports = await db.get("SELECT COUNT(*) as count FROM arada_kefele_ketema_women_child_office_issues");
      const pendingCases = await db.get("SELECT COUNT(*) as count FROM arada_kefele_ketema_women_child_office_issues WHERE status = 'under_review'");
      const resolvedCases = await db.get("SELECT COUNT(*) as count FROM arada_kefele_ketema_women_child_office_issues WHERE status IN ('resolved', 'solved')");
      const activeRequests = await db.get("SELECT COUNT(*) as count FROM support_requests WHERE status != 'closed'");

      stats = {
        "Total Reports": totalReports.count,
        "Pending Review": pendingCases.count,
        "Resolved Cases": resolvedCases.count,
        "Active Requests": activeRequests.count
      };
    } else {
      const totalReports = await db.get("SELECT COUNT(*) as count FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ?", [req.user.user_id]);
      const pendingCases = await db.get("SELECT COUNT(*) as count FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ? AND status = 'under_review'", [req.user.user_id]);
      const resolvedCases = await db.get("SELECT COUNT(*) as count FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ? AND status IN ('resolved', 'solved')", [req.user.user_id]);
      const activeRequests = await db.get("SELECT COUNT(*) as count FROM support_requests WHERE user_id = ? AND status != 'closed'", [req.user.user_id]);

      stats = {
        "My Reports": totalReports.count,
        "Pending Review": pendingCases.count,
        "Resolved Cases": resolvedCases.count,
        "Support Requests": activeRequests.count
      };
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
