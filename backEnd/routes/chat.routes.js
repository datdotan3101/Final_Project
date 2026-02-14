// routes/chat.routes.js
import express from "express";
import { getCourseRecommendation } from "../controllers/chat.controller.js";

const router = express.Router();

// [POST] /api/chat/ask - Gửi câu hỏi cho AI
router.post("/ask", getCourseRecommendation);

export default router;
