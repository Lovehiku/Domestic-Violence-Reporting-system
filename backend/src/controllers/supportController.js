import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";
import { sanitizeBody } from "../utils/sanitize.js";
import { createNotification } from "../utils/notifications.js";

export const requestSupport = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  if (!body.support_type || !body.message) {
    return res.status(400).json({ message: "Support type and message are required." });
  }

  if (!body.issue_id) {
    return res.status(400).json({ message: "Active report (issue_id) is required for support request." });
  }
  const issue = await db.get("SELECT issue_id, user_id FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?", [
    body.issue_id
  ]);
  if (!issue) return res.status(404).json({ message: "Referenced report not found." });
  if (req.user.role === "victim" && issue.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "You can only request support for your own report." });
  }

  const now = new Date().toISOString();
  const request = {
    request_id: uuidv4(),
    user_id: req.user.user_id,
    issue_id: body.issue_id,
    support_type: body.support_type,
    message: body.message,
    status: "open",
    created_at: now,
    updated_at: now
  };
  await db.run(
    `INSERT INTO support_requests
    (request_id, user_id, issue_id, support_type, message, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.request_id,
      request.user_id,
      request.issue_id,
      request.support_type,
      request.message,
      request.status,
      request.created_at,
      request.updated_at
    ]
  );
  await createNotification({
    userId: req.user.user_id,
    title: "Support Request Submitted",
    message: `Support request ${request.request_id} has been sent.`,
    type: "success"
  });
  res.status(201).json({ message: "Support request submitted.", request });
};

export const provideSupport = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  const request = await db.get("SELECT * FROM support_requests WHERE request_id = ?", [req.params.requestId]);
  if (!request) return res.status(404).json({ message: "Support request not found." });

  const status = body.status || request.status;
  if (!["open", "in_progress", "closed"].includes(status)) {
    return res.status(400).json({ message: "Invalid support status." });
  }
  const updatedAt = new Date().toISOString();
  await db.run("UPDATE support_requests SET status = ?, updated_at = ? WHERE request_id = ?", [
    status,
    updatedAt,
    req.params.requestId
  ]);
  await createNotification({
    userId: request.user_id,
    title: "Support Request Updated",
    message: `Support request ${request.request_id} is now ${status}.`,
    type: "info"
  });
  res.json({ message: "Support request updated successfully." });
};

export const listSupportRequests = async (req, res) => {
  const db = getDb();
  if (req.user.role === "victim") {
    const rows = await db.all("SELECT * FROM support_requests WHERE user_id = ? ORDER BY created_at DESC", [req.user.user_id]);
    return res.json({ support_requests: rows });
  }
  const rows = await db.all("SELECT * FROM support_requests ORDER BY created_at DESC");
  return res.json({ support_requests: rows });
};
