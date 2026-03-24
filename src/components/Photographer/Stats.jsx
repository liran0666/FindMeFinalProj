// Stats.jsx - Photographer statistics page

import { useState } from "react";
import styles from "./Stats.module.css";

const MONTHLY_DATA = [
  { month: "ינו", revenue: 3200, events: 4 },
  { month: "פבר", revenue: 4100, events: 5 },
  { month: "מרץ", revenue: 3800, events: 5 },
  { month: "אפר", revenue: 5200, events: 7 },
  { month: "מאי", revenue: 6100, events: 8 },
  { month: "יוני", revenue: 5800, events: 7 },
  { month: "יולי", revenue: 4900, events: 6 },
  { month: "אוג", revenue: 5500, events: 7 },
  { month: "ספט", revenue: 6800, events: 9 },
  { month: "אוק", revenue: 7200, events: 10 },
  { month: "נוב", revenue: 6400, events: 8 },
  { month: "דצמ", revenue: 8400, events: 11 },
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

function RevenueChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.revenue));
  const W = 600,
    H = 160,
    PAD = { top: 10, right: 10, bottom: 30, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const stepX = chartW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + i * stepX,
    y: PAD.top + chartH - (d.revenue / maxVal) * chartH,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD.top + chartH * (1 - t),
    label: `₪${Math.round((maxVal * t) / 1000)}K`,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart}>
      <defs>
        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue-400)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--blue-400)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map((g, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            y1={g.y}
            x2={W - PAD.right}
            y2={g.y}
            className={styles.chartGrid}
          />
          <text
            x={PAD.left - 6}
            y={g.y + 4}
            textAnchor="end"
            className={styles.chartAxis}
          >
            {g.label}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={PAD.left + i * stepX}
          y={H - 6}
          textAnchor="middle"
          className={styles.chartAxis}
        >
          {i % 2 === 0 ? d.month : ""}
        </text>
      ))}

      {/* Area */}
      <path d={areaPath} className={styles.chartArea} />

      {/* Line */}
      <path d={linePath} className={styles.chartLine} />

      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" className={styles.chartDot} />
      ))}
    </svg>
  );
}

export function StatsPage({ user }) {
  const [period, setPeriod] = useState("2026");
  const totalRevenue = MONTHLY_DATA.reduce((s, d) => s + d.revenue, 0);
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
            icon: "💰",
            value: `₪${(totalRevenue / 1000).toFixed(0)}K`,
            label: "סך הכנסות",
            trend: "+18%",
            up: true,
          },
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

      {/* Revenue chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>הכנסות חודשיות</div>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div
                className={styles.legendDot}
                style={{ background: "var(--blue-400)" }}
              />
              הכנסות
            </div>
          </div>
        </div>
        <RevenueChart data={MONTHLY_DATA} />
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
