// controllers/course.controller.js
import pool from "../config/db.js";

// [API] Tạo khóa học mới (Dành cho người đã đăng nhập - Instructor)
export const createCourse = async (req, res) => {
  try {
    const instructor_id = req.user.userId;
    const { title, description, price, thumbnail_url, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên khóa học và giá tiền!",
      });
    }

    const newCourse = await pool.query(
      `INSERT INTO courses (instructor_id, title, description, price, thumbnail_url, category, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        instructor_id,
        title,
        description || "",
        price,
        thumbnail_url || null,
        category || "Uncategorized", // <--- Đã đổi sang tiếng Anh
        false,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công!",
      course: newCourse.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi tạo khóa học:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tạo khóa học!" });
  }
};

// [API] Lấy danh sách khóa học (Public - Dành cho trang chủ)
export const getCourses = async (req, res) => {
  try {
    // Nhận các tham số tìm kiếm và lọc từ Frontend (URL Query)
    const { category, search } = req.query;

    // Khởi tạo câu query cơ bản, JOIN với bảng users để lấy tên giảng viên
    let query = `
      SELECT c.*, u.full_name AS instructor_name 
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    // Nếu có truyền category lên -> Lọc theo category
    if (category) {
      query += ` AND c.category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    // Nếu có truyền search lên -> Tìm kiếm theo tên (ILIKE là tìm kiếm không phân biệt chữ hoa chữ thường trong Postgres)
    if (search) {
      query += ` AND c.title ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Sắp xếp khóa học mới nhất lên đầu
    query += ` ORDER BY c.created_at DESC`;

    // Thực thi câu lệnh SQL
    const result = await pool.query(query, values);

    // Trả về kết quả
    res.status(200).json({
      success: true,
      count: result.rows.length,
      courses: result.rows,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách khóa học!",
    });
  }
};

// [API] Lấy chi tiết một khóa học kèm danh sách bài giảng (Public)
export const getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy thông tin cơ bản của khóa học + Tên và Avatar giảng viên
    const courseQuery = `
      SELECT c.*, u.full_name AS instructor_name, u.avatar_url AS instructor_avatar
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `;
    const courseResult = await pool.query(courseQuery, [id]);

    if (courseResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học!" });
    }

    const course = courseResult.rows[0];

    // 2. Lấy danh sách bài giảng của khóa học này
    // BẢO MẬT: Không SELECT trường video_url ra ngoài để tránh bị xem chùa
    const lessonsQuery = `
      SELECT id, title, duration, position, is_free 
      FROM lessons 
      WHERE course_id = $1 
      ORDER BY position ASC
    `;
    const lessonsResult = await pool.query(lessonsQuery, [id]);

    // 3. Gắn danh sách bài giảng vào object khóa học
    course.lessons = lessonsResult.rows;

    // 4. Trả kết quả về Frontend
    res.status(200).json({
      success: true,
      course: course,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khóa học:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết khóa học!",
    });
  }
};

// [API] Lấy nội dung khóa học để học (Private - Chỉ dành cho người đã mua hoặc Instructor)
export const getCourseForLearning = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // 1. Kiểm tra quyền truy cập: User đã mua khóa học này chưa? HOẶC User có phải là người tạo khóa học không?
    const accessCheck = await pool.query(
      `SELECT 1 FROM enrollments WHERE user_id = $1 AND course_id = $2
       UNION
       SELECT 1 FROM courses WHERE instructor_id = $1 AND id = $2`,
      [userId, courseId],
    );

    // Nếu không có kết quả nào trả về -> Không có quyền truy cập
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bạn chưa mua khóa học này nên không thể vào học!",
      });
    }

    // 2. Nếu đã có quyền, lấy danh sách bài giảng (Lần này CÓ TRẢ VỀ video_url)
    const lessonsQuery = `
      SELECT id, title, video_url, duration, position 
      FROM lessons 
      WHERE course_id = $1 
      ORDER BY position ASC
    `;
    const lessonsResult = await pool.query(lessonsQuery, [courseId]);

    // 3. Lấy thêm tiến độ học tập (Progress) của user này xem họ đã check (hoàn thành) những bài nào
    const progressQuery = `
      SELECT lesson_id, is_completed 
      FROM progress 
      WHERE user_id = $1 AND course_id = $2
    `;
    const progressResult = await pool.query(progressQuery, [userId, courseId]);

    // 4. Trả về kết quả
    res.status(200).json({
      success: true,
      message: "Chào mừng bạn quay lại học tập!",
      lessons: lessonsResult.rows,
      progress: progressResult.rows, // Mảng chứa các ID bài giảng đã tick xanh
    });
  } catch (error) {
    console.error("Lỗi khi tải nội dung học:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tải nội dung học!" });
  }
};
