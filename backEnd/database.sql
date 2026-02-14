-- Tạo các kiểu Enum (Vai trò user và trạng thái thanh toán)
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'refunded');

-- 1. Bảng users (Quản lý người dùng chung) [cite: 101, 102]
CREATE TABLE users (
    id SERIAL PRIMARY KEY, -- Định danh duy nhất [cite: 103]
    email VARCHAR(255) UNIQUE NOT NULL, -- Đăng nhập [cite: 104]
    password_hash VARCHAR(255) NOT NULL, -- Mật khẩu đã mã hóa [cite: 105]
    full_name VARCHAR(255) NOT NULL, -- Tên hiển thị [cite: 106]
    avatar_url TEXT, -- Link ảnh đại diện [cite: 107]
    role user_role DEFAULT 'student', -- Mặc định là student [cite: 108]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Ngày tham gia [cite: 110]
);

-- 2. Bảng courses (Khóa học) [cite: 111]
CREATE TABLE courses (
    id SERIAL PRIMARY KEY, -- Định danh khóa học [cite: 112]
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Người tạo khóa học [cite: 113]
    title VARCHAR(255) NOT NULL, -- Tên khóa học [cite: 114]
    description TEXT, -- Mô tả chi tiết [cite: 115]
    price DECIMAL(10, 2) NOT NULL, -- Giá tiền [cite: 116]
    thumbnail_url TEXT, -- Ảnh bìa [cite: 117]
    category VARCHAR(100), -- VD: Marketing, IT, Design, Office [cite: 118]
    is_published BOOLEAN DEFAULT FALSE, -- Cờ public khóa học [cite: 119]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, [cite: 120]
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP [cite: 120]
);

-- 3. Bảng lessons (Bài học - Video) [cite: 121]
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY, [cite: 122]
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE, [cite: 123]
    title VARCHAR(255) NOT NULL, -- Tên bài học [cite: 124]
    video_url TEXT NOT NULL, -- Link video [cite: 125]
    duration INTEGER, -- Thời lượng (tính bằng giây/phút) [cite: 126]
    position INTEGER NOT NULL, -- Thứ tự bài học [cite: 127]
    is_free BOOLEAN DEFAULT FALSE -- Cho phép học thử hay không [cite: 128]
);

-- 4. Bảng enrollments (Ghi danh - Quản lý việc mua) [cite: 129]
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY, [cite: 131]
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Ai mua? [cite: 132]
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE, -- Mua cái gì? [cite: 133]
    transaction_id VARCHAR(255), -- Mã giao dịch Stripe [cite: 134]
    payment_status payment_status_enum DEFAULT 'pending', [cite: 135]
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Thời điểm mua [cite: 136]
);

-- 5. Bảng progress (Tiến độ học tập) [cite: 137]
CREATE TABLE progress (
    id SERIAL PRIMARY KEY, [cite: 139]
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, [cite: 140]
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE, -- Truy vấn nhanh tiến độ % [cite: 141]
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE, -- Bài học nào đã xong [cite: 142]
    is_completed BOOLEAN DEFAULT FALSE, -- True khi user tick vào checkbox [cite: 143]
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, [cite: 144]
    UNIQUE(user_id, lesson_id) -- Ràng buộc: Mỗi user chỉ có 1 record tiến độ cho 1 bài học
);