import express from "express";
// Đã thêm getCourseDetails vào import
import {
  createCourse,
  getCourses,
  getCourseDetails,
} from "../controllers/course.controller.js";
import { createLesson } from "../controllers/lesson.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// [GET] /api/courses - Lấy danh sách khóa học (Public, ai cũng xem được)
router.get("/", getCourses);

// [GET] /api/courses/:id - Lấy chi tiết khóa học (Đặt dưới getCourses)
router.get("/:id", getCourseDetails);

// [POST] /api/courses/create - Tạo khóa học mới (Cần đăng nhập)
router.post("/create", verifyToken, createCourse);

// [POST] /api/courses/:courseId/lessons - Thêm bài giảng
router.post("/:courseId/lessons", verifyToken, createLesson);

export default router;
