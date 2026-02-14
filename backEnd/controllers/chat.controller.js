// controllers/chat.controller.js
import { Ollama } from "ollama";
import pool from "../config/db.js";

// Khởi tạo kết nối tới Ollama đang chạy ở local (mặc định cổng 11434)
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
});

// [API] Chat với AI để gợi ý khóa học
export const getCourseRecommendation = async (req, res) => {
  try {
    const { question } = req.body; // Ví dụ: "Tôi muốn học làm web"

    if (!question) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập câu hỏi!" });
    }

    // 1. Lấy danh sách các khóa học ĐANG PUBLIC từ Database
    // Chỉ lấy các trường cần thiết để tiết kiệm token/context cho AI
    const result = await pool.query(
      "SELECT id, title, category, price, description FROM courses WHERE is_published = true",
    );
    const courses = result.rows;

    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        answer: "Hiện tại hệ thống chưa có khóa học nào được xuất bản.",
      });
    }

    // 2. Chuyển đổi danh sách thành chuỗi văn bản (Context)
    const coursesContext = JSON.stringify(courses);

    // 3. Prompt Engineering (Thiết lập tính cách và luật cho AI)
    const systemPrompt = `Bạn là trợ lý tư vấn khóa học của nền tảng E-Learning. 
    Dưới đây là danh sách các khóa học hiện có: ${coursesContext}.
    
    Luật trả lời:
    - Dựa vào câu hỏi của người dùng, hãy gợi ý khóa học phù hợp nhất từ danh sách trên.
    - Phải trả lời bằng tiếng Việt, thân thiện và ngắn gọn.
    - Luôn kèm theo Tên khóa học, Giá tiền và ID của khóa học (Ví dụ: "Khóa học React - Giá: 19.99 - ID: 1").
    - Nếu không có khóa học nào phù hợp trong danh sách, hãy nói xin lỗi và gợi ý họ tìm kiếm danh mục khác. 
    - Tuyệt đối KHÔNG tự bịa ra khóa học không có trong danh sách trên.`;

    // 4. Gọi Ollama xử lý
    // Lưu ý: Tên model phải khớp với model bạn đã tải về máy (VD: llama3, qwen, mistral...)
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "llama3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    // 5. Trả kết quả về cho Frontend
    res.status(200).json({
      success: true,
      answer: response.message.content,
    });
  } catch (error) {
    console.error("Lỗi khi gọi AI Chatbot:", error);
    // Nếu Ollama chưa được bật dưới local, nó sẽ nhảy vào lỗi này
    res.status(500).json({
      success: false,
      message:
        "Hệ thống AI đang bận hoặc chưa khởi động. Vui lòng thử lại sau!",
    });
  }
};
