import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import getDB from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

async function startServer() {
  try {
    const db = getDB();
    await db.query("SELECT 1"); // lightweight ping
    console.log("✅ MySQL connected successfully");
    // Add customer_rating column if it doesn't exist yet
    try {
      await db.query("ALTER TABLE events ADD COLUMN customer_rating TINYINT NULL");
      console.log("✅ customer_rating column added");
    } catch (e) {
      if (e.errno !== 1060) throw e; // 1060 = column already exists, safe to ignore
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err.message);
    process.exit(1); // stop the server if DB is unreachable
  }
}

startServer();
