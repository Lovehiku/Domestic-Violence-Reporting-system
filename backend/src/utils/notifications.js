import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";

export const createNotification = async ({ userId = null, title, message, type = "info" }) => {
  const db = getDb();
  await db.run(
    `INSERT INTO notifications (notification_id, user_id, title, message, type, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), userId, title, message, type, new Date().toISOString()]
  );
};

export const simulateExternalNotifications = ({ channel, to, message }) => {
  console.log(`[${channel.toUpperCase()} SIMULATION] to=${to} message="${message}"`);
};
