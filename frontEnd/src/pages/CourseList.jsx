import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Chatbot from "../components/Chatbot"; // <-- 1. Import Chatbot vào đây

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Hàm gọi API lấy danh sách khóa học
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Truyền thêm query params nếu có search hoặc category
      const response = await axios.get("http://localhost:5000/api/courses", {
        params: { search, category },
      });
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API mỗi khi component mount hoặc khi category thay đổi (tìm kiếm được thực hiện khi submit form)
  useEffect(() => {
    const fetchByCategory = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/courses", {
          params: { category },
        });
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [category]); // Tự động lọc khi đổi category

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(); // Lọc khi submit form tìm kiếm
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề & Khu vực tìm kiếm/Lọc */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* ĐẶT CHATBOT CẠNH TIÊU ĐỀ */}
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Khám phá khóa học
            </h1>
            <Chatbot />
          </div>

          <div className="flex w-full md:w-auto gap-2">
            {/* Lọc theo Category */}
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              <option value="IT">Lập trình (IT)</option>
              <option value="Design">Thiết kế (Design)</option>
              <option value="Marketing">Marketing</option>
            </select>

            {/* Tìm kiếm */}
            <form onSubmit={handleSearch} className="flex flex-1">
              <input
                type="text"
                placeholder="Tìm tên khóa học..."
                className="w-full border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>

        {/* Danh sách khóa học */}
        {loading ? (
          <p className="text-center text-gray-500">
            Đang tải danh sách khóa học...
          </p>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-500">
            Không tìm thấy khóa học nào phù hợp.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Ảnh thumbnail */}
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Không có ảnh
                    </div>
                  )}
                  {/* Badge Category */}
                  <span className="absolute top-2 left-2 bg-white/90 text-sm font-semibold px-2 py-1 rounded text-blue-600">
                    {course.category}
                  </span>
                </div>

                {/* Thông tin khóa học */}
                <div className="p-5">
                  <h3
                    className="font-bold text-lg text-gray-800 mb-2 truncate"
                    title={course.title}
                  >
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Giảng viên: {course.instructor_name}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-green-600">
                      ${course.price}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Xem chi tiết &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
