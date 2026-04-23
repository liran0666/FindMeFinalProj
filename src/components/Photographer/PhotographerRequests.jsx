// PhotographerRequests.jsx — full page for pending requests

import { useState, useEffect } from "react";
import styles from "./PhotographerDashboard.module.css";

const API = "http://localhost:5000/api/events";

const EVENT_ICONS = {
  חתונה: "💍", "בר מצווה": "✡️", "יום הולדת": "🎂", אחר: "📸",
};
function getEventIcon(type) {
  const match = Object.entries(EVENT_ICONS).find(([k]) => type?.includes(k));
  return match ? match[1] : "📸";
}

export function PhotographerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    fetch(`${API}/photographer`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.events)
          setRequests(data.events.filter((e) => e.status === "pending"));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: action }),
      });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>📩 בקשות ממתינות</div>
      <div className={styles.pageSubtitle}>
        {loading ? "" : `${requests.length} בקשות מחכות לאישורך`}
      </div>

      <div className={styles.section}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>טוען...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>אין בקשות ממתינות</div>
            <div className={styles.emptySubtitle}>כשלקוחות ישלחו בקשות הן יופיעו כאן</div>
          </div>
        ) : (
          <div className={styles.proposalsList}>
            {requests.map((r) => (
              <RequestCard key={r.id} request={r} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request: r, onAction }) {
  const [busy, setBusy] = useState(false);
  const d = new Date(r.date);
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const act = async (status) => {
    setBusy(true);
    await onAction(r.id, status);
    setBusy(false);
  };

  return (
    <div className={styles.proposalCard}>
      <div className={styles.proposalBadge}>{getEventIcon(r.name)}</div>
      <div className={styles.proposalInfo}>
        <div className={styles.proposalTitle}>{r.name}</div>
        <div className={styles.proposalMeta}>
          <span className={styles.proposalMetaItem}>📅 {dateStr}</span>
          <span className={styles.proposalMetaItem}>📍 {r.place}</span>
        </div>
      </div>
      <div className={styles.proposalActions}>
        <button className={styles.acceptBtn} onClick={() => act("active")} disabled={busy}>✓ קבל</button>
        <button className={styles.declineBtn} onClick={() => act("declined")} disabled={busy}>✕ דחה</button>
      </div>
    </div>
  );
}

export default PhotographerRequests;
