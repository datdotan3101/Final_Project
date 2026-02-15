import pool from "../config/db.js";

// 1. [API] Tạo Chương (Section) mới
export const createSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    const newSection = await pool.query(
      "INSERT INTO sections (course_id, title) VALUES ($1, $2) RETURNING *",
      [courseId, title],
    );

    res.status(201).json({ success: true, section: newSection.rows[0] });
  } catch (error) {
    console.error("Lỗi tạo section:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tạo chương!" });
  }
};

// 2. [API] Tạo Bài học (Lesson) mới nằm trong một Chương
export const createLesson = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, video_url } = req.body;

    const newLesson = await pool.query(
      "INSERT INTO lessons (section_id, title, video_url) VALUES ($1, $2, $3) RETURNING *",
      [sectionId, title, video_url],
    );

    res.status(201).json({ success: true, lesson: newLesson.rows[0] });
  } catch (error) {
    console.error("Lỗi tạo lesson:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tạo bài học!" });
  }
};

// 3. [API] Lấy toàn bộ cấu trúc khóa học (Course -> Sections -> Lessons)
export const getCurriculum = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Lấy tất cả các Chương của khóa học này
    const sectionsRes = await pool.query(
      "SELECT * FROM sections WHERE course_id = $1 ORDER BY id ASC",
      [courseId],
    );
    const sections = sectionsRes.rows;

    // Lấy tất cả các Bài học thuộc các Chương của khóa học này
    const lessonsRes = await pool.query(
      `SELECT l.* FROM lessons l
       JOIN sections s ON l.section_id = s.id
       WHERE s.course_id = $1 ORDER BY l.id ASC`,
      [courseId],
    );
    const lessons = lessonsRes.rows;

    // Thuật toán: Nhét các bài học (lessons) vào đúng chương (section) của nó
    const curriculum = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((lesson) => lesson.section_id === section.id),
    }));

    res.status(200).json({ success: true, curriculum });
  } catch (error) {
    console.error("Lỗi lấy curriculum:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi lấy cấu trúc khóa học!",
      });
  }
};
