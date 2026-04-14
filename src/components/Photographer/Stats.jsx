// Stats.jsx - Photographer statistics page

import { useState } from "react";
import styles from "./Stats.module.css";

const MONTHLY_DATA = [
  { month: "ינו", events: 4 },
  { month: "פבר", events: 5 },
  { month: "מרץ", events: 5 },
  { month: "אפר", events: 7 },
  { month: "מאי", events: 8 },
  { month: "יוני", events: 7 },
  { month: "יולי", events: 6 },
  { month: "אוג", events: 7 },
  { month: "ספט", events: 9 },
  { month: "אוק", events: 10 },
  { month: "נוב", events: 8 },
  { month: "דצמ", events: 11 },
];

const SPECIALTIES_DATA = [
  { name: "חתונות", pct: 45 },
  { name: "אירועים", pct: 28 },
  { name: "פורטרט", pct: 15 },
  { name: "עסקי", pct: 12 },
];

const RATING_DATA = [
  { stars: 5, count: 89 },
  { stars: 4, count: 28 },
  { stars: 3, count: 8 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];


export function StatsPage({ user }) {
  const [period, setPeriod] = useState("2026");
  const totalEvents = MONTHLY_DATA.reduce((s, d) => s + d.events, 0);
  const totalRatings = RATING_DATA.reduce((s, d) => s + d.count, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>📊 סטטיסטיקות</div>
      <div className={styles.pageSubtitle}>מבט על על הפעילות שלך</div>

      <div className={styles.periodSelector}>
        {["2024", "2025", "2026"].map((y) => (
          <button
            key={y}
            className={`${styles.periodBtn} ${period === y ? styles.active : ""}`}
            onClick={() => setPeriod(y)}
          >
            {y}
          </button>
        ))}
      </div>

      <div className={styles.statsGrid}>
        {[
          {
            icon: "📅",
            value: totalEvents,
            label: "אירועים השנה",
            trend: "+5",
            up: true,
          },
          {
            icon: "⭐",
            value: "4.9",
            label: "דירוג ממוצע",
            trend: "+0.2",
            up: true,
          },
          {
            icon: "👥",
            value: "68%",
            label: "לקוחות חוזרים",
            trend: "-3%",
            up: false,
          },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statCardIcon}>{s.icon}</div>
            <div className={styles.statCardValue}>{s.value}</div>
            <div className={styles.statCardLabel}>{s.label}</div>
            <span
              className={`${styles.statCardTrend} ${s.up ? styles.trendUp : styles.trendDown}`}
            >
              {s.up ? "↑" : "↓"} {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className={styles.twoCol}>
        {/* Specialties */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle} style={{ marginBottom: 20 }}>
            📷 פירוט לפי התמחות
          </div>
          <div className={styles.specialtyList}>
            {SPECIALTIES_DATA.map((s, i) => (
              <div key={i} className={styles.specialtyRow}>
                <div className={styles.specialtyName}>{s.name}</div>
                <div className={styles.specialtyBar}>
                  <div
                    className={styles.specialtyBarFill}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <div className={styles.specialtyPct}>{s.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle} style={{ marginBottom: 20 }}>
            ⭐ פירוט דירוגים ({totalRatings})
          </div>
          <div className={styles.ratingBreakdown}>
            {RATING_DATA.map((r, i) => (
              <div key={i} className={styles.ratingRow}>
                <div className={styles.ratingStars}>{"⭐".repeat(r.stars)}</div>
                <div className={styles.ratingBar}>
                  <div
                    className={styles.ratingBarFill}
                    style={{ width: `${(r.count / totalRatings) * 100}%` }}
                  />
                </div>
                <div className={styles.ratingCount}>{r.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
