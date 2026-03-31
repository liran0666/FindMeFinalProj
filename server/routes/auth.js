import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDB from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "lir123";

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { username, email, password, userType, age, city } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "username, email and password are required." });
  }

  try {
    const db = getDB();

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Email or username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (userType, email, username, password, age, city)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userType || "user",
        email,
        username,
        hashedPassword,
        age || null,
        city || null,
      ],
    );

    const token = jwt.sign(
      { id: result.insertId, username, email, userType: userType || "user" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: result.insertId,
        username,
        email,
        userType: userType || "user",
        age,
        city,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const db = getDB();

    const [rows] = await db.query("SELECT * FROM users WHERE email = ? and password=?", [
      email,password
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        age: user.age,
        city: user.city,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── ME (verify token & restore session) ─────────────────────────────────────
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id, userType, email, username, age, city FROM users WHERE id = ?",
      [decoded.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });
    return res.json({ user: rows[0] });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

export default router;
