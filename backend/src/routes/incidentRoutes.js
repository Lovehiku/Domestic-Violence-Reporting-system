import { Router } from "express";
import multer from "multer";
import {
  listIncidents,
  reportIncident,
  trackIncidentStatus,
  updateIncidentStatus
} from "../controllers/incidentController.js";
import { authRequired, optionalAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", asyncHandler(optionalAuth), upload.single("file"), asyncHandler(reportIncident));
router.get("/", asyncHandler(authRequired), asyncHandler(listIncidents));
router.get("/:issueId/status", asyncHandler(authRequired), asyncHandler(trackIncidentStatus));
router.patch("/:issueId/status", asyncHandler(authRequired), requireRole("support_staff", "admin"), asyncHandler(updateIncidentStatus));

export default router;
