import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";

export const seedDatabase = async () => {
  const db = getDb();
  const existing = await db.get("SELECT COUNT(*) AS count FROM users");
  if (existing.count > 0) return;

  const now = new Date().toISOString();
  const victimId = "u-victim-1";
  const staffId = "u-staff-1";
  const adminId = "u-admin-1";

  await db.run(
    `INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [victimId, "Alex Johnson", "victim@safehaven.test", await bcrypt.hash("Victim@123", 10), "victim", "+251-900-000001", now, now]
  );
  await db.run(
    `INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [staffId, "Sarah Miller", "staff@safehaven.test", await bcrypt.hash("Staff@123", 10), "support_staff", "+251-900-000002", now, now]
  );
  await db.run(
    `INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [adminId, "Admin One", "admin@safehaven.test", await bcrypt.hash("Admin@123", 10), "admin", "+251-900-000003", now, now]
  );

  await db.run(
    `INSERT INTO support_system (org_id, user_id, organization, service, status, reported_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ["org-1", victimId, "Arada Women and Child Office", "Legal Referral", "ongoing", now, null]
  );

  await db.run(
    `INSERT INTO arada_kefele_ketema_women_child_office_issues
      (issue_id, user_id, issue_details, status, reported_at, resolved_at, incident_type, service_needed, location, is_anonymous, file_reference, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "issue-1001",
      victimId,
      "Repeated verbal threats and intimidation near home in the evening.",
      "in_progress",
      now,
      null,
      "Harassment",
      "Counseling",
      "Arada Sub-city",
      0,
      "simulated://files/report-1001-evidence.jpg",
      now
    ]
  );

  const resources = [
    ["res-1", "Emergency", "National Hotline", "+251-911", "Addis Ababa", "24/7 emergency domestic violence hotline", 1],
    ["res-2", "Legal Aid", "Women Justice Center", "+251-922-123456", "Arada", "Free legal orientation and referral services", 1],
    ["res-3", "Shelter", "Safe Haven Shelter", "+251-933-654321", "Piassa", "Temporary shelter and crisis accommodation", 1]
  ];
  for (const row of resources) {
    await db.run(
      `INSERT INTO resources (resource_id, category, name, phone, location, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      row
    );
  }

  await db.run(
    `INSERT INTO notifications (notification_id, user_id, title, message, type, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), victimId, "Case Update", "Your report issue-1001 is now in progress.", "info", now]
  );
};
