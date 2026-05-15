import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (user) =>
  jwt.sign(
    { sub: user.user_id, role: user.role, email: user.email },
    env.jwtSecret,
    {
      expiresIn: "8h",
    },
  );

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
