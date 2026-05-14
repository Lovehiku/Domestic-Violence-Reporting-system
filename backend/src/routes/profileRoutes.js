import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(authRequired), asyncHandler(getProfile));
router.put("/", asyncHandler(authRequired), asyncHandler(updateProfile));

export default router;
