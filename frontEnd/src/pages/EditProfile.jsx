import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProfile() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [avatarUrl, setAvatarUrl] = useState(""); // Link ảnh hiện tại hoặc URL web
  const [selectedFile, setSelectedFile] = useState(null); // File ảnh lấy từ máy tính
  const [previewImage, setPreviewImage] = useState(null); // URL tạm để xem trước ảnh

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.email) {
      navigate("/login");
      return;
    }
    setFullName(user.full_name || "");
    setAvatarUrl(user.avatar_url || "");
    setPreviewImage(user.avatar_url || ""); // Set ảnh preview ban đầu bằng ảnh hiện tại
    setEmail(user.email);
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Kiểm tra định dạng (Chỉ ảnh JPG, PNG, WEBP)
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setMessage("Vui lòng chọn file ảnh hợp lệ (JPG, PNG hoặc WEBP).");
        setSelectedFile(null); // Xóa file lỗi đã chọn
        return;
      }

      // 2. Kiểm tra dung lượng (Tối đa 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        setMessage("Dung lượng ảnh tối đa là 2MB. Vui lòng chọn ảnh nhẹ hơn.");
        setSelectedFile(null); // Xóa file lỗi
        return;
      }

      // Nếu hợp lệ, tiến hành lưu để preview
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setImgError(false);
      setMessage(""); // Xóa cảnh báo cũ nếu chọn đúng
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");

    // BẮT BUỘC: Dùng FormData để gửi được File
    const formData = new FormData();
    formData.append("full_name", fullName);

    if (selectedFile) {
      // Gửi file thật lên nếu có chọn file
      formData.append("avatar", selectedFile);
    } else {
      // Nếu không đổi file, gửi lại url cũ để không bị mất
      formData.append("avatar_url", avatarUrl);
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setMessage("Cập nhật hồ sơ thành công!");
        window.dispatchEvent(new Event("userUpdated")); // Phát tín hiệu cập nhật Navbar
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lỗi khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex py-12 px-4 justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Chỉnh sửa hồ sơ
        </h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm text-center font-medium ${message.includes("thành công") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vùng Preview và Nút Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center mb-4 relative group">
              {previewImage && !imgError ? (
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-3xl font-bold text-blue-500">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>

            {/* Input file được thiết kế lại đẹp hơn */}
            <div className="relative">
              <input
                type="file"
                id="avatarUpload"
                accept="image/*" // Chỉ cho phép chọn ảnh
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer pointer-events-none"
              >
                📸 Đổi ảnh đại diện
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Tài khoản)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-bold disabled:bg-blue-300 mt-4"
          >
            {loading ? "Đang tải lên..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
