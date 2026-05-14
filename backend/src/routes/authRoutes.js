import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/signup", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.get("/me", asyncHandler(authRequired), asyncHandler(me));

export default router;
