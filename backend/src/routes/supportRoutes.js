import { Router } from "express";
import { 
  createSupportRequest, 
  getMySupportRequests, 
  getAllSupportRequests 
} from "../controllers/supportController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(authRequired), asyncHandler(createSupportRequest));
router.get("/my", asyncHandler(authRequired), asyncHandler(getMySupportRequests));
router.get("/all", asyncHandler(authRequired), requireRole("support_staff", "admin"), asyncHandler(getAllSupportRequests));

export default router;
