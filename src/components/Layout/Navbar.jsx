import { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";

export function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  const isActive = (path) => {
    // Exact match for root dashboard paths to avoid highlighting on sub-routes
    if (path === "/photographer" || path === "/customer") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = (path) => { navigate(path); setOpen(false); };

  const customerLinks = [
    { label: "ראשי",          icon: "🏠", path: "/customer"         },
    { label: "חיפוש צלמים",  icon: "🔍", path: "/customer/explore" },
    { label: "האירועים שלי", icon: "📅", path: "/customer/events"  },
    { label: "פרופיל",        icon: "👤", path: "/customer/profile" },
  ];

  const photographerLinks = [
    { label: "לוח בקרה",    icon: "🏠", path: "/photographer"           },
    { label: "בקשות",       icon: "📩", path: "/photographer/requests"  },
    { label: "אירועים",     icon: "📅", path: "/photographer/events"    },
    { label: "קבלות",       icon: "🧾", path: "/photographer/receipt"   },
    { label: "סטטיסטיקות",  icon: "📊", path: "/photographer/stats"     },
    { label: "פרופיל",      icon: "👤", path: "/photographer/profile"   },
  ];

  const links = user.userType === "photographer" ? photographerLinks : customerLinks;

  return (
    <>
      <div className={styles.navbar}>
        {/* Hamburger button */}
        <button
          className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="תפריט"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo */}
        <div className={styles.logo} onClick={() => navigate(`/${user.userType}`)}>
          📸 FindMe
        </div>
      </div>

      {/* Overlay */}
      {open && <div className={styles.overlay} />}

      {/* Drawer */}
      <div ref={drawerRef} className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
        {/* Drawer header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerUser}>
            <div className={styles.drawerAvatar}>
              {user.profile_pic
                ? <img src={`http://localhost:5000${user.profile_pic}`} alt="" className={styles.drawerAvatarImg} />
                : (user.userType === "photographer" ? "📸" : "👤")}
            </div>
            <div>
              <div className={styles.drawerUsername}>{user.username || user.userName}</div>
              <div className={styles.drawerRole}>
                {user.userType === "photographer" ? "צלם" : "לקוח"}
              </div>
            </div>
          </div>
          <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Nav links */}
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

        {/* Logout */}
        <div className={styles.drawerFooter}>
          <button className={styles.drawerLogout} onClick={() => { onLogout(); setOpen(false); }}>
            🚪 התנתק
          </button>
        </div>
      </div>
    </>
  );
}
