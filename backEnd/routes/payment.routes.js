// routes/payment.routes.js
import express from "express";
import { mockPayment } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Bắt buộc phải đăng nhập mới mua được

const router = express.Router();

// [POST] /api/payment/mock - Endpoint thanh toán giả lập
router.post("/mock", verifyToken, mockPayment);

export default router;
