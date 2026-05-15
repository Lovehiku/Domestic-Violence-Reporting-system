import { Router } from "express";
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(authRequired), asyncHandler(createAppointment));
router.get("/my", asyncHandler(authRequired), asyncHandler(getMyAppointments));
router.get("/all", asyncHandler(authRequired), requireRole("support_staff", "admin"), asyncHandler(getAllAppointments));
router.patch("/:id/status", asyncHandler(authRequired), requireRole("support_staff", "admin"), asyncHandler(updateAppointmentStatus));

export default router;
