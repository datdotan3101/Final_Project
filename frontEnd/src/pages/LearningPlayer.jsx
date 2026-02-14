import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";

export default function LearningPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]); // Mảng chứa ID các bài đã hoàn thành
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Gọi API lấy nội dung học
  useEffect(() => {
    const fetchLearningContent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập để vào học!");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/courses/${courseId}/learn`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          const fetchedLessons = response.data.lessons;
          setLessons(fetchedLessons);

          // Mặc định chọn bài học đầu tiên để phát video
          if (fetchedLessons.length > 0) {
            setCurrentLesson(fetchedLessons[0]);
          }

          // Lọc ra các ID bài học đã được đánh dấu là completed
          const completedIds = response.data.progress
            .filter((p) => p.is_completed)
            .map((p) => p.lesson_id);
          setCompletedLessons(completedIds);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Bạn chưa mua khóa học này nên không thể vào học!");
        } else {
          setError("Lỗi khi tải nội dung bài học.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLearningContent();
  }, [courseId, navigate]);

  // 2. Hàm xử lý khi người dùng tick vào ô Checkbox (Đánh dấu hoàn thành)
  const handleToggleComplete = async (lessonId) => {
    const token = localStorage.getItem("token");
    // Kiểm tra xem bài này đang ở trạng thái nào
    const isCurrentlyCompleted = completedLessons.includes(lessonId);
    const newStatus = !isCurrentlyCompleted;

    try {
      // Cập nhật giao diện ngay lập tức để tạo cảm giác mượt mà (Optimistic UI)
      if (newStatus) {
        setCompletedLessons([...completedLessons, lessonId]);
      } else {
        setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
      }

      // Gọi API chạy ngầm phía sau
      await axios.post(
        "http://localhost:5000/api/progress/mark-completed",
        { lessonId: lessonId, is_completed: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error("Lỗi khi lưu tiến độ", err);
      // Nếu API lỗi, hoàn tác lại UI (rollback)
      alert("Lỗi khi lưu tiến độ, vui lòng thử lại!");
      if (isCurrentlyCompleted) {
        setCompletedLessons([...completedLessons, lessonId]);
      } else {
        setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
      }
    }
  };

  // Tính phần trăm tiến độ
  const progressPercentage =
    lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-bold">
        Đang tải không gian học tập...
      </div>
    );

  // Nếu bị lỗi (chưa mua khóa học), hiển thị thông báo và nút quay lại
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <Link
          to={`/courses/${courseId}`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Quay lại trang giới thiệu
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navbar siêu tốc của không gian học */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
        <Link
          to="/courses"
          className="text-gray-300 hover:text-white flex items-center gap-2"
        >
          &larr; Quay lại danh sách
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            Tiến độ: {progressPercentage}%
          </span>
          <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Nội dung chính: Chia 2 cột (Video bên trái, Playlist bên phải) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Cột trái: Trình phát Video */}
        <div className="flex-1 flex flex-col bg-black relative">
          {currentLesson ? (
            <>
              {/* Vùng phát Video */}
              <div
                className="relative w-full"
                style={{ paddingTop: "56.25%" /* Tỉ lệ 16:9 */ }}
              >
                <div className="absolute top-0 left-0 w-full h-full">
                  <ReactPlayer
                    url={currentLesson.video_url}
                    controls
                    width="100%"
                    height="100%"
                    playing={true} // Tự động phát khi chuyển bài
                    onEnded={() => {
                      // Tự động đánh dấu hoàn thành khi xem xong video
                      if (!completedLessons.includes(currentLesson.id)) {
                        handleToggleComplete(currentLesson.id);
                      }
                    }}
                  />
                </div>
              </div>
              {/* Thông tin bài học đang phát */}
              <div className="p-6 bg-gray-900 text-white flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  Bài {currentLesson.position}: {currentLesson.title}
                </h1>
              </div>
            </>
          ) : (
            <div className="text-white m-auto text-xl">
              Chưa có bài giảng nào để phát.
            </div>
          )}
        </div>

        {/* Cột phải: Danh sách bài giảng (Curriculum) */}
        <div className="w-full lg:w-96 bg-gray-800 text-white border-l border-gray-700 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 border-b border-gray-700 font-bold text-lg sticky top-0 bg-gray-800 z-10">
            Nội dung khóa học
          </div>

          <div className="flex-1">
            {lessons.map((lesson) => {
              const isActive = currentLesson?.id === lesson.id;
              const isCompleted = completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-4 border-b border-gray-700 cursor-pointer transition ${
                    isActive
                      ? "bg-gray-700 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-750"
                  }`}
                  onClick={() => setCurrentLesson(lesson)}
                >
                  {/* Nút check hoàn thành */}
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-green-500"
                    checked={isCompleted}
                    onChange={(e) => {
                      e.stopPropagation(); // Ngăn không cho click vào ô check làm chuyển bài video
                      handleToggleComplete(lesson.id);
                    }}
                  />

                  {/* Tên bài học */}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${isActive ? "text-blue-400" : "text-gray-200"}`}
                    >
                      {lesson.position}. {lesson.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.floor(lesson.duration / 60)} phút
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
