// PhotographerEvents.jsx — full page for all photographer events

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PhotographerDashboard.module.css";

const API = "http://localhost:5000/api/events";

const HEBREW_MONTHS = [
  "ינו", "פבר", "מרץ", "אפר", "מאי", "יוני",
  "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ",
];

const EVENT_ICONS = {
  חתונה: "💍", "בר מצווה": "✡️", "יום הולדת": "🎂", אחר: "📸",
};
function getEventIcon(type) {
  const match = Object.entries(EVENT_ICONS).find(([k]) => type?.includes(k));
  return match ? match[1] : "📸";
}
function isPast(dateVal) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateVal); d.setHours(0, 0, 0, 0);
  return d < today;
}
function isToday(dateVal) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateVal); d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

export function PhotographerEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/photographer`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.events)
          setEvents(data.events.filter((e) => e.status === "active"));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
          <div className={styles.eventTitle}>{getEventIcon(ev.name)} {ev.name}</div>
          <div className={styles.eventMeta}><span>📍 {ev.place}</span></div>
        </div>
        <span className={`${styles.statusBadge} ${past ? styles.statusAccepted : styles.statusPending}`}>
          {past ? "הושלם" : today ? "היום" : "קרוב"}
        </span>
        <div className={styles.eventActions}>
          <button className={styles.viewBtn} onClick={() => setSelectedEvent(ev)}>פרטים</button>
          <button className={styles.galleryBtn} onClick={() => navigate(`/photographer/gallery/${ev.id}`)}>🖼️ גלריה</button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>📅 האירועים שלי</div>
      <div className={styles.pageSubtitle}>
        {loading ? "" : `${events.length} אירועים פעילים`}
      </div>

      <div className={styles.section}>
        {loading ? (
          <div className={styles.emptyState}><div className={styles.emptyTitle}>טוען...</div></div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>אין אירועים עדיין</div>
            <div className={styles.emptySubtitle}>אירועים שאישרת יופיעו כאן</div>
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
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onGallery={(id) => navigate(`/photographer/gallery/${id}`)}
        />
      )}
    </div>
  );
}

function EventDetailsModal({ event, onClose, onGallery }) {
  const d = new Date(event.date);
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalIcon}>{["💍","🎂","📸"][Math.floor(Math.random()*3)]}</div>
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
            <span className={styles.modalDetailLabel}>סטטוס</span>
            <span className={styles.modalDetailValue}>✅ פעיל</span>
          </div>
        </div>
        <button
          className={styles.galleryModalBtn}
          onClick={() => { onClose(); onGallery(event.id); }}
        >
          🖼️ פתח גלריה
        </button>
      </div>
    </div>
  );
}

export default PhotographerEvents;
