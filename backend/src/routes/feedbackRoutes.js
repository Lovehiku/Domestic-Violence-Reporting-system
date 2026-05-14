import { Router } from "express";
import { createFeedback } from "../controllers/feedbackController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(authRequired), asyncHandler(createFeedback));

export default router;
