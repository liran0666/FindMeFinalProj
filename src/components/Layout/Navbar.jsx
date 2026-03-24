// Navbar.jsx

import { useState } from "react";
import styles from "./Navbar.module.css";

const CUSTOMER_LINKS = [
  { id: "explore", label: "גלה צלמים", icon: "🔍" },
  { id: "events", label: "האירועים שלי", icon: "📅" },
  { id: "profile", label: "הפרופיל שלי", icon: "👤" },
];

const PHOTOGRAPHER_LINKS = [
  { id: "proposals", label: "הצעות", icon: "📩" },
  { id: "events", label: "אירועים", icon: "📅" },
  { id: "gallery", label: "גלריה", icon: "🖼️" },
  { id: "stats", label: "סטטיסטיקות", icon: "📊" },
  { id: "profile", label: "פרופיל", icon: "👤" },
];

export function Navbar({ user, activeTab, onTabChange, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links =
    user?.role === "photographer" ? PHOTOGRAPHER_LINKS : CUSTOMER_LINKS;
  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <div className={styles.logo}>FindMe 📸</div>

          <div className={styles.navLinks}>
            {links.map((link) => (
              <button
                key={link.id}
                className={`${styles.navLink} ${activeTab === link.id ? styles.active : ""}`}
                onClick={() => onTabChange?.(link.id)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className={styles.userChip}>
            <div className={styles.userAvatar}>{initials}</div>
            {user?.username || "משתמש"}
          </div>

          <div
            className={styles.hamburger}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        {links.map((link) => (
          <button
            key={link.id}
            className={`${styles.mobileNavLink} ${activeTab === link.id ? styles.active : ""}`}
            onClick={() => {
              onTabChange?.(link.id);
              setMenuOpen(false);
            }}
          >
            <span>{link.icon}</span>
            {link.label}
          </button>
        ))}
        <button className={styles.logoutBtn} onClick={onLogout}>
          התנתק 👋
        </button>
      </div>

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}

export default Navbar;
