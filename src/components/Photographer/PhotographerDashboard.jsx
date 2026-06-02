// PhotographerDashboard.jsx- מסך בית של צלם

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PhotographerDashboard.module.css";

const HEBREW_MONTHS = [
  "ינו", "פבר", "מרץ", "אפר", "מאי", "יוני",
  "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ",
];

const EVENT_ICONS = {
  חתונה: "💍",
  "בר מצווה": "✡️",
  "יום הולדת": "🎂",
  אחר: "📸",
};

function getEventIcon(type) {
  const match = Object.entries(EVENT_ICONS).find(([k]) => type?.includes(k));
  return match ? match[1] : "📸";
}

function isPast(dateVal) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateVal);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function isToday(dateVal) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateVal);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

const API = "http://localhost:5000/api/events";

export function PhotographerDashboard({ user }) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);   // status = "ממתין"
  const [events, setEvents] = useState([]);        // status = "פעיל"
  const [loading, setLoading] = useState(true);
  const [selectedEvent,  setSelectedEvent]  = useState(null);
  const [detailsRequest, setDetailsRequest] = useState(null);

  const fetchEvents = () => {
    const token = localStorage.getItem("token");
    return fetch(`${API}/photographer`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.events) {
          setRequests(data.events.filter((e) => e.status === "pending"));
          setEvents(data.events.filter((e) => e.status === "active"));
        }
      })
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAction = async (id, action) => {
    // פעולה של דחייה או אישור
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });
      // עדכון של מצב בקשה
      const req = requests.find((r) => r.id === id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (action === "active" && req) {
        setEvents((prev) => [...prev, { ...req, status: "active" }]);
      }
    } catch (err) {
      console.error("Failed to update event status:", err);
    }
  };

  // חלוקת אירועים לפי מצב
  const pastEvents     = events.filter((e) => isPast(e.date));
  const todayEvents    = events.filter((e) => isToday(e.date));
  const upcomingEvents = events.filter((e) => !isPast(e.date) && !isToday(e.date));

  const renderEventRow = (ev) => {
    const d = new Date(ev.date);
    const day   = String(d.getDate()).padStart(2, "0");
    const month = HEBREW_MONTHS[d.getMonth()];
    const past  = isPast(ev.date);
    const today = isToday(ev.date);

    return (
      <div key={ev.id} className={styles.eventRow}>
        <div className={styles.eventDate}>
          <div className={styles.eventDateDay}>{day}</div>
          <div className={styles.eventDateMonth}>{month}</div>
        </div>
        <div className={styles.eventInfo}>
          <div className={styles.eventTitle}>
            {getEventIcon(ev.name)} {ev.name}
          </div>
          <div className={styles.eventMeta}>
            <span>📍 {ev.place}</span>
          </div>
        </div>
        <span
          className={`${styles.statusBadge} ${
            past ? styles.statusAccepted : styles.statusPending
          }`}
        >
          {past ? "הושלם" : today ? "היום" : "קרוב"}
        </span>
        <div className={styles.eventActions}>
          <button className={styles.viewBtn} onClick={() => setSelectedEvent(ev)}>פרטים</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        שלום, {user?.username || user?.userName || "צלם"} 👋
      </div>
      <div className={styles.pageSubtitle}>הנה מה שקורה עם העסק שלך היום</div>

      
      <div className={styles.summaryRow}>
        {[
          { icon: "📩", value: requests.length,      label: "בקשות ממתינות",  to: "/photographer/requests" },
          { icon: "📅", value: upcomingEvents.length, label: "אירועים קרובים",  to: "/photographer/events" },
          { icon: "✅", value: pastEvents.length,     label: "אירועים שהושלמו", to: "/photographer/events" },
          { icon: "📆", value: todayEvents.length,    label: "אירועים היום",    to: "/photographer/events" },
        ].map((s, i) => (
          <div key={i} className={styles.summaryCard} onClick={() => navigate(s.to)} style={{ cursor: "pointer" }}>
            <div className={styles.summaryCardIcon}>{s.icon}</div>
            <div className={styles.summaryCardValue}>{s.value}</div>
            <div className={styles.summaryCardLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            📩 בקשות חדשות
            {requests.length > 0 && (
              <span className={styles.sectionCount}>{requests.length}</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>טוען...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>אין בקשות חדשות</div>
          </div>
        ) : (
          <div className={styles.proposalsList}>
            {requests.map((r) => (
              <RequestCard key={r.id} request={r} onAction={handleAction} onDetails={() => setDetailsRequest(r)} />
            ))}
          </div>
        )}
      </div>

      {/* אירועים פעילים */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>📅 אירועים</div>
          <button className={styles.seeAllBtn} onClick={() => navigate("/photographer/events")}>כל האירועים ←</button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>טוען אירועים...</div>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>אין אירועים עדיין</div>
          </div>
        ) : (
          <>
            {todayEvents.length > 0 && (
              <>
                <div className={styles.eventGroupLabel}>היום</div>
                <div className={styles.eventsList}>{todayEvents.map(renderEventRow)}</div>
              </>
            )}
            {upcomingEvents.length > 0 && (
              <>
                <div className={styles.eventGroupLabel}>עתידיים</div>
                <div className={styles.eventsList}>{upcomingEvents.map(renderEventRow)}</div>
              </>
            )}
            {pastEvents.length > 0 && (
              <>
                <div className={styles.eventGroupLabel}>הושלמו</div>
                <div className={styles.eventsList}>{pastEvents.map(renderEventRow)}</div>
              </>
            )}
          </>
        )}
      </div>
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      {detailsRequest && (
        <RequestDetailsModal
          event={detailsRequest}
          onClose={() => setDetailsRequest(null)}
          onAction={async (id, action) => { await handleAction(id, action); setDetailsRequest(null); }}
        />
      )}
    </div>
  );
}
//פרטים של אירוע
function EventDetailsModal({ event, onClose }) {
  const d = new Date(event.date);
  const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalIcon}>{getEventIcon(event.name)}</div>
        <h2 className={styles.modalTitle}>{event.name}</h2>
        <div className={styles.modalDetails}>
          <div className={styles.modalDetailRow}>
            <span className={styles.modalDetailLabel}>📅 תאריך</span>
            <span className={styles.modalDetailValue}>{dateStr}</span>
          </div>
          <div className={styles.modalDetailRow}>
            <span className={styles.modalDetailLabel}>📍 מיקום</span>
            <span className={styles.modalDetailValue}>{event.place}</span>
          </div>
          <div className={styles.modalDetailRow}>
            <span className={styles.modalDetailLabel}>👤 לקוח</span>
            <span className={styles.modalDetailValue}>{event.customerName || "—"}</span>
          </div>
          {event.notes && (
            <div className={styles.modalDetailRow} style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <span className={styles.modalDetailLabel}>📝 הערות</span>
              <span className={styles.notesText}>{event.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// בקשה של אירוע בקטן
function RequestCard({ request: r, onAction, onDetails }) {
  const [busy, setBusy] = useState(false);
  const d = new Date(r.date);
  const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;

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
        <button className={styles.viewBtn}    onClick={onDetails}           disabled={busy}>פרטים</button>
        <button className={styles.acceptBtn}  onClick={() => act("active")} disabled={busy}>✓ קבל</button>
        <button className={styles.declineBtn} onClick={() => act("declined")} disabled={busy}>✕ דחה</button>
      </div>
    </div>
  );
}
//בקשה של אירוע מלאה
function RequestDetailsModal({ event: ev, onClose, onAction }) {
  const [busy, setBusy] = useState(false);
  const d = new Date(ev.date);
  const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;

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
            { label: "📅 תאריך", value: dateStr },
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
          <button className={styles.acceptBtn}  onClick={() => act("active")}    disabled={busy}>✓ קבל אירוע</button>
          <button className={styles.declineBtn} onClick={() => act("declined")} disabled={busy}>✕ דחה אירוע</button>
        </div>
      </div>
    </div>
  );
}

export default PhotographerDashboard;
