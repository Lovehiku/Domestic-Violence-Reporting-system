import { Router } from "express";
import { listNotifications, markNotificationRead } from "../controllers/notificationController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(authRequired), asyncHandler(listNotifications));
router.patch("/:notificationId/read", asyncHandler(authRequired), asyncHandler(markNotificationRead));

export default router;
