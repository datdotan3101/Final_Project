import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Hàm chuyển đổi vai trò
  const toggleRole = () => {
    const newRole = user.role === "student" ? "lecturer" : "student";
    const updatedUser = { ...user, role: newRole };

    // Lưu vào localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Thông báo cho các component khác
    window.dispatchEvent(new Event("userUpdated"));

    alert(
      `Đã chuyển sang vai trò: ${newRole === "lecturer" ? "Giảng viên" : "Học viên"}`,
    );

    // Nếu là giảng viên, có thể điều hướng về Dashboard của giảng viên
    if (newRole === "lecturer") {
      navigate("/instructor/dashboard");
    } else {
      navigate("/courses");
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/courses"
              className="text-2xl font-bold text-blue-600 tracking-tight"
            >
              E-Learning<span className="text-gray-800">MVP</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/courses"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Khám phá
            </Link>

            <div className="h-6 w-px bg-gray-300"></div>

            {user.email ? (
              <div className="relative group cursor-pointer py-4">
                <div className="flex items-center gap-2">
                  {user.avatar_url && !imgError ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {user.full_name
                        ? user.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}

                  <div className="flex flex-col items-start leading-none hidden sm:flex">
                    <span className="text-sm font-medium text-gray-700">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-blue-500 font-bold uppercase mt-1">
                      {user.role === "lecturer" ? "Giảng viên" : "Học viên"}
                    </span>
                  </div>

                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-[-8px] pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-center">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                        Chế độ người dùng
                      </p>

                      {/* Nút Switch Role */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRole();
                        }}
                        className="flex items-center justify-between bg-gray-200 rounded-full p-1 cursor-pointer relative w-full h-10 transition-colors"
                      >
                        <div
                          className={`absolute w-[48%] h-8 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${user.role === "lecturer" ? "translate-x-[104%]" : "translate-x-0"}`}
                        ></div>
                        <span
                          className={`relative z-10 w-1/2 text-[10px] font-bold ${user.role === "student" ? "text-blue-600" : "text-gray-500"}`}
                        >
                          STUDENT
                        </span>
                        <span
                          className={`relative z-10 w-1/2 text-[10px] font-bold ${user.role === "lecturer" ? "text-blue-600" : "text-gray-500"}`}
                        >
                          LECTURER
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile/edit"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                      >
                        Chỉnh sửa hồ sơ
                      </Link>

                      {user.role === "lecturer" && (
                        <Link
                          to="/instructor/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                        >
                          Quản lý khóa học
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition text-center uppercase tracking-tighter"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
