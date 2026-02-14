import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import LearningPlayer from "./pages/LearningPlayer";
import MainLayout from "./components/MainLayout"; // <-- Import Layout
import EditProfile from "./pages/EditProfile";
import InstructorDashboard from "./pages/InstructorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Các trang KHÔNG có Navbar */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/learn/:courseId" element={<LearningPlayer />} />

        {/* Các trang CÓ Navbar (Bọc bên trong MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          <Route
            path="/instructor/dashboard"
            element={<InstructorDashboard />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
