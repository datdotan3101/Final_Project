import express from "express";
import multer from "multer";
import path from "path";
// Nhớ import thêm getCourseForLearning
import {
  createCourse,
  getCourses,
  getCourseDetails,
  getCourseForLearning,
  getMyCourses,
} from "../controllers/course.controller.js";
import { createLesson } from "../controllers/lesson.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Cấu hình Multer cho ảnh bìa khóa học
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(
      null,
      "course-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });

// [GET] /api/courses - Lấy danh sách khóa học (Public)
router.get("/", getCourses);

// [GET] /api/courses/:courseId/learn - Lấy nội dung để học (Private - Phải đặt trên route /:id)
router.get("/:courseId/learn", verifyToken, getCourseForLearning);

// [GET] /api/courses/:id - Lấy chi tiết giới thiệu khóa học (Public)
router.get("/:id", getCourseDetails);

// [POST] /api/courses/create - Tạo khóa học mới (Private)
router.post("/create", verifyToken, upload.single("thumbnail"), createCourse);

// [POST] /api/courses/:courseId/lessons - Thêm bài giảng vào khóa học (Private)
router.post("/:courseId/lessons", verifyToken, createLesson);

// Thêm route mới
router.get("/instructor/my-courses", verifyToken, getMyCourses);

export default router;
