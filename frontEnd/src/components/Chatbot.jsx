import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Khởi tạo danh sách tin nhắn với một câu chào mặc định
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Chào bạn! Mình là AI tư vấn khóa học. Bạn đang muốn học về kỹ năng gì?",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // 1. Cập nhật UI ngay lập tức với tin nhắn của User
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Gọi API Backend (Ollama)
      const response = await axios.post("http://localhost:5000/api/chat/ask", {
        question: userMessage,
      });

      if (response.data.success) {
        // 3. Hiển thị câu trả lời của AI
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: response.data.answer },
        ]);
      }
    } catch (error) {
      console.error("Lỗi gọi AI Chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Xin lỗi, hệ thống AI đang bận hoặc chưa được khởi động. Bạn thử lại sau nhé!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block ml-4">
      {/* Nút Bong bóng Chat (Nằm cạnh tiêu đề) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-blue-600 text-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all z-40"
        title="Chat với AI tư vấn"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <span className="text-xl">🤖</span> // Đổi icon thành Robot cho trực quan
        )}
      </button>

      {/* Khung Chat Window */}
      {isOpen && (
        <div
          className="absolute top-12 left-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          style={{ height: "450px" }}
        >
          {/* Header Chat */}
          <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span>Trợ lý AI Tư Vấn</span>
            </div>
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm whitespace-pre-wrap"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none text-xs flex gap-1 items-center animate-pulse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-400"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-200 flex gap-2 items-center"
          >
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
