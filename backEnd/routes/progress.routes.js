// routes/progress.routes.js
import express from "express";
import { markCompleted } from "../controllers/progress.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Phải đăng nhập mới lưu được tiến độ

const router = express.Router();

// [POST] /api/progress/mark-completed
router.post("/mark-completed", verifyToken, markCompleted);

export default router;
