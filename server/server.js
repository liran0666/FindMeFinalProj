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

dotenv.config({ path: path.join(__dirname, ".env") });

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


app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || err.statusCode || 500).json({ message: err.message || "Server error." });
});

async function startServer() {
  try {
    const db = getDB();
    await db.query("SELECT 1"); // lightweight ping
    console.log("✅ MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err.message);
    process.exit(1); // stop the server if DB is unreachable
  }
}

startServer();
