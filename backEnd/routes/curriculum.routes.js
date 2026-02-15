import express from "express";
import {
  createSection,
  createLesson,
  getCurriculum,
} from "../controllers/curriculum.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// [GET] /api/curriculum/:courseId - Lấy cấu trúc khóa học (sections + lessons)
router.get("/:courseId", getCurriculum);

// [POST] /api/curriculum/:courseId/sections - Tạo chương (Yêu cầu đăng nhập)
router.post("/:courseId/sections", verifyToken, createSection);

// [POST] /api/curriculum/sections/:sectionId/lessons - Tạo bài học trong chương (Yêu cầu đăng nhập)
router.post("/sections/:sectionId/lessons", verifyToken, createLesson);

export default router;
