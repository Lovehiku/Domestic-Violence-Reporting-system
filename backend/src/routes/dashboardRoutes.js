import { Router } from "express";
import { getStats } from "../controllers/dashboardController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/stats", asyncHandler(authRequired), asyncHandler(getStats));

export default router;
