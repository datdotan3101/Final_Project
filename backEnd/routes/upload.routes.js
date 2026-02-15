import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Cấu hình lưu trữ Video
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Vẫn dùng chung thư mục uploads
  },
  filename: (req, file, cb) => {
    cb(null, "video-" + Date.now() + path.extname(file.originalname));
  },
});

// Cấu hình bộ lọc chỉ nhận Video
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 100MB/video
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_VIDEO_TYPE"), false);
    }
  },
});

// [POST] /api/upload/video
router.post("/video", verifyToken, upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Chưa có file nào được tải lên." });
    }

    // Tạo link video trả về cho Frontend
    const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, url: videoUrl });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi upload video!" });
  }
});

export default router;
