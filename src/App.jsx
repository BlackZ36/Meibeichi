import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./pages/PrivateRoute";
import DashboardPage from "./pages/DashboardPage";
import Notfound from "./pages/NotFoundPage";
function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Định nghĩa các route công khai */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Notfound />} />
          <Route path="/dashboard/:tab" element={<DashboardPage />} />
        </Routes>
      </Router>
      <Toaster richColors position="top-right" expand={true} theme="light" />
    </>
  );
}

export default App;
