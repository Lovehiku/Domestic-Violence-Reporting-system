import { getDb } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createNotification = async ({ userId = null, title, message, type = "info" }) => {
  try {
    const db = getDb();
    const notification_id = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      "INSERT INTO notifications (notification_id, user_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [notification_id, userId, title, message, type, 0, now]
    );
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

export const simulateExternalNotifications = ({ channel, to, message }) => {
  console.log(`[${channel.toUpperCase()} SIMULATION] to=${to} message="${message}"`);
};
