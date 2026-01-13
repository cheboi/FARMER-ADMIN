import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerDetail from "./pages/FarmerDetail";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handler = () => setToken(null);
    window.addEventListener("auth-logout", handler);
    return () => window.removeEventListener("auth-logout", handler);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/dashboard"
              element={<Dashboard setToken={setToken} />}
            />
            <Route
              path="/farmer"
              element={<FarmerDashboard setToken={setToken} />}
            />
            <Route path="/dashboard/farmers/:id" element={<FarmerDetail />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
