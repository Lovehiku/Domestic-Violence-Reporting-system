import { getDb } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createIncident = async (req, res) => {
  try {
    const {
      incident_type,
      issue_details,
      location,
      service_needed,
      urgency,
      is_anonymous,
    } = req.body;
    const db = getDb();
    const issue_id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO arada_kefele_ketema_women_child_office_issues 
      (issue_id, user_id, issue_details, status, reported_at, incident_type, service_needed, location, is_anonymous, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        issue_id,
        is_anonymous ? null : req.user.user_id,
        issue_details,
        "under_review",
        now,
        incident_type,
        service_needed,
        location,
        is_anonymous ? 1 : 0,
        now,
      ],
    );

    res
      .status(201)
      .json({ message: "Incident reported successfully", issue_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyIncidents = async (req, res) => {
  try {
    const db = getDb();
    const reports = await db.all(
      "SELECT * FROM arada_kefele_ketema_women_child_office_issues WHERE user_id = ? ORDER BY reported_at DESC",
      [req.user.user_id],
    );
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const db = getDb();
    const report = await db.get(
      "SELECT * FROM arada_kefele_ketema_women_child_office_issues WHERE issue_id = ?",
      [req.params.id],
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    const now = new Date().toISOString();

    const result = await db.run(
      "UPDATE arada_kefele_ketema_women_child_office_issues SET status = ?, updated_at = ? WHERE issue_id = ?",
      [status, now, req.params.id],
    );

    if (result.changes === 0)
      return res.status(404).json({ message: "Report not found" });

    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
