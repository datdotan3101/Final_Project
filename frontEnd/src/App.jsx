import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route tạm thời cho trang chủ */}
        <Route
          path="/"
          element={
            <h1 className="text-center mt-10 text-2xl">Trang chủ E-Learning</h1>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
