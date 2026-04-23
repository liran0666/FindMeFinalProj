import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import getDB from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── MULTER FOR EVENT PHOTOS ──────────────────────────────────────────────────
const eventPhotoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(__dirname, "../uploads/events", String(req.params.id));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
  },
});

const eventUpload = multer({
  storage: eventPhotoStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per photo
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "user";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    req.user = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// GET /api/events/stats?year=2026 — stats for the logged-in photographer
router.get("/stats", verifyToken, async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  try {
    const db = getDB();

    // Monthly active events for the requested year
    const [monthly] = await db.query(
      `SELECT MONTH(date) AS month, COUNT(*) AS events
       FROM events
       WHERE photographer_id = ? AND YEAR(date) = ? AND status = 'active'
       GROUP BY MONTH(date)`,
      [req.user.id, year],
    );

    // Event type breakdown for the requested year
    const [types] = await db.query(
      `SELECT name, COUNT(*) AS count
       FROM events
       WHERE photographer_id = ? AND YEAR(date) = ? AND status = 'active'
       GROUP BY name
       ORDER BY count DESC`,
      [req.user.id, year],
    );

    // Status totals (all years)
    const [statusTotals] = await db.query(
      `SELECT status, COUNT(*) AS count
       FROM events
       WHERE photographer_id = ?
       GROUP BY status`,
      [req.user.id],
    );

    // Photographer rating
    const [userRows] = await db.query("SELECT rating FROM users WHERE id = ?", [
      req.user.id,
    ]);

    return res.json({
      monthly,
      types,
      statusTotals,
      rating: userRows[0]?.rating ?? 0,
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/events/receipts — active/done events with customer details (photographer only)
router.get("/receipts", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT e.id, e.name, e.date, e.place, e.status,
              c.userName AS customerName, c.email AS customerEmail
       FROM events e
       JOIN users c ON c.id = e.customer_id
       WHERE e.photographer_id = ? AND e.status = 'active'
       ORDER BY e.date DESC`,
      [req.user.id],
    );
    return res.json({ events: rows });
  } catch (err) {
    console.error("Receipts fetch error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/events/photographer — all events for the logged-in photographer
router.get("/photographer", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT id, name, date, place, status
       FROM events
       WHERE photographer_id = ?
       ORDER BY date ASC`,
      [req.user.id],
    );
    return res.json({ events: rows });
  } catch (err) {
    console.error("Events fetch error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/events/customer — all events for the logged-in customer
router.get("/customer", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT e.id, e.name, e.date, e.place, e.status, e.customer_rating,
              u.userName AS photographerName, u.id AS photographerId
       FROM events e
       JOIN users u ON u.id = e.photographer_id
       WHERE e.customer_id = ?
       ORDER BY e.date DESC`,
      [req.user.id],
    );
    return res.json({ events: rows });
  } catch (err) {
    console.error("Customer events fetch error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/events — customer proposes a new event
router.post("/", verifyToken, async (req, res) => {
  const { photographerId, name, date, place } = req.body;
  if (!photographerId || !name || !date || !place) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  try {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO events (photographer_id, customer_id, name, date, place, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      [photographerId, req.user.id, name, date, place],
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Event create error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// POST /api/events/:id/rate — customer rates a completed event
router.post("/:id/rate", verifyToken, async (req, res) => {
  const rating = parseInt(req.body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be 1–5." });
  }
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT * FROM events WHERE id = ? AND customer_id = ? AND status = 'active'",
      [req.params.id, req.user.id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "Event not found." });
    const ev = rows[0];
    if (new Date(ev.date) >= new Date()) {
      return res.status(400).json({ message: "Cannot rate a future event." });
    }
    if (ev.customer_rating !== null) {
      return res.status(409).json({ message: "Already rated." });
    }
    await db.query("UPDATE events SET customer_rating = ? WHERE id = ?", [
      rating,
      ev.id,
    ]);
    // Recalculate photographer's average rating
    const [avg] = await db.query(
      "SELECT AVG(customer_rating) AS avg FROM events WHERE photographer_id = ? AND customer_rating IS NOT NULL",
      [ev.photographer_id],
    );
    const newRating = Math.round((avg[0].avg ?? 0) * 10) / 10;
    await db.query("UPDATE users SET rating = ? WHERE id = ?", [
      newRating,
      ev.photographer_id,
    ]);
    return res.json({ success: true, newRating });
  } catch (err) {
    console.error("Rate event error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// PATCH /api/events/:id/status — photographer accepts (active) or declines (declined)
router.patch("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  if (!["active", "declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE events SET status = ? WHERE id = ? AND photographer_id = ?",
      [status, req.params.id, req.user.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Event status update error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── GET PHOTOS FOR AN EVENT ──────────────────────────────────────────────────
router.get("/:id/photos", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id FROM events WHERE id = ? AND (photographer_id = ? OR customer_id = ?)",
      [req.params.id, req.user.id, req.user.id],
    );
    if (!rows.length) return res.status(403).json({ message: "Not authorized." });

    const dir = path.join(__dirname, "../uploads/events", String(req.params.id));
    if (!fs.existsSync(dir)) return res.json({ photos: [] });

    const photos = fs.readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|gif|webp|heic)$/i.test(f))
      .sort()
      .map((f) => ({ filename: f, url: `/uploads/events/${req.params.id}/${f}` }));

    return res.json({ photos });
  } catch (err) {
    console.error("Get photos error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── UPLOAD PHOTOS TO AN EVENT (photographer only) ────────────────────────────
router.post("/:id/photos", verifyToken, eventUpload.array("photos", 50), async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id FROM events WHERE id = ? AND photographer_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows.length) return res.status(403).json({ message: "Not authorized." });

    const uploaded = (req.files || []).map((f) => ({
      filename: f.filename,
      url: `/uploads/events/${req.params.id}/${f.filename}`,
    }));
    return res.json({ photos: uploaded });
  } catch (err) {
    console.error("Upload photos error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ─── DELETE A PHOTO FROM AN EVENT (photographer only) ─────────────────────────
router.delete("/:id/photos/:filename", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id FROM events WHERE id = ? AND photographer_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows.length) return res.status(403).json({ message: "Not authorized." });

    // Prevent path traversal
    const safeDir  = path.resolve(__dirname, "../uploads/events", String(req.params.id));
    const filePath = path.resolve(safeDir, req.params.filename);
    if (!filePath.startsWith(safeDir)) {
      return res.status(400).json({ message: "Invalid filename." });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete photo error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
