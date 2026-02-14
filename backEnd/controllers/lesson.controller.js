// controllers/lesson.controller.js
import pool from "../config/db.js";

// [API] Thêm bài giảng mới vào khóa học
export const createLesson = async (req, res) => {
  try {
    // 1. Lấy courseId từ URL parameter và userId từ token
    const { courseId } = req.params;
    const instructorId = req.user.userId;

    // 2. Lấy dữ liệu bài giảng từ body request
    const { title, video_url, duration, position, is_free } = req.body;

    // Validate cơ bản
    if (!title || !video_url || position === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng nhập đủ tên bài học, link video và vị trí (position)!",
      });
    }

    // 3. Bảo mật: Kiểm tra xem khóa học có tồn tại và user có phải là chủ sở hữu khóa học không
    const courseCheck = await pool.query(
      "SELECT id FROM courses WHERE id = $1 AND instructor_id = $2",
      [courseId, instructorId],
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền thêm bài giảng vào khóa học này, hoặc khóa học không tồn tại!",
      });
    }

    // 4. Insert bài giảng vào Database
    const newLesson = await pool.query(
      `INSERT INTO lessons (course_id, title, video_url, duration, position, is_free) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [courseId, title, video_url, duration || 0, position, is_free || false],
    );

    // 5. Trả về kết quả
    res.status(201).json({
      success: true,
      message: "Thêm bài giảng thành công!",
      lesson: newLesson.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi thêm bài giảng:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi thêm bài giảng!" });
  }
};
