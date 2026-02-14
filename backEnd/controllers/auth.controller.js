// controllers/auth.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // Nhớ thêm đuôi .js

// [API] Đăng ký người dùng mới
export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email này đã được đăng ký!" });
    }

    // 2. Mã hóa mật khẩu (Salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Lưu user mới vào Database (Role mặc định là 'student' theo DB schema)
    const newUser = await pool.query(
      "INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, role",
      [full_name, email, password_hash],
    );

    // 4. Trả về kết quả
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

// [API] Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user bằng email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng!" });
    }

    const user = userResult.rows[0];

    // 2. So sánh mật khẩu nhập vào với password_hash trong DB
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng!" });
    }

    // 3. Tạo JWT Token với payload theo yêu cầu
    // Payload gồm userId, email, role theo TRD document
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Trả về token và thông tin user cơ bản
    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};
