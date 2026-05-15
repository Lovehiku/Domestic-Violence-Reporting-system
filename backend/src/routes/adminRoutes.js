import { Router } from "express";
import {
  adminCreateUser,
  adminDeleteUser,
  adminDeleteReport,
  adminListReports,
  adminListUsers,
  adminUpdateReport,
  adminUpdateUser
} from "../controllers/adminController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(authRequired));

// User Management (Admin Only)
router.get("/users", requireRole("admin"), asyncHandler(adminListUsers));
router.post("/users", requireRole("admin"), asyncHandler(adminCreateUser));
router.put("/users/:userId", requireRole("admin"), asyncHandler(adminUpdateUser));
router.delete("/users/:userId", requireRole("admin"), asyncHandler(adminDeleteUser));

// Report Management (Admin and Support Staff)
router.get("/reports", requireRole("admin", "support_staff"), asyncHandler(adminListReports));
router.patch("/reports/:issueId/status", requireRole("admin", "support_staff"), asyncHandler(adminUpdateReport));
router.delete("/reports/:issueId", requireRole("admin"), asyncHandler(adminDeleteReport));

export default router;
