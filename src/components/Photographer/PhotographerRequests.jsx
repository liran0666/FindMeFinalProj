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
  const [detailsEvent, setDetailsEvent] = useState(null);

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
      setDetailsEvent(null);
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
              <RequestCard
                key={r.id}
                request={r}
                onAction={handleAction}
                onDetails={() => setDetailsEvent(r)}
              />
            ))}
          </div>
        )}
      </div>

      {detailsEvent && (
        <RequestDetailsModal
          event={detailsEvent}
          onClose={() => setDetailsEvent(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}

function RequestCard({ request: r, onAction, onDetails }) {
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
          {r.customerName && <span className={styles.proposalMetaItem}>👤 {r.customerName}</span>}
        </div>
      </div>
      <div className={styles.proposalActions}>
        <button className={styles.viewBtn} onClick={onDetails} disabled={busy}>פרטים</button>
        <button className={styles.acceptBtn} onClick={() => act("active")} disabled={busy}>✓ קבל</button>
        <button className={styles.declineBtn} onClick={() => act("declined")} disabled={busy}>✕ דחה</button>
      </div>
    </div>
  );
}

function RequestDetailsModal({ event: ev, onClose, onAction }) {
  const [busy, setBusy] = useState(false);
  const d = new Date(ev.date);
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const act = async (status) => {
    setBusy(true);
    await onAction(ev.id, status);
    setBusy(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>

        <div className={styles.modalIcon}>{getEventIcon(ev.name)}</div>
        <h2 className={styles.modalTitle}>{ev.name}</h2>

        <div className={styles.modalDetails}>
          {[
            { label: "📅 תאריך",  value: dateStr },
            { label: "📍 מיקום",  value: ev.place },
            { label: "👤 לקוח",   value: ev.customerName || "—" },
          ].map((row, i) => (
            <div key={i} className={styles.modalDetailRow}>
              <span className={styles.modalDetailLabel}>{row.label}</span>
              <span className={styles.modalDetailValue}>{row.value}</span>
            </div>
          ))}

          {ev.notes && (
            <div className={styles.modalDetailRow} style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <span className={styles.modalDetailLabel}>📝 הערות</span>
              <span className={styles.notesText}>{ev.notes}</span>
            </div>
          )}
        </div>

        <div className={styles.modalActionRow}>
          <button className={styles.acceptBtn} onClick={() => act("active")} disabled={busy}>
            ✓ קבל אירוע
          </button>
          <button className={styles.declineBtn} onClick={() => act("declined")} disabled={busy}>
            ✕ דחה אירוע
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotographerRequests;
