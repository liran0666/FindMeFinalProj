// Stats.jsx - סטטיסטיקות של הצלם

import { useState, useEffect } from "react";
import styles from "./Stats.module.css";

const MONTH_LABELS = ["ינו","פבר","מרץ","אפר","מאי","יוני","יולי","אוג","ספט","אוק","נוב","דצמ"];

const API = "http://localhost:5000/api/events";

const MAX_YEARS = 3;

function addYears(dateStr, years) {
  const d = new Date(dateStr + "T00:00:00");
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split("T")[0];
}

function generateMonthSlots(from, to) {
  const slots = [];
  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  start.setDate(1);
  end.setDate(1);
  let cur = new Date(start);
  while (cur <= end) {
    slots.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 });
    cur.setMonth(cur.getMonth() + 1);
  }
  return slots;
}

export function StatsPage({ user }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayStr = today.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(todayStr);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(`${API}/stats?from=${fromDate}&to=${toDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load stats:", err))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const slots = generateMonthSlots(fromDate, toDate);
  const multiYear = slots.length > 0 && slots[slots.length - 1].year !== slots[0].year;

  const monthlyData = slots.map((slot) => {
    const found = data?.monthly?.find(
      (m) => Number(m.year) === slot.year && Number(m.month) === slot.month
    );
    const label = multiYear
      ? `${MONTH_LABELS[slot.month - 1]} ${String(slot.year).slice(2)}`
      : MONTH_LABELS[slot.month - 1];
    return { label, events: found ? Number(found.events) : 0 };
  });

  const totalEvents = monthlyData.reduce((s, d) => s + d.events, 0);
  const maxEvents = Math.max(...monthlyData.map((d) => d.events), 1);

  const typeData = data?.types ?? [];
  const totalTyped = typeData.reduce((s, t) => s + Number(t.count), 0);

  const statusMap = Object.fromEntries(
    (data?.statusTotals ?? []).map((s) => [s.status, Number(s.count)])
  );
  const rating = data?.rating ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>📊 סטטיסטיקות</div>
      <div className={styles.pageSubtitle}>מבט על על הפעילות שלך</div>

      <div className={styles.dateRangeSelector}>
        <div className={styles.dateField}>
          <label className={styles.dateLabel}>מתאריך</label>
          <input
            type="date"
            className={styles.dateInput}
            value={fromDate}
            min={addYears(toDate, -MAX_YEARS)}
            max={toDate}
            onChange={(e) => {
              const next = e.target.value;
              setFromDate(next);
              if (toDate > addYears(next, MAX_YEARS)) {
                setToDate(addYears(next, MAX_YEARS));
              }
            }}
          />
        </div>
        <div className={styles.dateSep}>—</div>
        <div className={styles.dateField}>
          <label className={styles.dateLabel}>עד תאריך</label>
          <input
            type="date"
            className={styles.dateInput}
            value={toDate}
            min={fromDate}
            max={[todayStr, addYears(fromDate, MAX_YEARS)].sort().at(0)}
            onChange={(e) => {
              const next = e.target.value;
              setToDate(next);
              if (fromDate < addYears(next, -MAX_YEARS)) {
                setFromDate(addYears(next, -MAX_YEARS));
              }
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>טוען נתונים...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {[
              { icon: "📅", value: totalEvents, label: "אירועים בתקופה" },
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

          {/* עמודות חודש */}
          <div className={styles.chartCard} style={{ marginBottom: 24 }}>
            <div className={styles.chartTitle}>
              📅 אירועים לפי חודש — {fromDate} עד {toDate}
            </div>
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
                  <div className={styles.barLabel}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.twoCol}>
            {/* סוג אירוע */}
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

            {/* סיכום סטטוס */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle} style={{ marginBottom: 20 }}>
                📋 סיכום סטטוסים
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
