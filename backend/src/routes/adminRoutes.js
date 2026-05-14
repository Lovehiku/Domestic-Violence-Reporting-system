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
router.use(asyncHandler(authRequired), requireRole("admin"));
router.get("/users", asyncHandler(adminListUsers));
router.post("/users", asyncHandler(adminCreateUser));
router.put("/users/:userId", asyncHandler(adminUpdateUser));
router.delete("/users/:userId", asyncHandler(adminDeleteUser));
router.get("/reports", asyncHandler(adminListReports));
router.patch("/reports/:issueId", asyncHandler(adminUpdateReport));
router.delete("/reports/:issueId", asyncHandler(adminDeleteReport));

export default router;
