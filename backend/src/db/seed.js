import { getDb } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const seedDatabase = async () => {
  const db = getDb();
  try {
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    if (userCount.count > 0) return;

    const now = new Date().toISOString();
    const victimId = uuidv4();
    const staffId = uuidv4();
    const adminId = uuidv4();

    const victimPass = await bcrypt.hash("Victim@123", 10);
    const staffPass = await bcrypt.hash("Staff@123", 10);
    const adminPass = await bcrypt.hash("Admin@123", 10);

    // Seed Users
    await db.run(
      "INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        victimId,
        "Alex Johnson",
        "victim@safehaven.test",
        victimPass,
        "victim",
        "+251-900-000001",
        now,
        now,
      ],
    );

    await db.run(
      "INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        staffId,
        "Sarah Miller",
        "staff@safehaven.test",
        staffPass,
        "support_staff",
        "+251-900-000002",
        now,
        now,
      ],
    );

    await db.run(
      "INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        adminId,
        "Admin One",
        "admin@safehaven.test",
        adminPass,
        "admin",
        "+251-900-000003",
        now,
        now,
      ],
    );

    // Seed Incidents
    await db.run(
      `INSERT INTO arada_kefele_ketema_women_child_office_issues 
      (issue_id, user_id, issue_details, status, reported_at, incident_type, service_needed, location, is_anonymous, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        victimId,
        "Repeated verbal threats and intimidation near home in the evening.",
        "in_progress",
        now,
        "Harassment",
        "Counseling",
        "Arada Sub-city",
        0,
        now,
      ],
    );

    // Seed Resources
    await db.run(
      "INSERT INTO resources (resource_id, name, category, phone, location, description, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        "National Hotline",
        "Emergency",
        "+251-911",
        "Addis Ababa",
        "24/7 emergency domestic violence hotline",
        1,
        now,
      ],
    );
    await db.run(
      "INSERT INTO resources (resource_id, name, category, phone, location, description, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        "Women Justice Center",
        "Legal Aid",
        "+251-922-123456",
        "Arada",
        "Free legal orientation and referral services",
        1,
        now,
      ],
    );
    await db.run(
      "INSERT INTO resources (resource_id, name, category, phone, location, description, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        "Safe Haven Shelter",
        "Shelters",
        "+251-933-654321",
        "Piassa",
        "Temporary shelter and crisis accommodation",
        1,
        now,
      ],
    );

    // Seed Notifications
    await db.run(
      "INSERT INTO notifications (notification_id, user_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        victimId,
        "Case Update",
        "Your report is now in progress.",
        "info",
        0,
        now,
      ],
    );

    console.log("Database seeded successfully with SQLite");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};
