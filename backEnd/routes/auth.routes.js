// routes/auth.routes.js
import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

// Định nghĩa các endpoint
router.post("/register", register);
router.post("/login", login);

export default router;
