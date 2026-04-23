import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import getDB from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "user";

// ─── MULTER SETUP ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post("/register", upload.single("profile_pic"), async (req, res) => {
  const { username, email, password, userType, dateOfBirth, city, service1, service2, service3 } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email and password are required." });
  }

  try {
    const db = getDB();

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? OR userName = ?",
      [email, username],
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email or username already taken." });
    }

    const rating = userType === "photographer" ? 0 : -1;
    // customers always get service 0 (no service)
    const s1 = userType === "photographer" ? (service1 || 0) : 0;
    const s2 = userType === "photographer" ? (service2 || 0) : 0;
    const s3 = userType === "photographer" ? (service3 || 0) : 0;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO users (userType, email, userName, password, dateOfBirth, city, rating, service1, service2, service3, profile_pic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userType || "user",
        email,
        username,
        password,
        dateOfBirth || null,
        city || null,
        rating,
        s1, s2, s3,
        profilePic,
      ],
    );

    const token = jwt.sign(
      { id: result.insertId, userName: username, email, userType: userType || "user" },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: { id: result.insertId, username, email, userType: userType || "user", dateOfBirth, city, profile_pic: profilePic },
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
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const db = getDB();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    const token = jwt.sign(
      { id: user.id, userName: user.userName, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.userName,
        email: user.email,
        userType: user.userType,
        dateOfBirth: user.dateOfBirth,
        city: user.city,
        service1: user.service1,
        service2: user.service2,
        service3: user.service3,
        profile_pic: user.profile_pic,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── ME ───────────────────────────────────────────────────────────────────────
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
      "SELECT id, userType, email, userName, dateOfBirth, city, service1, service2, service3, profile_pic FROM users WHERE id = ?",
      [decoded.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });
    const u = rows[0];
    return res.json({ user: { ...u, username: u.userName } });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ─── UPDATE PROFILE PIC ──────────────────────────────────────────────────────
router.put("/profile-pic", upload.single("profile_pic"), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }
  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image file provided." });
  }

  try {
    const db = getDB();

    // Delete old file if it exists
    const [rows] = await db.query("SELECT profile_pic FROM users WHERE id = ?", [decoded.id]);
    if (rows.length && rows[0].profile_pic) {
      const oldPath = path.join(uploadsDir, path.basename(rows[0].profile_pic));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const newPic = `/uploads/${req.file.filename}`;
    await db.query("UPDATE users SET profile_pic = ? WHERE id = ?", [newPic, decoded.id]);

    const [updated] = await db.query(
      "SELECT id, userType, email, userName, dateOfBirth, city, service1, service2, service3, profile_pic FROM users WHERE id = ?",
      [decoded.id],
    );
    const u = updated[0];
    return res.json({ message: "Profile picture updated.", user: { ...u, username: u.userName } });
  } catch (err) {
    console.error("Profile pic update error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  const { username, email, city, service1, service2, service3 } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: "Username and email are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const db = getDB();

    // Check uniqueness (exclude current user)
    const [existing] = await db.query(
      "SELECT id FROM users WHERE (email = ? OR userName = ?) AND id != ?",
      [email, username, decoded.id],
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email or username already taken." });
    }

    // Fetch current user to know their type
    const [userRows] = await db.query("SELECT userType FROM users WHERE id = ?", [decoded.id]);
    if (userRows.length === 0) return res.status(404).json({ message: "User not found." });
    const isPhotographer = userRows[0].userType === "photographer";

    if (isPhotographer) {
      const s1 = service1 || 0;
      const s2 = service2 || 0;
      const s3 = service3 || 0;
      await db.query(
        "UPDATE users SET userName = ?, email = ?, city = ?, service1 = ?, service2 = ?, service3 = ? WHERE id = ?",
        [username, email, city || null, s1, s2, s3, decoded.id],
      );
    } else {
      await db.query(
        "UPDATE users SET userName = ?, email = ?, city = ? WHERE id = ?",
        [username, email, city || null, decoded.id],
      );
    }

    const [updated] = await db.query(
      "SELECT id, userType, email, userName, dateOfBirth, city, service1, service2, service3 FROM users WHERE id = ?",
      [decoded.id],
    );
    const u = updated[0];
    return res.json({ message: "Profile updated.", user: { ...u, username: u.userName } });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── SERVICES ─────────────────────────────────────────────────────────────────
router.get("/services", async (_req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id, type FROM services WHERE id > 0 ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PHOTOGRAPHERS LIST ───────────────────────────────────────────────────────
router.get("/photographers", async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(`
      SELECT u.id, u.userName, u.city, u.rating, u.dateOfBirth, u.profile_pic,
             s1.type AS service1Name,
             s2.type AS service2Name,
             s3.type AS service3Name
      FROM users u
      LEFT JOIN services s1 ON s1.id = u.service1 AND u.service1 > 0
      LEFT JOIN services s2 ON s2.id = u.service2 AND u.service2 > 0
      LEFT JOIN services s3 ON s3.id = u.service3 AND u.service3 > 0
      WHERE u.userType = 'photographer'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PHOTOGRAPHER BY ID ───────────────────────────────────────────────────────
router.get("/photographers/:id", async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(`
      SELECT u.id, u.userName, u.city, u.rating, u.dateOfBirth, u.profile_pic,
             s1.type AS service1Name,
             s2.type AS service2Name,
             s3.type AS service3Name
      FROM users u
      LEFT JOIN services s1 ON s1.id = u.service1 AND u.service1 > 0
      LEFT JOIN services s2 ON s2.id = u.service2 AND u.service2 > 0
      LEFT JOIN services s3 ON s3.id = u.service3 AND u.service3 > 0
      WHERE u.id = ? AND u.userType = 'photographer'
    `, [req.params.id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Photographer not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
