// PhotographerDashboard.jsx - Main dashboard for photographers

import { useState } from "react";
import styles from "./PhotographerDashboard.module.css";

const INITIAL_PROPOSALS = [
  {
    id: 1,
    customerName: "דנה כהן",
    eventType: "חתונה",
    date: "13/06/26",
    location: "אולם פסגות, תל אביב",
    status: "pending",
    isNew: true,
  },
  {
    id: 2,
    customerName: "אבי לוי",
    eventType: "בר מצווה",
    date: "29/03/27",
    location: "מלון ים המלח",
    status: "pending",
    isNew: false,
  },
  {
    id: 3,
    customerName: "רחל שמש",
    eventType: "יום הולדת 50",
    date: "22/04/26",
    location: "גן אירועים, רמת גן",
    status: "pending",
    isNew: false,
  },
];

const PAST_EVENTS = [
  {
    id: 1,
    customerName: "מירב כץ",
    eventType: "חתונה של צירו",
    date: "13",
    month: "יוני",
    year: "26",
    location: "קיסריה",
    photos: 342,
    status: "completed",
  },
  {
    id: 2,
    customerName: "שמחה לוינגר",
    eventType: "הכרמינה של בנחיו",
    date: "29",
    month: "מרץ",
    year: "27",
    location: "ירושלים",
    photos: 187,
    status: "upcoming",
  },
  {
    id: 3,
    customerName: "ניקולס פרנק",
    eventType: "הגירה של מיקח",
    date: "05",
    month: "דצמ",
    year: "25",
    location: "חיפה",
    photos: 256,
    status: "completed",
  },
];

const EVENT_ICONS = {
  חתונה: "💍",
  "בר מצווה": "✡️",
  "יום הולדת": "🎂",
  "בר מצווה": "🕍",
  אחר: "📸",
  הכרמינה: "🎼",
  הגירה: "✈️",
};

function getEventIcon(type) {
  const match = Object.entries(EVENT_ICONS).find(([k]) => type?.includes(k));
  return match ? match[1] : "📸";
}

export function PhotographerDashboard({ user }) {
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);

  const handleProposal = (id, action) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: action, isNew: false } : p,
      ),
    );
  };

  const pendingCount = proposals.filter((p) => p.status === "pending").length;

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        שלום, {user?.fullName?.split(" ")[0] || "צלם"} 👋
      </div>
      <div className={styles.pageSubtitle}>הנה מה שקורה עם העסק שלך היום</div>

      {/* Summary row */}
      <div className={styles.summaryRow}>
        {[
          {
            icon: "📩",
            value: pendingCount,
            label: "הצעות ממתינות",
            change: "+2 השבוע",
          },
          {
            icon: "📅",
            value: 3,
            label: "אירועים קרובים",
            change: "הבא ב-5 ימים",
          },
          { icon: "⭐", value: "4.9", label: "דירוג ממוצע", change: "↑ משופר" },
          {
            icon: "💰",
            value: "₪8,400",
            label: "הכנסה החודש",
            change: "+12% מחודש שעבר",
          },
        ].map((s, i) => (
          <div key={i} className={styles.summaryCard}>
            <div className={styles.summaryCardIcon}>{s.icon}</div>
            <div className={styles.summaryCardValue}>{s.value}</div>
            <div className={styles.summaryCardLabel}>{s.label}</div>
            <div className={styles.summaryCardChange}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Proposals */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            📩 הצעות אירועים
            {pendingCount > 0 && (
              <span className={styles.sectionCount}>{pendingCount}</span>
            )}
          </div>
          <button className={styles.seeAllBtn}>ראה הכל</button>
        </div>

        {proposals.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>אין הצעות חדשות</div>
          </div>
        ) : (
          <div className={styles.proposalsList}>
            {proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} onAction={handleProposal} />
            ))}
          </div>
        )}
      </div>

      {/* Events */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>📅 אירועים</div>
          <button className={styles.seeAllBtn}>ראה הכל</button>
        </div>

        <div className={styles.eventsList}>
          {PAST_EVENTS.map((ev) => (
            <div key={ev.id} className={styles.eventRow}>
              <div className={styles.eventDate}>
                <div className={styles.eventDateDay}>{ev.date}</div>
                <div className={styles.eventDateMonth}>{ev.month}</div>
              </div>
              <div className={styles.eventInfo}>
                <div className={styles.eventTitle}>
                  {getEventIcon(ev.eventType)} {ev.eventType}
                </div>
                <div className={styles.eventMeta}>
                  <span>👤 {ev.customerName}</span>
                  <span>📍 {ev.location}</span>
                  {ev.photos > 0 && <span>🖼️ {ev.photos} תמונות</span>}
                </div>
              </div>
              <span
                className={`${styles.statusBadge} ${ev.status === "completed" ? styles.statusAccepted : styles.statusPending}`}
              >
                {ev.status === "completed" ? "הושלם" : "קרוב"}
              </span>
              <div className={styles.eventActions}>
                <button className={styles.viewBtn}>פרטים</button>
                {ev.status === "upcoming" && (
                  <button className={styles.viewBtn}>העלה תמונות</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProposalCard({ proposal: p, onAction }) {
  return (
    <div className={`${styles.proposalCard} ${p.isNew ? styles.new : ""}`}>
      <div className={styles.proposalBadge}>{getEventIcon(p.eventType)}</div>
      <div className={styles.proposalInfo}>
        <div className={styles.proposalTitle}>
          {p.eventType}
          {p.isNew && (
            <span className={styles.newBadge} style={{ marginRight: 10 }}>
              חדש
            </span>
          )}
        </div>
        <div className={styles.proposalMeta}>
          <span className={styles.proposalMetaItem}>👤 {p.customerName}</span>
          <span className={styles.proposalMetaItem}>📅 {p.date}</span>
          <span className={styles.proposalMetaItem}>📍 {p.location}</span>
        </div>
      </div>

      {p.status === "pending" ? (
        <div className={styles.proposalActions}>
          <button
            className={styles.acceptBtn}
            onClick={() => onAction(p.id, "accepted")}
          >
            ✓ קבל
          </button>
          <button
            className={styles.declineBtn}
            onClick={() => onAction(p.id, "declined")}
          >
            ✕ דחה
          </button>
        </div>
      ) : (
        <span
          className={`${styles.statusBadge} ${p.status === "accepted" ? styles.statusAccepted : styles.statusDeclined}`}
        >
          {p.status === "accepted" ? "✓ אושר" : "✕ נדחה"}
        </span>
      )}
    </div>
  );
}

export default PhotographerDashboard;
