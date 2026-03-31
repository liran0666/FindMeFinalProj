import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

import { LoginPage, RegisterPage } from "../Auth/Auth";
import { Navbar } from "../Layout/Navbar.jsx";

import CustomerRoutes from "../../Routes/CustomerRoutes.jsx";
import PhotographerRoutes from "../../Routes/PhotographerRoutes";

// Demo users
const DEMO_USERS = {
  customer: { fullName: "דנה כהן", username: "dana_c", role: "customer" },
  photographer: {
    fullName: "יונתן לוי",
    username: "yonatan_photos",
    role: "photographer",
  },
};

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    const loggedUser = data.role ? data : DEMO_USERS.photographer;
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}

      

      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={
            !user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <RegisterPage onRegister={handleLogin} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/customer/*"
          element={
            user?.role === "customer" ? (
              <CustomerRoutes user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/photographer/*"
          element={
            user?.role === "photographer" ? (
              <PhotographerRoutes user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "photographer" ? "/photographer" : "/customer"
                }
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}



