import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Singleton pattern — one pool for the entire app lifetime
let instance = null;

function getDB() {
  if (!instance) {
    instance = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "findme",
      waitForConnections: true,
      connectionLimit: 10,
    });
    console.log("DB pool created");
  }
  return instance;
}

export default getDB;
