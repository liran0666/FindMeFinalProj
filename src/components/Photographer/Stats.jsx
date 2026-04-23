// Stats.jsx - Photographer statistics page

import { useState, useEffect } from "react";
import styles from "./Stats.module.css";

const MONTH_LABELS = ["ינו","פבר","מרץ","אפר","מאי","יוני","יולי","אוג","ספט","אוק","נוב","דצמ"];

const API = "http://localhost:5000/api/events";

export function StatsPage({ user }) {
  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = useState(String(currentYear));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(`${API}/stats?year=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load stats:", err))
      .finally(() => setLoading(false));
  }, [period]);

  // Build full 12-month array (months with no events → 0)
  const monthlyData = MONTH_LABELS.map((label, i) => {
    const found = data?.monthly?.find((m) => m.month === i + 1);
    return { month: label, events: found ? Number(found.events) : 0 };
  });

  const totalEvents = monthlyData.reduce((s, d) => s + d.events, 0);
  const maxEvents = Math.max(...monthlyData.map((d) => d.events), 1);

  const typeData = data?.types ?? [];
  const totalTyped = typeData.reduce((s, t) => s + Number(t.count), 0);

  const statusMap = Object.fromEntries(
    (data?.statusTotals ?? []).map((s) => [s.status, Number(s.count)])
  );
  const rating = data?.rating ?? 0;

  const years = [];
  for (let y = currentYear; y >= currentYear - 2; y--) years.push(String(y));

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>📊 סטטיסטיקות</div>
      <div className={styles.pageSubtitle}>מבט על על הפעילות שלך</div>

      <div className={styles.periodSelector}>
        {years.map((y) => (
          <button
            key={y}
            className={`${styles.periodBtn} ${period === y ? styles.active : ""}`}
            onClick={() => setPeriod(y)}
          >
            {y}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingState}>טוען נתונים...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {[
              { icon: "📅", value: totalEvents, label: "אירועים השנה" },
              { icon: "⭐", value: rating > 0 ? rating.toFixed(1) : "—", label: "דירוג ממוצע" },
              { icon: "⏳", value: statusMap["pending"] ?? 0, label: "בקשות ממתינות" },
            ].map((s, i) => (
              <div key={i} className={styles.statCard}>
                <div className={styles.statCardIcon}>{s.icon}</div>
                <div className={styles.statCardValue}>{s.value}</div>
                <div className={styles.statCardLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Monthly bar chart */}
          <div className={styles.chartCard} style={{ marginBottom: 24 }}>
            <div className={styles.chartTitle}>📅 אירועים לפי חודש — {period}</div>
            <div className={styles.barChart}>
              {monthlyData.map((d, i) => (
                <div key={i} className={styles.barCol}>
                  <div className={styles.barWrap}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(d.events / maxEvents) * 100}%` }}
                    />
                  </div>
                  <div className={styles.barCount}>{d.events > 0 ? d.events : ""}</div>
                  <div className={styles.barLabel}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.twoCol}>
            {/* Event types */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle} style={{ marginBottom: 20 }}>
                📷 פירוט לפי סוג אירוע
              </div>
              {typeData.length === 0 ? (
                <div className={styles.emptyNote}>אין נתונים לתקופה זו</div>
              ) : (
                <div className={styles.specialtyList}>
                  {typeData.map((t, i) => {
                    const pct = totalTyped > 0 ? Math.round((Number(t.count) / totalTyped) * 100) : 0;
                    return (
                      <div key={i} className={styles.specialtyRow}>
                        <div className={styles.specialtyName}>{t.name}</div>
                        <div className={styles.specialtyBar}>
                          <div className={styles.specialtyBarFill} style={{ width: `${pct}%` }} />
                        </div>
                        <div className={styles.specialtyPct}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status totals */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle} style={{ marginBottom: 20 }}>
                📋 סיכום סטטוסים (כולל)
              </div>
              <div className={styles.statusSummary}>
                {[
                  { label: "✅ פעילים", key: "active", color: "var(--accent-mint)" },
                  { label: "⏳ ממתינים", key: "pending", color: "var(--accent-gold)" },
                  { label: "❌ נדחו", key: "declined", color: "var(--accent-coral)" },
                ].map((s) => (
                  <div key={s.key} className={styles.statusRow}>
                    <span className={styles.statusLabel}>{s.label}</span>
                    <span className={styles.statusValue} style={{ color: s.color }}>
                      {statusMap[s.key] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatsPage;
