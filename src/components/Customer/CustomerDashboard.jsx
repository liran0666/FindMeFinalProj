// CustomerDashboard.jsx — דף הבית של הלקוח

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerDashboard.module.css";

const API = "http://localhost:5000/api/events";

const EVENT_ICONS = {
  חתונה: "💍",
  "בר מצווה": "✡️",
  "יום הולדת": "🎂",
  סיום: "🎓",
  עסקי: "💼",
  אחר: "📸",
};
function getIcon(name) {
  const match = Object.entries(EVENT_ICONS).find(([k]) => name?.includes(k));
  return match ? match[1] : "📸";
}
// פונקציה חישובית המחזירה מספרר ימים מתאריך נתון
function daysUntil(dateVal) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateVal);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function formatDate(dateVal) {
  const d = new Date(dateVal);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
//פונקציה להחזרת ימים בפורמט יפה יותר
function countdownLabel(days) {
  if (days === 0) return { number: "היום", unit: "🎉" };
  if (days === 1) return { number: "מחר", unit: "📅" };
  return { number: days, unit: "ימים" };
}

function statusLabel(ev) {
  if (ev.status === "pending") return { text: "ממתין לאישור", cls: "pending" };
  if (ev.status === "active") return { text: "אושר", cls: "active" };
  return { text: ev.status, cls: "pending" };
}

export default function CustomerDashboard({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/customer`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // אירועים קרבים וקיימים
  const upcoming = events
    .filter((e) => e.status !== "declined" && daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nearest = upcoming[0] || null;
  const otherUpcoming = upcoming.slice(1, 4);

  const totalPast = events.filter(
    (e) => e.status === "active" && daysUntil(e.date) < 0,
  ).length;
  const totalPending = events.filter((e) => e.status === "pending").length;

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        שלום, {user?.username || user?.userName} 👋
      </div>
      <div className={styles.subtitle}>
        {loading
          ? "טוען..."
          : upcoming.length === 0
            ? "אין לך אירועים קרובים כרגע"
            : `יש לך ${upcoming.length} אירוע${upcoming.length > 1 ? "ים" : ""} קרוב${upcoming.length > 1 ? "ים" : ""}`}
      </div>
      {/* נתונים קלים על אירוע*/}
      {!loading && events.length > 0 && (
        <div className={styles.statsRow}>
          {[
            {
              icon: "📋",
              value: events.length,
              label: "סה״כ אירועים",
              status: "all",
            },
            {
              icon: "⏳",
              value: totalPending,
              label: "ממתינים לאישור",
              status: "pending",
            },
            {
              icon: "📅",
              value: upcoming.length,
              label: "אירועים קרובים",
              status: "active",
            },
            {
              icon: "✅",
              value: totalPast,
              label: "הושלמו",
              status: "done",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={styles.statCube}
              onClick={() => navigate(`/customer/events?fil=${s.status}`)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {/* אם אין אירועים*/}
      {!loading && upcoming.length === 0 && (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIllustration}>📷</div>
          <div className={styles.emptyTitle}>
            {events.length === 0 ? "עדיין לא יצרת אירוע" : "אין אירועים קרובים"}
          </div>
          <div className={styles.emptyText}>
            חפש צלם מקצועי ושלח לו הצעת אירוע
          </div>
          <button
            className={styles.exploreBtn}
            onClick={() => navigate("/customer/explore")}
          >
            🔍 חפש צלמים
          </button>
        </div>
      )}
      {/* אירוע הקרוב ביותר*/}
      {!loading &&
        nearest &&
        (() => {
          const days = daysUntil(nearest.date);
          const cd = countdownLabel(days);
          const { text: sText, cls: sCls } = statusLabel(nearest);
          return (
            <div className={styles.mainCard}>
              <div className={styles.mainCardLeft}>
                <div className={styles.countdownBox}>
                  <div className={styles.countdownNumber}>{cd.number}</div>
                  <div className={styles.countdownUnit}>{cd.unit}</div>
                </div>
                <div className={styles.countdownCaption}>עד האירוע הבא</div>
              </div>

              <div className={styles.mainCardRight}>
                <div className={styles.mainEventHeader}>
                  <span className={styles.mainEventIcon}>
                    {getIcon(nearest.name)}
                  </span>
                  <span className={styles.mainEventName}>{nearest.name}</span>
                  <span
                    className={`${styles.statusPill} ${styles[`pill_${sCls}`]}`}
                  >
                    {sText}
                  </span>
                </div>

                <div className={styles.mainEventDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>📅</span>
                    <span className={styles.detailValue}>
                      {formatDate(nearest.date)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>📍</span>
                    <span className={styles.detailValue}>{nearest.place}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailIcon}>📷</span>
                    <span className={styles.detailValue}>
                      {nearest.photographerName}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.viewEventBtn}
                  onClick={() => navigate("/customer/events")}
                >
                  צפה בכל האירועים ←
                </button>
              </div>
            </div>
          );
        })()}
      {/*  אירועים נוספים קובייה קטנה*/}
      {!loading && otherUpcoming.length > 0 && (
        <>
          <div className={styles.sectionTitle}>אירועים נוספים</div>
          <div className={styles.cubesRow}>
            {otherUpcoming.map((ev) => {
              const days = daysUntil(ev.date);
              const cd = countdownLabel(days);
              const { text: sText, cls: sCls } = statusLabel(ev);
              return (
                <div key={ev.id} className={styles.smallCube}>
                  <div className={styles.smallCubeTop}>
                    <span className={styles.smallCubeIcon}>
                      {getIcon(ev.name)}
                    </span>
                    <span
                      className={`${styles.statusPill} ${styles[`pill_${sCls}`]}`}
                    >
                      {sText}
                    </span>
                  </div>
                  <div className={styles.smallCubeName}>{ev.name}</div>
                  <div className={styles.smallCubeCountdown}>
                    <span className={styles.smallCubeNumber}>{cd.number}</span>
                    <span className={styles.smallCubeUnit}>{cd.unit}</span>
                  </div>
                  <div className={styles.smallCubeMeta}>
                    <span>📅 {formatDate(ev.date)}</span>
                    <span>📍 {ev.place}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
