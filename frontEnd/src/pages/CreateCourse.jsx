import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= CỘT TRÁI: DỮ LIỆU CƠ BẢN =================
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "IT",
    price: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // ================= CỘT PHẢI: DỮ LIỆU NỘI DUNG (CURRICULUM) =================
  // Cấu trúc state mẫu: [{ id: 1, title: '', lessons: [{ id: 1, title: '', video_url: '' }] }]
  const [curriculum, setCurriculum] = useState([]);

  // --- Các hàm thao tác với UI của Curriculum ---
  const addSection = () => {
    setCurriculum([...curriculum, { id: Date.now(), title: "", lessons: [] }]);
  };

  const updateSectionTitle = (id, title) => {
    setCurriculum(
      curriculum.map((sec) => (sec.id === id ? { ...sec, title } : sec)),
    );
  };

  const removeSection = (id) => {
    setCurriculum(curriculum.filter((sec) => sec.id !== id));
  };

  const addLesson = (sectionId) => {
    setCurriculum(
      curriculum.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            // Thêm isUploading: false
            lessons: [
              ...sec.lessons,
              {
                id: Date.now(),
                title: "",
                video_url: "",
                isUploading: false,
                fileName: "",
                rawFile: null,
              },
            ],
          };
        }
        return sec;
      }),
    );
  };

  // Phiên bản updateLesson đã chống "Ghi đè State"
  const updateLesson = (sectionId, lessonId, field, value) => {
    // Dùng prevCurriculum thay vì curriculum để luôn lấy state mới nhất
    setCurriculum((prevCurriculum) =>
      prevCurriculum.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            lessons: sec.lessons.map((les) =>
              les.id === lessonId ? { ...les, [field]: value } : les,
            ),
          };
        }
        return sec;
      }),
    );
  };

  const removeLesson = (sectionId, lessonId) => {
    setCurriculum(
      curriculum.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            lessons: sec.lessons.filter((les) => les.id !== lessonId),
          };
        }
        return sec;
      }),
    );
  };

  // Chọn file video vào state (chờ upload khi bấm Submit)
  const handleVideoSelect = (sectionId, lessonId, file) => {
    if (!file) return;

    setCurriculum((prevCurriculum) =>
      prevCurriculum.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            lessons: sec.lessons.map((les) =>
              les.id === lessonId
                ? { ...les, rawFile: file, fileName: file.name, video_url: "" }
                : les,
            ),
          };
        }
        return sec;
      }),
    );
  };

  // ================= HÀM XỬ LÝ GỬI DỮ LIỆU LÊN BACKEND =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    // 1. Đóng gói dữ liệu cơ bản (Có ảnh)
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price);
    if (thumbnail) data.append("thumbnail", thumbnail);

    try {
      // BƯỚC 1: TẠO KHÓA HỌC
      const courseRes = await axios.post(
        "http://localhost:5000/api/courses/create",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (courseRes.data.success) {
        const newCourseId = courseRes.data.course.id;

        // BƯỚC 2 & 3: LẶP ĐỂ TẠO CHƯƠNG VÀ BÀI HỌC
        for (const section of curriculum) {
          if (!section.title.trim()) continue;

          // Tạo Chương (Section)
          const secRes = await axios.post(
            `http://localhost:5000/api/curriculum/${newCourseId}/sections`,
            { title: section.title },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          const dbSectionId = secRes.data.section.id;

          // Xử lý từng bài học trong chương
          for (const lesson of section.lessons) {
            let finalVideoUrl = lesson.video_url;

            // NẾU CÓ FILE CHỜ SẴN TRONG RAM -> BÂY GIỜ MỚI ĐEM ĐI UPLOAD SERVER
            if (lesson.rawFile) {
              const videoData = new FormData();
              videoData.append("video", lesson.rawFile);

              const uploadRes = await axios.post(
                "http://localhost:5000/api/upload/video",
                videoData,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              // Upload xong lấy cái Link gán vào
              if (uploadRes.data.success) {
                finalVideoUrl = uploadRes.data.url;
              }
            }

            // Gọi API tạo Bài giảng kèm link Video cuối cùng
            if (!lesson.title.trim() || !finalVideoUrl.trim()) continue;

            await axios.post(
              `http://localhost:5000/api/curriculum/sections/${dbSectionId}/lessons`,
              { title: lesson.title, video_url: finalVideoUrl },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          }
        }

        alert("🎉 Đã tạo khóa học và nội dung thành công!");
        navigate("/instructor/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi hệ thống khi tạo khóa học!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 p-4 md:p-8">
      {/* Bọc toàn bộ bằng <form> để khi bấm "Lưu & Tạo", nó sẽ validate các ô required.
        LƯU Ý: Tất cả các nút Thêm/Xóa bên trong phải có type="button" để không bị submit nhầm.
      */}
      <form
        onSubmit={handleSubmit}
        className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
      >
        {/* ================= CỘT TRÁI: THÔNG TIN CƠ BẢN (5/12 cột) ================= */}
        <div className="xl:col-span-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Thiết lập khóa học
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Ảnh bìa */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ảnh bìa
              </label>
              <div className="w-full h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Tỷ lệ 16:9</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề khóa học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập tên khóa học..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="IT">Lập trình (IT)</option>
                  <option value="Design">Thiết kế</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả tóm tắt
              </label>
              <textarea
                rows="4"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Bạn sẽ dạy những gì?"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/instructor/dashboard")}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md disabled:bg-blue-300"
              >
                {loading ? "Đang lưu..." : "Lưu & Tạo khóa học"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: QUẢN LÝ NỘI DUNG (8/12 cột) ================= */}
        <div className="xl:col-span-8 bg-gray-900 min-h-[600px] p-6 md:p-8 rounded-2xl shadow-xl border border-gray-800 text-white">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold">
                Nội dung chương trình (Curriculum)
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Sắp xếp bài giảng của bạn thành các chương để học viên dễ theo
                dõi.
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
            >
              <span className="text-xl">+</span> Thêm Chương
            </button>
          </div>

          <div className="space-y-6">
            {curriculum.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-xl">
                <p className="text-gray-400 mb-2">Chưa có nội dung nào.</p>
                <button
                  type="button"
                  onClick={addSection}
                  className="text-blue-400 font-bold hover:text-blue-300"
                >
                  Nhấn vào đây để tạo Chương đầu tiên
                </button>
              </div>
            ) : (
              curriculum.map((section, sIndex) => (
                <div
                  key={section.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
                >
                  {/* Header của Section */}
                  <div className="bg-gray-850 p-4 border-b border-gray-700 flex items-center gap-4">
                    <span className="font-bold text-gray-400 whitespace-nowrap">
                      Chương {sIndex + 1}:
                    </span>
                    <input
                      type="text"
                      placeholder="Nhập tên chương..."
                      value={section.title}
                      onChange={(e) =>
                        updateSectionTitle(section.id, e.target.value)
                      }
                      className="flex-1 bg-transparent border-b border-gray-600 px-2 py-1 text-white focus:outline-none focus:border-blue-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="text-red-400 hover:text-red-300 px-2"
                      title="Xóa chương"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Danh sách Lesson của Section */}
                  <div className="p-4 space-y-3">
                    {section.lessons.map((lesson, lIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700 relative"
                      >
                        <div className="mt-2 text-sm text-gray-500 font-bold w-12 shrink-0">
                          Bài {lIndex + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            placeholder="Tiêu đề bài học..."
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(
                                section.id,
                                lesson.id,
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                          />

                          {/* Khu vực nhập Link HOẶC Tải video */}
                          <div className="flex flex-col gap-2">
                            <input
                              type="text" // Đổi thành text để không bị lỗi validate URL khi hiện tên file
                              placeholder="Nhập đường dẫn Video YouTube (Hoặc tải lên từ máy ở dưới) 👇"
                              value={lesson.fileName || lesson.video_url} // Ưu tiên hiện tên file nếu có
                              readOnly={!!lesson.fileName} // Khóa ô nhập nếu đã up file
                              onChange={(e) => {
                                // Chỉ cho phép tự gõ nếu không có file local
                                if (!lesson.fileName) {
                                  updateLesson(
                                    section.id,
                                    lesson.id,
                                    "video_url",
                                    e.target.value,
                                  );
                                }
                              }}
                              className={`w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition ${
                                lesson.fileName
                                  ? "text-green-400 font-bold bg-gray-700"
                                  : "text-blue-300"
                              }`}
                              disabled={lesson.isUploading}
                            />

                            {/* Nút Upload Local */}
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-bold uppercase">
                                Hoặc
                              </span>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    handleVideoSelect(
                                      section.id,
                                      lesson.id,
                                      e.target.files[0],
                                    );
                                    e.target.value = null; // Reset để có thể chọn cùng 1 file lại
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button
                                  type="button"
                                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-2"
                                >
                                  📁 Chọn Video từ máy
                                </button>
                              </div>

                              {/* Nút hủy file nếu giảng viên đổi ý muốn dùng link Youtube */}
                              {lesson.fileName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurriculum((prev) =>
                                      prev.map((s) =>
                                        s.id === section.id
                                          ? {
                                              ...s,
                                              lessons: s.lessons.map((l) =>
                                                l.id === lesson.id
                                                  ? {
                                                      ...l,
                                                      rawFile: null,
                                                      fileName: "",
                                                      video_url: "",
                                                    }
                                                  : l,
                                              ),
                                            }
                                          : s,
                                      ),
                                    );
                                  }}
                                  className="text-xs text-red-400 hover:text-red-300 underline font-medium"
                                >
                                  Xóa file
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLesson(section.id, lesson.id)}
                          className="mt-2 text-gray-500 hover:text-red-400 px-2 text-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Nút thêm Lesson */}
                    <button
                      type="button"
                      onClick={() => addLesson(section.id)}
                      className="w-full py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:bg-gray-750 transition text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <span>+</span> Thêm bài giảng
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
