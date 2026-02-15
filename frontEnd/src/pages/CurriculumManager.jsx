import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function CurriculumManager() {
  const { courseId } = useParams();
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form thêm Chương
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Form thêm Bài học (Lưu ID của chương đang được thêm bài học)
  const [addingLessonToSection, setAddingLessonToSection] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: "", video_url: "" });

  // Lấy dữ liệu cấu trúc khóa học
  const fetchCurriculum = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/curriculum/${courseId}`,
      );
      if (response.data.success) {
        setCurriculum(response.data.curriculum);
      }
    } catch (error) {
      console.error("Lỗi khi tải nội dung:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  // Hàm gọi API thêm Chương
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/curriculum/${courseId}/sections`,
        { title: newSectionTitle },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewSectionTitle("");
      setIsAddingSection(false);
      fetchCurriculum(); // Tải lại danh sách
    } catch (error) {
        console.error("Lỗi khi thêm Chương mới:", error);
      alert("Lỗi khi thêm Chương mới!");
    }
  };

  // Hàm gọi API thêm Bài học
  const handleAddLesson = async (e, sectionId) => {
    e.preventDefault();
    if (!newLesson.title.trim() || !newLesson.video_url.trim()) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/curriculum/sections/${sectionId}/lessons`,
        newLesson,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewLesson({ title: "", video_url: "" });
      setAddingLessonToSection(null);
      fetchCurriculum(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi thêm Bài học:", error);
      alert("Lỗi khi thêm Bài học!");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 font-bold">
        Đang tải cấu trúc khóa học...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              to="/instructor/dashboard"
              className="text-blue-600 hover:underline text-sm font-semibold mb-2 inline-block"
            >
              &larr; Quay lại Bảng điều khiển
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              Chương trình giảng dạy
            </h1>
            <p className="text-gray-500 mt-1">
              Xây dựng cấu trúc khóa học của bạn bằng cách thêm Chương và Bài
              học.
            </p>
          </div>
        </div>

        {/* Danh sách các Chương (Sections) */}
        <div className="space-y-6">
          {curriculum.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Tiêu đề Chương */}
              <div className="bg-gray-100 px-6 py-4 font-bold text-gray-800 flex justify-between items-center border-b border-gray-200">
                <span>
                  Phần {index + 1}: {section.title}
                </span>
                <span className="text-xs bg-white px-2 py-1 rounded text-gray-500 border border-gray-200">
                  {section.lessons.length} bài học
                </span>
              </div>

              {/* Danh sách Bài học bên trong */}
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  {section.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition"
                    >
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-blue-500 truncate mt-1">
                          Video: {lesson.video_url}
                        </p>
                      </div>
                    </div>
                  ))}
                  {section.lessons.length === 0 && (
                    <p className="text-gray-400 text-sm italic text-center py-2">
                      Chưa có bài học nào trong chương này.
                    </p>
                  )}
                </div>

                {/* Nút bật/tắt Form thêm Bài học */}
                {addingLessonToSection === section.id ? (
                  <form
                    onSubmit={(e) => handleAddLesson(e, section.id)}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4"
                  >
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Tên bài học (VD: Bài 1: Cài đặt môi trường)"
                        value={newLesson.title}
                        onChange={(e) =>
                          setNewLesson({ ...newLesson, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="url"
                        placeholder="Link Video (VD: https://youtube.com/...)"
                        value={newLesson.video_url}
                        onChange={(e) =>
                          setNewLesson({
                            ...newLesson,
                            video_url: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700"
                      >
                        Lưu Bài Học
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingLessonToSection(null)}
                        className="text-gray-600 px-4 py-2 text-sm font-bold hover:underline"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingLessonToSection(section.id)}
                    className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition"
                  >
                    + Thêm Bài học
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Khối Thêm Chương Mới */}
        <div className="mt-8">
          {isAddingSection ? (
            <form
              onSubmit={handleAddSection}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="font-bold text-gray-800 mb-4">Tạo Chương Mới</h3>
              <input
                type="text"
                placeholder="Nhập tiêu đề chương (VD: Phần 1 - Căn bản)"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500 text-black"
                required
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition"
                >
                  Thêm Chương
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingSection(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 transition bg-white"
            >
              + Thêm Chương mới (Section)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
