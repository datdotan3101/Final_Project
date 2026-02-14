// controllers/user.controller.js
import pool from "../config/db.js";

// [API] Cập nhật thông tin cá nhân
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { full_name } = req.body;

    // Nếu có file upload lên, tạo đường link trỏ vào file đó.
    // Nếu không, giữ nguyên avatar_url cũ mà frontend gửi lên (nếu có).
    let newAvatarUrl = req.body.avatar_url;

    if (req.file) {
      // Biến req.file do Multer tạo ra. Tạo link: http://localhost:5000/uploads/ten-file.jpg
      newAvatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    if (!full_name) {
      return res
        .status(400)
        .json({ success: false, message: "Họ tên không được để trống!" });
    }

    const updatedUser = await pool.query(
      `UPDATE users 
       SET full_name = $1, avatar_url = $2 
       WHERE id = $3 
       RETURNING id, full_name, email, role, avatar_url`,
      [full_name, newAvatarUrl || null, userId],
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật hồ sơ!" });
  }
};
