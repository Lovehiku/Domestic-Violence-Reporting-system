import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(authRequired), asyncHandler(getDashboard));
router.get("/stats", asyncHandler(authRequired), asyncHandler(getDashboard));

export default router;
