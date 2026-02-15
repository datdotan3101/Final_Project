import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InstructorDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    // Kiểm tra bảo vệ: Nếu không phải lecturer thì đá về trang chủ
    if (user.role !== "lecturer") {
      navigate("/courses");
      return;
    }

    const fetchMyCourses = async () => {
      const token = localStorage.getItem("token");
      try {
        // API này sẽ trả về danh sách khóa học mà instructor_id = userId
        const response = await axios.get(
          "http://localhost:5000/api/courses/instructor/my-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.data.success) {
          setMyCourses(response.data.courses);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học của tôi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Bảng điều khiển Giảng viên
            </h1>
            <p className="text-gray-500 mt-1">
              Quản lý và theo dõi hiệu suất các khóa học của bạn
            </p>
          </div>
          <Link
            to="/instructor/create-course"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            + Tạo khóa học mới
          </Link>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Tổng khóa học</p>
            <p className="text-3xl font-bold text-gray-800">
              {myCourses.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">Tổng học viên</p>
            <p className="text-3xl font-bold text-blue-600">--</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">
              Doanh thu ước tính
            </p>
            <p className="text-3xl font-bold text-green-600">$0.00</p>
          </div>
        </div>

        {/* Danh sách khóa học */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Khóa học của bạn
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Đang tải dữ liệu...
            </div>
          ) : myCourses.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-gray-500 mb-4">Bạn chưa tạo khóa học nào.</p>
              <Link
                to="/instructor/create-course"
                className="text-blue-600 font-bold hover:underline"
              >
                Bắt đầu tạo ngay thôi!
              </Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Khóa học</th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-semibold">Giá</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${course.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {course.is_published ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">${course.price}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/instructor/course/${course.id}/manage`}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                      >
                        Quản lý nội dung
                      </Link>
                      <button className="text-red-500 hover:text-red-700 font-medium text-sm">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
