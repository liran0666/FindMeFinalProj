// PhotographerEvents.jsx — אירועים של הצלם

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PhotographerDashboard.module.css";

const API = "http://localhost:5000/api/events";

const HEBREW_MONTHS = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יוני",
  "יולי",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

const EVENT_TYPES = [
  "חתונה",
  "בר/בת מצווה",
  "יום הולדת",
  "סיום לימודים",
  "אירוע עסקי",
  "אחר",
];

const EVENT_ICONS_MAP = {
  חתונה: "💍",
  "בר מצווה": "✡️",
  "יום הולדת": "🎂",
  אחר: "📸",
};
function getEventIcon(type) {
  const match = Object.entries(EVENT_ICONS_MAP).find(([k]) =>
    type?.includes(k),
  );
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
function toInputDate(dateVal) {
  const d = new Date(dateVal);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PhotographerEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/photographer`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.events)
          setEvents(data.events.filter((e) => e.status === "active"));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)),
    );
    setSelectedEvent((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleRemove = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
  };

  const pastEvents = events.filter((e) => isPast(e.date));
  const todayEvents = events.filter((e) => isToday(e.date));
  const upcomingEvents = events.filter(
    (e) => !isPast(e.date) && !isToday(e.date),
  );

  const renderEventRow = (ev) => {
    const d = new Date(ev.date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = HEBREW_MONTHS[d.getMonth()];
    const past = isPast(ev.date);
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
          className={`${styles.statusBadge} ${past ? styles.statusAccepted : styles.statusPending}`}
        >
          {past ? "הושלם" : today ? "היום" : "קרוב"}
        </span>
        <div className={styles.eventActions}>
          <button
            className={styles.viewBtn}
            onClick={() => setSelectedEvent(ev)}
          >
            פרטים
          </button>
          <button
            className={styles.galleryBtn}
            onClick={() => navigate(`/photographer/gallery/${ev.id}`)}
          >
            🖼️ גלריה
          </button>
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
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>טוען...</div>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>אין אירועים עדיין</div>
            <div className={styles.emptySubtitle}>
              אירועים שאישרת יופיעו כאן
            </div>
          </div>
        ) : (
          <>
            {todayEvents.length > 0 && (
              <>
                <div className={styles.eventGroupLabel}>היום</div>
                <div className={styles.eventsList}>
                  {todayEvents.map(renderEventRow)}
                </div>
              </>
            )}
            {upcomingEvents.length > 0 && (
              <>
                <div className={styles.eventGroupLabel}>עתידיים</div>
                <div className={styles.eventsList}>
                  {upcomingEvents.map(renderEventRow)}
                </div>
              </>
            )}
            {pastEvents.length > 0 && (
              <>
                <div className={styles.eventGroupLabel}>הושלמו</div>
                <div className={styles.eventsList}>
                  {pastEvents.map(renderEventRow)}
                </div>
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
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}
//פרטים של אירוע
function EventDetailsModal({ event, onClose, onGallery, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: event.name || "",
    date: toInputDate(event.date),
    place: event.place || "",
    phone: event.phone || "",
    notes: event.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const icon =
    Object.entries(EVENT_ICONS_MAP).find(([k]) =>
      event.name?.includes(k),
    )?.[1] ?? "📸";
  const d = new Date(event.date);
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  //שמירה של שינויים
  const handleSave = async () => {
    if (!form.name || !form.date || !form.place) {
      setError("נא למלא סוג אירוע, תאריך ומיקום.");
      return;
    }
    if (new Date(form.date) <= new Date()) {
      setError("תאריך חייב להיות מאוחר מהיום");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/${event.id}/details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה בשמירה.");
      onUpdate({ id: event.id, ...form });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      alert("הפרטים שונו בהצלחה");
    }
  };
  const cancelEvent = async () => {
    let answer=confirm("האם יידעת את הלקוח על ביטול אירוע זה?");
    if(!answer)
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/${event.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה בביטול.");
      alert("האירוע בוטל בהצלחה");
      onRemove(event.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          ✕
        </button>
        <div className={styles.modalIcon}>{icon}</div>
        <h2 className={styles.modalTitle}>
          {editing ? "עריכת אירוע" : event.name}
        </h2>

        {editing ? (
          /* ── עריכה של פרטי אירוע ── */
          <div className={styles.editForm}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>סוג אירוע</label>
              <select
                className={styles.editInput}
                value={form.name}
                onChange={set("name")}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>תאריך</label>
              <input
                type="date"
                className={styles.editInput}
                value={form.date}
                onChange={set("date")}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>מיקום</label>
              <input
                type="text"
                className={styles.editInput}
                placeholder="מיקום האירוע"
                value={form.place}
                onChange={set("place")}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>טלפון</label>
              <input
                type="text"
                className={styles.editInput}
                placeholder="מספר הטלפון של הלקוח"
                value={form.phone}
                onChange={set("phone")}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>הערות</label>
              <textarea
                className={styles.editTextarea}
                placeholder="הערות..."
                value={form.notes}
                onChange={set("notes")}
                rows={3}
              />
            </div>
            {error && <div className={styles.editError}>{error}</div>}
            <div className={styles.modalActionRow}>
              <button
                className={styles.viewBtn}
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
                disabled={saving}
              >
                ביטול
              </button>
              <button
                className={styles.galleryModalBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "שומר..." : "💾 שמור"}
              </button>
              <button
                className={styles.galleryModalBtn}
                onClick={cancelEvent}
                disabled={saving}
              >
                {saving ? "מבטל..." : "X בטל אירוע"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.modalDetails}>
              {[
                { label: "📅 תאריך", value: dateStr },
                { label: "📍 מיקום", value: event.place },
                { label: "👤 לקוח", value: event.customerName || "—" },
                { label: "📞 טלפון", value: event.phone },
              ].map((row, i) => (
                <div key={i} className={styles.modalDetailRow}>
                  <span className={styles.modalDetailLabel}>{row.label}</span>
                  <span className={styles.modalDetailValue}>{row.value}</span>
                </div>
              ))}
              {event.notes && (
                <div
                  className={styles.modalDetailRow}
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <span className={styles.modalDetailLabel}>📝 הערות</span>
                  <span className={styles.notesText}>{event.notes}</span>
                </div>
              )}
            </div>
            <div className={styles.modalActionRow}>
              {!isPast(event.date) && (
                <button
                  className={styles.viewBtn}
                  onClick={() => setEditing(true)}
                >
                  ✏️ עריכה
                </button>
              )}
              <button
                className={styles.galleryModalBtn}
                onClick={() => {
                  onClose();
                  onGallery(event.id);
                }}
              >
                🖼️ פתח גלריה
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PhotographerEvents;
