import { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";

export function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  const isActive = (path) => {
    //היילייט של שורה אקטיבית
    if (path === "/photographer" || path === "/customer") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // סגור תפריט בלחיצת שורה
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // סגירת תפריט בלחיצה בחוץ
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  const customerLinks = [
    { label: "ראשי", icon: "🏠", path: "/customer" },
    { label: "חיפוש צלמים", icon: "🔍", path: "/customer/explore" },
    { label: "האירועים שלי", icon: "📅", path: "/customer/events" },
    { label: "פרופיל", icon: "👤", path: "/customer/profile" },
  ];

  const photographerLinks = [
    { label: "לוח בקרה", icon: "🏠", path: "/photographer" },
    { label: "בקשות", icon: "📩", path: "/photographer/requests" },
    { label: "אירועים", icon: "📅", path: "/photographer/events" },
    { label: "קבלות", icon: "🧾", path: "/photographer/receipt" },
    { label: "סטטיסטיקות", icon: "📊", path: "/photographer/stats" },
    { label: "פרופיל", icon: "👤", path: "/photographer/profile" },
  ];

  const links =
    user.userType === "photographer" ? photographerLinks : customerLinks;

  return (
    <>
      <div className={styles.navbar}>
        {/* כפתור תפריט */}
        <button
          className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="תפריט"
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={styles.logo}
          onClick={() => navigate(`/${user.userType}`)}
        >
          <img src="/findme.png" alt="findmeLogo" width={100}></img>
        </div>
      </div>

      {open && <div className={styles.overlay} />}

      <div
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerUser}>
            <div className={styles.drawerAvatar}>
              {user.profile_pic ? (
                <img
                  src={`http://localhost:5000${user.profile_pic}`}
                  alt=""
                  className={styles.drawerAvatarImg}
                />
              ) : user.userType === "photographer" ? (
                "📸"
              ) : (
                "👤"
              )}
            </div>
            <div>
              <div className={styles.drawerUsername}>
                {user.username || user.userName}
              </div>
              <div className={styles.drawerRole}>
                {user.userType === "photographer" ? "צלם" : "לקוח"}
              </div>
            </div>
          </div>
          <button className={styles.drawerClose} onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {links.map((link) => (
            <button
              key={link.path}
              className={`${styles.drawerLink} ${isActive(link.path) ? styles.drawerLinkActive : ""}`}
              onClick={() => go(link.path)}
            >
              <span className={styles.drawerLinkIcon}>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <button
            className={styles.drawerLogout}
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
          >
            🚪 התנתק
          </button>
        </div>
      </div>
    </>
  );
}
