import { Router } from "express";
import { listResources } from "../controllers/resourceController.js";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(authRequired), asyncHandler(listResources));

export default router;
