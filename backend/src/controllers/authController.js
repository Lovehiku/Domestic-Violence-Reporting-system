import { getDb } from "../config/db.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const register = async (req, res) => {
  try {
    const { full_name, name, email, password, role, phone } = req.body;
    const nameToUse = full_name || name;
    const db = getDb();

    const existing = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO users (user_id, full_name, email, password, role, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id,
        nameToUse,
        email,
        hashedPassword,
        role || "victim",
        phone || "",
        now,
        now,
      ],
    );

    const user = {
      user_id,
      full_name: nameToUse,
      email,
      role: role || "victim",
    };
    const token = signToken(user);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
