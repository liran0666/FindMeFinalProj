import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import getDB from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── MULTER FOR SELFIE (temp, deleted after comparison) ──────────────────────
const selfieUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, "../uploads/selfies");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `selfie-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

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
      `SELECT e.id, e.name, e.date, e.place, e.status, e.notes,
              c.userName AS customerName
       FROM events e
       JOIN users c ON c.id = e.customer_id
       WHERE e.photographer_id = ?
       ORDER BY e.date ASC`,
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
      `SELECT e.id, e.name, e.date, e.place, e.status, e.customer_rating, e.notes,
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
  const { photographerId, name, date, place, notes } = req.body;
  if (!photographerId || !name || !date || !place) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  try {
    const db = getDB();
    const [result] = await db.query(
      "INSERT INTO events (photographer_id, customer_id, name, date, place, status, notes) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      [photographerId, req.user.id, name, date, place, notes || null],
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

// PATCH /api/events/:id/details — photographer edits event details
router.patch("/:id/details", verifyToken, async (req, res) => {
  const { name, date, place, notes } = req.body;
  if (!name || !date || !place) {
    return res.status(400).json({ message: "name, date and place are required." });
  }
  try {
    const db = getDB();
    const [result] = await db.query(
      "UPDATE events SET name = ?, date = ?, place = ?, notes = ? WHERE id = ? AND photographer_id = ?",
      [name, date, place, notes || null, req.params.id, req.user.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Event details update error:", err);
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

// ─── FACE FILTER: find event photos matching a selfie ─────────────────────────
router.post("/:id/face-filter", verifyToken, selfieUpload.single("selfie"), async (req, res) => {
  let selfiePath = null;
  try {
    const db = getDB();
    const [rows] = await db.query(
      "SELECT id FROM events WHERE id = ? AND (photographer_id = ? OR customer_id = ?)",
      [req.params.id, req.user.id, req.user.id],
    );
    if (!rows.length) return res.status(403).json({ message: "Not authorized." });
    if (!req.file)    return res.status(400).json({ message: "No selfie uploaded." });

    const FACEPP_API_KEY    = process.env.FACEPP_API_KEY;
    const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET;
    if (!FACEPP_API_KEY || !FACEPP_API_SECRET) {
      return res.status(500).json({ message: "Face++ API credentials not configured on server." });
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    
    const faceppPost = async (endpoint, params) => {
      await sleep(1100);
      const body = new URLSearchParams({ api_key: FACEPP_API_KEY, api_secret: FACEPP_API_SECRET, ...params });
      const r = await fetch(`https://api-us.faceplusplus.com/facepp/v3/${endpoint}`, { method: "POST", body });
      if (!r.ok) {
        const text = await r.text();
        console.error(`[Face++] ${endpoint} HTTP ${r.status}:`, text.slice(0, 300));
        throw new Error(`Face++ HTTP ${r.status}`);
      }
      const json = await r.json();
      if (json.error_message) console.warn(`[Face++] ${endpoint} error:`, json.error_message);
      return json;
    };

    // ── Step 1: detect the face in the selfie ─────────────────
    selfiePath = req.file.path;
    const selfieBase64 = fs.readFileSync(selfiePath).toString("base64");
    console.log("[Face++] Detecting selfie face...");
    const selfieDetect = await faceppPost("detect", { image_base64: selfieBase64 });
    console.log("[Face++] Selfie detect response:", JSON.stringify(selfieDetect).slice(0, 300));

    if (selfieDetect.error_message) {
      return res.status(400).json({ message: `Face++ error: ${selfieDetect.error_message}` });
    }
    if (!selfieDetect.faces || selfieDetect.faces.length === 0) {
      return res.status(400).json({ message: "לא זוהה פנים בסלפי. נסה תמונה ברורה יותר." });
    }

    // Pick the largest face in the selfie (most prominent)
    const selfieFaceToken = selfieDetect.faces.sort(
      (a, b) => (b.face_rectangle.width * b.face_rectangle.height) - (a.face_rectangle.width * a.face_rectangle.height),
    )[0].face_token;
    console.log("[Face++] Selfie face token:", selfieFaceToken);

    // ── Step 2: scan every gallery photo ──────────────────────
    const photoDir = path.join(__dirname, "../uploads/events", String(req.params.id));
    if (!fs.existsSync(photoDir)) return res.json({ photos: [], total: 0 });

    // Face++ does not support webp/heic — skip those formats
    const photoFiles = fs.readdirSync(photoDir)
      .filter((f) => /\.(jpe?g|png|gif|bmp)$/i.test(f))
      .sort();

    console.log(`[Face++] Scanning ${photoFiles.length} photos...`);
    const matched = [];
    for (const filename of photoFiles) {
      try {
        const photoBase64 = fs.readFileSync(path.join(photoDir, filename)).toString("base64");

        // Detect ALL faces in this gallery photo
        const photoDetect = await faceppPost("detect", { image_base64: photoBase64 });
        const faceCount = photoDetect.faces?.length ?? 0;
        console.log(`[Face++] ${filename}: ${faceCount} face(s) detected`);
        if (faceCount === 0) continue;

        // Compare the selfie face against every detected face in the photo
        let bestConfidence = 0;
        for (const face of photoDetect.faces) {
          const cmp = await faceppPost("compare", {
            face_token1: selfieFaceToken,
            face_token2: face.face_token,
          });
          console.log(`[Face++]   compare → confidence: ${cmp.confidence ?? "err"} error: ${cmp.error_message ?? "none"}`);
          if (!cmp.error_message && typeof cmp.confidence === "number") {
            if (cmp.confidence > bestConfidence) bestConfidence = cmp.confidence;
          }
          if (bestConfidence >= 80) break;
        }

        console.log(`[Face++] ${filename}: bestConfidence=${bestConfidence}`);
        if (bestConfidence >= 80) {
          matched.push({
            filename,
            url: `/uploads/events/${req.params.id}/${filename}`,
            confidence: Math.round(bestConfidence * 10) / 10,
          });
        }
      } catch (err) {
        console.error(`[Face++] Error scanning ${filename}:`, err.message);
      }
    }

    console.log(`[Face++] Done. Matched ${matched.length}/${photoFiles.length}`);
    return res.json({ photos: matched, total: photoFiles.length });
  } catch (err) {
    console.error("Face filter error:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    if (selfiePath && fs.existsSync(selfiePath)) fs.unlinkSync(selfiePath);
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
