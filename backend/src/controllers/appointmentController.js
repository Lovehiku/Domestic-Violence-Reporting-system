import { getDb } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "../utils/notifications.js";

export const createAppointment = async (req, res) => {
  try {
    const { service_type, appointment_date, notes } = req.body;
    const db = getDb();
    const appointment_id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO appointments (appointment_id, user_id, service_type, appointment_date, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        appointment_id,
        req.user.user_id,
        service_type,
        appointment_date,
        "pending",
        notes || "",
        now,
        now,
      ],
    );

    // Notify the user
    await createNotification({
      userId: req.user.user_id,
      title: "Appointment Requested",
      message: `Your ${service_type} appointment request for ${new Date(appointment_date).toLocaleString()} has been received.`,
      type: "info",
    });

    // Notify staff/admins (global notification)
    await createNotification({
      userId: null,
      title: "New Appointment Request",
      message: `A new ${service_type} appointment has been requested by ${req.user.full_name}.`,
      type: "alert",
    });

    res
      .status(201)
      .json({ message: "Appointment requested successfully", appointment_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const db = getDb();
    const appointments = await db.all(
      "SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date DESC",
      [req.user.user_id],
    );
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const db = getDb();
    const appointments = await db.all(
      `SELECT a.*, u.full_name, u.email 
       FROM appointments a 
       JOIN users u ON a.user_id = u.user_id 
       ORDER BY a.appointment_date DESC`,
    );
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    const now = new Date().toISOString();

    const result = await db.run(
      "UPDATE appointments SET status = ?, updated_at = ? WHERE appointment_id = ?",
      [status, now, req.params.id],
    );

    if (result.changes === 0)
      return res.status(404).json({ message: "Appointment not found." });
    res.json({ message: "Appointment status updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
