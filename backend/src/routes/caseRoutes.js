import { Router } from "express";
import { getCaseHistory } from "../controllers/caseController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/:userId", asyncHandler(authRequired), asyncHandler(getCaseHistory));

export default router;
