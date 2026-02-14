import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Khởi tạo connection pool tới PostgreSQL dựa trên biến môi trường
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test kết nối khi khởi động
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database successfully!");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
