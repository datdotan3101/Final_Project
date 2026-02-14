import express from "express";
// Nhớ import thêm getCourseForLearning
import {
  createCourse,
  getCourses,
  getCourseDetails,
  getCourseForLearning,
  getMyCourses, // <-- Hàm mới
} from "../controllers/course.controller.js";
import { createLesson } from "../controllers/lesson.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// [GET] /api/courses - Lấy danh sách khóa học (Public)
router.get("/", getCourses);

// [GET] /api/courses/:courseId/learn - Lấy nội dung để học (Private - Phải đặt trên route /:id)
router.get("/:courseId/learn", verifyToken, getCourseForLearning);

// [GET] /api/courses/:id - Lấy chi tiết giới thiệu khóa học (Public)
router.get("/:id", getCourseDetails);

// [POST] /api/courses/create - Tạo khóa học mới (Private)
router.post("/create", verifyToken, createCourse);

// [POST] /api/courses/:courseId/lessons - Thêm bài giảng vào khóa học (Private)
router.post("/:courseId/lessons", verifyToken, createLesson);

// Thêm route mới
router.get('/instructor/my-courses', verifyToken, getMyCourses);

export default router;
