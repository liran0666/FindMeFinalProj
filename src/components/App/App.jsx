import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import { LoginPage, RegisterPage, ResetPasswordPage } from "../Auth/Auth";
import { Navbar } from "../Layout/Navbar.jsx";

import CustomerRoutes from "../../Routes/CustomerRoutes.jsx";
import PhotographerRoutes from "../../Routes/PhotographerRoutes";

const AUTH_BASE_URL = "http://localhost:5000/api/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${AUTH_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else localStorage.removeItem("token");
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (formData) => {
    const res = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const handleRegister = async (formData) => {
    const isFormData = formData instanceof FormData;
    const fetchOptions = {
      method: "POST",
      body: isFormData ? formData : JSON.stringify(formData),
    };
    if (!isFormData) fetchOptions.headers = { "Content-Type": "application/json" };

    const res = await fetch(`${AUTH_BASE_URL}/register`, fetchOptions);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) return null;
  console.log("USER OBJECT:", JSON.stringify(user));
  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <RegisterPage onRegister={handleRegister} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reset-password"
          element={!user ? <ResetPasswordPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/customer/*"
          element={
            user?.userType === "customer" ? (
              <CustomerRoutes user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/photographer/*"
          element={
            user?.userType === "photographer" ? (
              <PhotographerRoutes user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.userType === "photographer"
                    ? "/photographer"
                    : "/customer"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
