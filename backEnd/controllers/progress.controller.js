// controllers/progress.controller.js
import pool from "../config/db.js";

// [API] Đánh dấu hoàn thành / Bỏ hoàn thành bài học
export const markCompleted = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lessonId, is_completed } = req.body;

    // 1. Validate dữ liệu đầu vào
    if (!lessonId) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng cung cấp lessonId!" });
    }

    // Mặc định nếu không truyền is_completed thì hiểu là muốn check (true)
    const status = is_completed !== undefined ? is_completed : true;

    // 2. Tìm course_id của bài học này (Vì bảng progress cần lưu course_id để tính % nhanh)
    const lessonCheck = await pool.query(
      "SELECT course_id FROM lessons WHERE id = $1",
      [lessonId],
    );

    if (lessonCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài học này!" });
    }

    const courseId = lessonCheck.rows[0].course_id;

    // 3. Xử lý Upsert vào Database
    // Sử dụng ON CONFLICT dựa trên UNIQUE(user_id, lesson_id) đã tạo trong DB
    const progressQuery = `
      INSERT INTO progress (user_id, course_id, lesson_id, is_completed) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        is_completed = EXCLUDED.is_completed, 
        completed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await pool.query(progressQuery, [
      userId,
      courseId,
      lessonId,
      status,
    ]);

    // 4. Trả về kết quả
    res.status(200).json({
      success: true,
      message: status
        ? "Đã đánh dấu hoàn thành bài học!"
        : "Đã bỏ đánh dấu hoàn thành.",
      progress: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tiến độ:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật tiến độ!" });
  }
};
