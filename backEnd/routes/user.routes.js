// routes/user.routes.js
import express from "express";
import { updateProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// 1. Nơi lưu trữ và đặt tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu vào thư mục uploads/
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

// 2. Bộ lọc định dạng file (Chỉ cho phép JPG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_TYPE"), false);
  }
};

// 3. Khởi tạo Multer với Giới hạn (Ví dụ: 2MB = 2 * 1024 * 1024 bytes)
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Tối đa 2MB
  fileFilter: fileFilter,
});

// 4. Middleware bắt lỗi từ Multer (để trả về JSON đẹp thay vì crash Server)
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("avatar");

  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Bắt lỗi vượt quá dung lượng
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({
            success: false,
            message: "Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.",
          });
      }
      return res
        .status(400)
        .json({ success: false, message: `Lỗi upload: ${err.message}` });
    } else if (err) {
      // Bắt lỗi sai định dạng
      if (err.message === "INVALID_FILE_TYPE") {
        return res
          .status(400)
          .json({
            success: false,
            message: "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!",
          });
      }
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server khi xử lý file!" });
    }
    // Mọi thứ hoàn hảo, đi tiếp tới Controller
    next();
  });
};

// [PUT] /api/users/profile - Gọi middleware kiểm tra trước khi gọi updateProfile
router.put("/profile", verifyToken, uploadMiddleware, updateProfile);

export default router;
