import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";

export function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className={styles.navbar}>
      {/* LEFT */}
      <div className={styles.left}>
        <div
          className={styles.logo}
          onClick={() => navigate(`/${user.userType}`)}
          title="Home"
        >
          📸 FindMe
        </div>

        {user.userType === "customer" && (
          <>
            <button
              className={`${styles.button} ${isActive("explore") ? styles.active : ""}`}
              onClick={() => navigate("/customer/explore")}
            >
              Explore
            </button>

            <button
              className={`${styles.button} ${isActive("events") ? styles.active : ""}`}
              onClick={() => navigate("/customer/events")}
            >
              Events
            </button>
          </>
        )}

        {user.userType === "photographer" && (
          <>
            <button
              className={`${styles.button} ${isActive("gallery") ? styles.active : ""}`}
              onClick={() => navigate("/photographer/gallery")}
            >
              Gallery
            </button>

            <button
              className={`${styles.button} ${isActive("stats") ? styles.active : ""}`}
              onClick={() => navigate("/photographer/stats")}
            >
              Stats
            </button>
          </>
        )}
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <button
          className={styles.button}
          onClick={() => navigate(`/${user.userType}/profile`)}
        >
          Profile
        </button>

        <button className={styles.logout} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
