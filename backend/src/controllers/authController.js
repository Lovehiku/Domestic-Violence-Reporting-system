import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../config/db.js";
import { signToken } from "../utils/jwt.js";
import { isValidEmail, sanitizeBody } from "../utils/sanitize.js";
import { createNotification } from "../utils/notifications.js";

export const register = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  const fullNameInput = body.full_name || body.name;
  const { email, password } = body;
  const normalizedRole = body.role === "staff" ? "support_staff" : body.role;
  const role = ["victim", "support_staff", "admin"].includes(normalizedRole) ? normalizedRole : "victim";

  if (!fullNameInput || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (!isValidEmail(email)) return res.status(400).json({ message: "Please provide a valid email address." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });

  const existing = await db.get("SELECT user_id FROM users WHERE email = ?", [email.toLowerCase()]);
  if (existing) return res.status(409).json({ message: "Email already registered." });

  const user = {
    user_id: uuidv4(),
    full_name: fullNameInput,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    role,
    phone: body.phone || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await db.run(
    `INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.user_id, user.full_name, user.email, user.password, user.role, user.phone, user.created_at, user.updated_at]
  );
  await createNotification({
    userId: user.user_id,
    title: "Registration Successful",
    message: "Your SafeHaven account has been created securely.",
    type: "success"
  });

  const token = signToken(user);
  return res.status(201).json({
    message: "Account created successfully.",
    token,
    user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role, phone: user.phone }
  });
};

export const login = async (req, res) => {
  const db = getDb();
  const body = sanitizeBody(req.body);
  if (!body.email || !body.password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const user = await db.get("SELECT * FROM users WHERE email = ?", [body.email.toLowerCase()]);
  if (!user) return res.status(401).json({ message: "Invalid email or password." });

  const matches = await bcrypt.compare(body.password, user.password);
  if (!matches) return res.status(401).json({ message: "Invalid email or password." });

  const token = signToken(user);
  await createNotification({
    userId: user.user_id,
    title: "Login Successful",
    message: "You are securely signed in.",
    type: "info"
  });
  return res.json({
    message: "Login successful.",
    token,
    user: { user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role, phone: user.phone }
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
