import { getDb } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

export const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authentication required. Please log in." });
  }
  try {
    const payload = verifyToken(authHeader.slice(7));
    const db = getDb();
    const user = await db.get(
      "SELECT user_id, full_name, email, role, phone FROM users WHERE user_id = ?",
      [payload.sub],
    );

    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid session. Please log in again." });

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired or invalid." });
  }
};

export const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();
  try {
    const payload = verifyToken(authHeader.slice(7));
    const db = getDb();
    const user = await db.get(
      "SELECT user_id, full_name, email, role, phone FROM users WHERE user_id = ?",
      [payload.sub],
    );
    if (user) {
      req.user = user;
    }
  } catch {
    req.user = null;
  }
  next();
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions." });
    }
    return next();
  };
