import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";
import { sanitizeBody } from "../utils/sanitize.js";
import { createNotification, simulateExternalNotifications } from "../utils/notifications.js";

const ALLOWED_STATUSES = ["under_review", "in_progress", "resolved", "ongoing", "solved"];

export const reportIncident = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  const isAnonymous = body.is_anonymous === true || body.is_anonymous === "true";
  const userId = isAnonymous ? null : req.user?.user_id || null;

  if (!isAnonymous && !req.user) {
    return res.status(401).json({ message: "Please log in or choose anonymous reporting." });
  }
  if (!body.issue_details || !body.incident_type) {
    return res.status(400).json({ message: "Incident type and issue details are required." });
  }

  const issue = {
    issue_id: uuidv4(),
    user_id: userId,
    issue_details: body.issue_details,
    status: "under_review",
    reported_at: new Date().toISOString(),
    resolved_at: null,
    incident_type: body.incident_type,
    service_needed: body.service_needed || "",
    location: body.location || "",
    is_anonymous: isAnonymous ? 1 : 0,
    file_reference: req.file ? `simulated://uploads/${req.file.originalname}` : body.file_reference || null,
    updated_at: new Date().toISOString()
  };

  await db.run(
    `INSERT INTO arada_kefele_ketema_women_child_office_issues
    (issue_id, user_id, issue_details, status, reported_at, resolved_at, incident_type, service_needed, location, is_anonymous, file_reference, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      issue.issue_id,
      issue.user_id,
      issue.issue_details,
      issue.status,
      issue.reported_at,
      issue.resolved_at,
      issue.incident_type,
      issue.service_needed,
      issue.location,
      issue.is_anonymous,
      issue.file_reference,
      issue.updated_at
    ]
  );
  await db.run(
    `INSERT INTO support_system (org_id, user_id, organization, service, status, reported_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), userId, "Arada Women and Child Office", issue.service_needed || "General Support", "pending", issue.reported_at, null]
  );

  if (userId) {
    await createNotification({
      userId,
      title: "Incident Submitted",
      message: `Your report (${issue.issue_id}) was submitted successfully.`,
      type: "success"
    });
  }
  simulateExternalNotifications({
    channel: "sms",
    to: req.user?.phone || "anonymous-user",
    message: `SafeHaven report received: ${issue.issue_id}`
  });

  return res.status(201).json({
    message: "Incident report submitted successfully.",
    report: issue
  });
};

export const listIncidents = async (req, res) => {
  const db = getDb();
  if (req.user.role === "victim") {
    const rows = await db.all(
      `SELECT * FROM arada_kefele_ketema_women_child_office_issues
       WHERE user_id = ? ORDER BY reported_at DESC`,
      [req.user.user_id]
    );
    return res.json({ reports: rows });
  }
  const rows = await db.all("SELECT * FROM arada_kefele_ketema_women_child_office_issues ORDER BY reported_at DESC");
  return res.json({ reports: rows });
};

export const trackIncidentStatus = async (req, res) => {
  const db = getDb();
  const issue = await db.get("SELECT * FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?", [req.params.issueId]);
  if (!issue) return res.status(404).json({ message: "Report not found." });
  if (req.user.role === "victim" && issue.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "You can only track your own reports." });
  }
  return res.json({
    issue_id: issue.issue_id,
    status: issue.status,
    reported_at: issue.reported_at,
    updated_at: issue.updated_at,
    resolved_at: issue.resolved_at
  });
};

export const updateIncidentStatus = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  if (!ALLOWED_STATUSES.includes(body.status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const issue = await db.get("SELECT * FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?", [req.params.issueId]);
  if (!issue) return res.status(404).json({ message: "Report not found." });

  const resolvedAt = body.status === "resolved" || body.status === "solved" ? new Date().toISOString() : null;
  const updatedAt = new Date().toISOString();
  await db.run(
    `UPDATE arada_kefele_ketema_women_child_office_issues
     SET status = ?, resolved_at = COALESCE(?, resolved_at), updated_at = ?
     WHERE issue_id = ?`,
    [body.status, resolvedAt, updatedAt, req.params.issueId]
  );
  if (issue.user_id) {
    await createNotification({
      userId: issue.user_id,
      title: "Report Status Updated",
      message: `Report ${issue.issue_id} is now ${body.status}.`,
      type: "info"
    });
  }
  return res.json({ message: "Status updated successfully." });
};
