import express from "express";
import jwt from "jsonwebtoken";
import getDB from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "lir123";

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

// GET /api/events/photographer — all events for the logged-in photographer
router.get("/photographer", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query(
      `SELECT id, name, date, place, status
       FROM events
       WHERE photographer_id = ?
       ORDER BY date ASC`,
      [req.user.id]
    );
    return res.json({ events: rows });
  } catch (err) {
    console.error("Events fetch error:", err);
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
      "INSERT INTO events (photographer_id, name, date, place, status) VALUES (?, ?, ?, ?, 'pending')",
      [photographerId, name, date, place]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Event create error:", err);
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
      [status, req.params.id, req.user.id]
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

export default router;
