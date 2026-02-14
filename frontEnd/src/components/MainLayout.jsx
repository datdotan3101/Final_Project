import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
