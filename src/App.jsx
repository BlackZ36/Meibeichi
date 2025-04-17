import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./pages/PrivateRoute";
import DashboardPage from "./pages/DashboardPage";
import Notfound from "./pages/NotFoundPage";
import EditProductPage from "./components/edit-product";
function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes bọc bởi PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/:tab" element={<DashboardPage />} />
            <Route path="/dashboard/edit/:id" element={<EditProductPage />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<Notfound />} />
        </Routes>
      </Router>
      <Toaster richColors position="top-right" expand={true} theme="light" />
    </>
  );
}

export default App;
