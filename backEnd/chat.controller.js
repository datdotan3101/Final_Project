import { Ollama } from "ollama";
// Phải có đuôi .js khi import file tự viết
import pool from "../config/db.js";

const ollama = new Ollama({ host: process.env.OLLAMA_HOST });

export const getCourseRecommendation = async (req, res) => {
  try {
    const userQuestion = req.body.question;

    const result = await pool.query(
      "SELECT id, title, category, price FROM courses WHERE is_published = true",
    );
    const courses = result.rows;
    const coursesContext = JSON.stringify(courses);

    const systemPrompt = `Bạn là trợ lý tư vấn khóa học của nền tảng E-Learning. 
    Dưới đây là danh sách các khóa học hiện có: ${coursesContext}. 
    Dựa vào câu hỏi của người dùng, hãy chỉ ra Tên và ID của khóa học phù hợp nhất. Nếu không có, hãy nói không tìm thấy.`;

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuestion },
      ],
    });

    res.json({
      success: true,
      answer: response.message.content,
    });
  } catch (error) {
    console.error("Ollama Error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi gọi AI" });
  }
};
