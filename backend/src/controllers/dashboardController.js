import { getDb } from "../config/db.js";

export const getDashboard = async (req, res) => {
  const db = getDb();
  if (req.user.role === "victim") {
    const totalReports = await db.get(
      "SELECT COUNT(*) AS count FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ?",
      [req.user.user_id]
    );
    const activeReports = await db.get(
      "SELECT COUNT(*) AS count FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ? AND status NOT IN ('resolved','solved')",
      [req.user.user_id]
    );
    const supportOpen = await db.get("SELECT COUNT(*) AS count FROM support_requests WHERE user_id = ? AND status != 'closed'", [
      req.user.user_id
    ]);
    return res.json({
      dashboard: {
        actor: "victim",
        total_reports: totalReports.count,
        active_reports: activeReports.count,
        open_support_requests: supportOpen.count
      }
    });
  }

  const totalIssues = await db.get("SELECT COUNT(*) AS count FROM arada_kefele_ketema_women_child_office_issues");
  const underReview = await db.get(
    "SELECT COUNT(*) AS count FROM arada_kefele_ketema_women_child_office_issues WHERE status IN ('under_review','ongoing')"
  );
  const openRequests = await db.get("SELECT COUNT(*) AS count FROM support_requests WHERE status != 'closed'");
  return res.json({
    dashboard: {
      actor: req.user.role,
      total_issues: totalIssues.count,
      pending_review: underReview.count,
      open_support_requests: openRequests.count
    }
  });
};
