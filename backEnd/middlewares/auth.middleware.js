// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // 1. Lấy token từ header 'Authorization'
    const authHeader = req.headers.authorization;

    // Kiểm tra xem header có tồn tại và có bắt đầu bằng 'Bearer ' không
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Không tìm thấy token hoặc định dạng không hợp lệ. Vui lòng đăng nhập!",
      });
    }

    // 2. Tách chuỗi để lấy đúng phần token
    const token = authHeader.split(" ")[1];

    // 3. Xác thực token bằng secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Gắn thông tin payload (userId, email, role) vào req.user để các controller phía sau sử dụng
    req.user = decoded;

    // 5. Cho phép đi tiếp đến controller
    next();
  } catch (error) {
    console.error("Lỗi xác thực token:", error);

    // Phân loại lỗi token hết hạn hoặc token sai
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token đã hết hạn. Vui lòng đăng nhập lại!",
        });
    }
    return res
      .status(403)
      .json({ success: false, message: "Token không hợp lệ!" });
  }
};

// Middleware kiểm tra quyền Admin (nếu sau này bạn cần CMS)
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập tính năng này!' });
    }
  });
};