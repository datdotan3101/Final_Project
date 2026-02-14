// controllers/payment.controller.js
import pool from "../config/db.js";

// [API] Giả lập thanh toán và ghi danh khóa học
export const mockPayment = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ token đăng nhập
    const { courseId } = req.body;

    // 1. Kiểm tra khóa học có tồn tại không
    const courseCheck = await pool.query(
      "SELECT id, price FROM courses WHERE id = $1",
      [courseId],
    );
    if (courseCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Khóa học không tồn tại!" });
    }

    // 2. Kiểm tra xem User này đã mua khóa học này chưa
    const enrollCheck = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, courseId],
    );

    if (enrollCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã mua khóa học này rồi!" });
    }

    // 3. Xử lý "Thanh toán ảo"
    // Tạo một mã giao dịch giả lập
    const mockTransactionId = "MOCK_TXN_" + Date.now();

    // 4. Lưu vào bảng enrollments để cấp quyền truy cập khóa học
    const newEnrollment = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, transaction_id, payment_status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, courseId, mockTransactionId, "completed"], // Trạng thái là completed
    );

    // 5. Trả về kết quả thành công
    res.status(200).json({
      success: true,
      message: "Thanh toán thành công! Bạn đã có thể bắt đầu học.",
      enrollment: newEnrollment.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xử lý thanh toán!" });
  }
};
