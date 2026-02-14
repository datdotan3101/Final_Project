// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// Import các routes
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import chatRoutes from "./routes/chat.routes.js"; // <-- Thêm dòng này

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Đăng ký các endpoints
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRoutes); // <-- Thêm dòng này

app.get("/", (req, res) => {
  res.send("E-Learning Marketplace API is running...");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
