import { Router } from "express";
import {
  createIncident,
  getMyIncidents,
  getIncidentById,
  updateIncidentStatus
} from "../controllers/incidentController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(authRequired), asyncHandler(createIncident));
router.get("/", asyncHandler(authRequired), asyncHandler(getMyIncidents));
router.get("/:id", asyncHandler(authRequired), asyncHandler(getIncidentById));
router.patch("/:id/status", asyncHandler(authRequired), requireRole("support_staff", "admin"), asyncHandler(updateIncidentStatus));

export default router;
