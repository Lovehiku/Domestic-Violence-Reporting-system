import { Router } from "express";
import { listSupportRequests, provideSupport, requestSupport } from "../controllers/supportController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(authRequired), asyncHandler(listSupportRequests));
router.post("/", asyncHandler(authRequired), asyncHandler(requestSupport));
router.patch("/:requestId", asyncHandler(authRequired), requireRole("support_staff", "admin"), asyncHandler(provideSupport));

export default router;
