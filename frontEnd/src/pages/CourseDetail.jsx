import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CourseDetail() {
  const { id } = useParams(); // Lấy ID khóa học từ URL
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // 1. Gọi API lấy chi tiết khóa học
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/courses/${id}`,
        );
        if (response.data.success) {
          setCourse(response.data.course);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Không thể tải thông tin khóa học hoặc khóa học không tồn tại.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  // 2. Hàm xử lý Mua khóa học (Thanh toán giả lập)
  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để mua khóa học!");
      navigate("/login");
      return;
    }

    setEnrolling(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/mock",
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }, // Truyền token vào header
      );

      if (response.data.success) {
        alert("Thanh toán thành công! Chào mừng bạn đến với khóa học.");
        // Chuyển hướng sang trang Học tập (Video Player) - Chúng ta sẽ code trang này sau
        navigate(`/learn/${id}`);
      }
    } catch (err) {
      // Bắt lỗi nếu đã mua rồi
      const errorMessage = err.response?.data?.message || "Lỗi khi thanh toán!";
      if (errorMessage === "Bạn đã mua khóa học này rồi!") {
        alert("Bạn đã sở hữu khóa học này. Chuyển đến trang học tập...");
        navigate(`/learn/${id}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl">
        Đang tải chi tiết khóa học...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-20 text-red-600 text-xl">{error}</div>
    );
  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block">
              {course.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              {course.description || "Chưa có mô tả cho khóa học này."}
            </p>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <span>
                Giảng viên:{" "}
                <strong className="text-black">{course.instructor_name}</strong>
              </span>
              <span>•</span>
              <span>Cập nhật mới nhất</span>
            </div>
          </div>

          {/* Danh sách bài giảng (Curriculum) */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-4">
              Nội dung khóa học
            </h2>
            <div className="text-sm text-gray-500 mb-4">
              {course.lessons?.length || 0} bài giảng
            </div>

            <div className="space-y-3">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-black">
                        {lesson.title}
                      </span>
                      {lesson.is_free && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          Học thử
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {Math.floor(lesson.duration / 60)} phút
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  Khóa học này chưa có bài giảng nào.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Khung thanh toán sticky */}
        <div className="lg:col-span-1">
          <div className="bg-white p-1 rounded-xl shadow-lg sticky top-6 overflow-hidden">
            {/* Thumbnail */}
            <div className="h-48 bg-gray-200">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Ảnh minh họa
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="text-3xl font-bold text-black mb-6">
                ${course.price}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`w-full py-3 rounded-lg text-white font-bold text-lg transition ${
                  enrolling
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {enrolling ? "Đang xử lý..." : "Mua khóa học ngay"}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Cam kết hoàn tiền trong 30 ngày
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
