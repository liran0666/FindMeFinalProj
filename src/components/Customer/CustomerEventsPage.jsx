import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerEventsPage.module.css";

const API = "http://localhost:5000/api/events";

const EVENT_ICONS = {
  חתונה: "💍",
  "בר מצווה": "✡️",
  "יום הולדת": "🎂",
  סיום: "🎓",
  עסקי: "💼",
  אחר: "📸",
};
function getIcon(name) {
  const match = Object.entries(EVENT_ICONS).find(([k]) => name?.includes(k));
  return match ? match[1] : "📸";
}

const HEBREW_MONTHS = ["ינו","פבר","מרץ","אפר","מאי","יוני","יולי","אוג","ספט","אוק","נוב","דצמ"];

function isPast(dateVal) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateVal);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

function formatDate(dateVal) {
  const d = new Date(dateVal);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function getStatusInfo(ev) {
  const past = isPast(ev.date);
  if (ev.status === "pending")  return { label: "ממתין לאישור", cls: "pending", step: 1 };
  if (ev.status === "declined") return { label: "נדחה",         cls: "declined", step: 0 };
  if (ev.status === "active" && !past) return { label: "אושר — קרוב", cls: "active", step: 2 };
  if (ev.status === "active" && past)  return { label: "הושלם",        cls: "done",   step: 3 };
  return { label: ev.status, cls: "pending", step: 1 };
}

const FILTERS = [
  { key: "all",      label: "הכל" },
  { key: "pending",  label: "ממתין" },
  { key: "active",   label: "קרוב" },
  { key: "done",     label: "הושלם" },
  { key: "declined", label: "נדחה" },
];

export default function CustomerEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [ratingEvent, setRatingEvent]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/customer`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { if (data.events) setEvents(data.events); })
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRated = (eventId, rating) => {
    setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, customer_rating: rating } : e));
    setRatingEvent(null);
    // refresh details if open
    setDetailsEvent((prev) => prev?.id === eventId ? { ...prev, customer_rating: rating } : prev);
  };

  // counts for summary
  const counts = {
    total:    events.length,
    pending:  events.filter((e) => e.status === "pending").length,
    active:   events.filter((e) => e.status === "active" && !isPast(e.date)).length,
    done:     events.filter((e) => e.status === "active" && isPast(e.date)).length,
    declined: events.filter((e) => e.status === "declined").length,
  };

  const filtered = events.filter((e) => {
    if (filter === "all")      return true;
    if (filter === "pending")  return e.status === "pending";
    if (filter === "active")   return e.status === "active" && !isPast(e.date);
    if (filter === "done")     return e.status === "active" && isPast(e.date);
    if (filter === "declined") return e.status === "declined";
    return true;
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.pageTitle}>📅 האירועים שלי</div>
          <div className={styles.pageSubtitle}>מעקב אחר כל האירועים שיצרת</div>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && events.length > 0 && (
        <div className={styles.summaryRow}>
          {[
            { icon: "📋", value: counts.total,    label: "סה״כ",       color: "blue" },
            { icon: "⏳", value: counts.pending,  label: "ממתינים",    color: "gold" },
            { icon: "✅", value: counts.active,   label: "מאושרים",    color: "mint" },
            { icon: "🎉", value: counts.done,     label: "הושלמו",     color: "cyan" },
          ].map((s, i) => (
            <div key={i} className={`${styles.summaryCard} ${styles[`color_${s.color}`]}`}>
              <div className={styles.summaryIcon}>{s.icon}</div>
              <div className={styles.summaryValue}>{s.value}</div>
              <div className={styles.summaryLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && events.length > 0 && (
        <div className={styles.filterRow}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key !== "all" && counts[f.key] > 0 && (
                <span className={styles.filterCount}>{counts[f.key]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptySpinner} />
          <div className={styles.emptyText}>טוען אירועים...</div>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyBig}>📭</div>
          <div className={styles.emptyTitle}>אין אירועים עדיין</div>
          <div className={styles.emptyText}>עבור לחיפוש צלמים ושלח הצעת אירוע</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyBig}>🔍</div>
          <div className={styles.emptyTitle}>אין אירועים בקטגוריה זו</div>
        </div>
      ) : (
        <div className={styles.eventsList}>
          {filtered.map((ev) => (
            <EventCard
              key={ev.id}
              ev={ev}
              onDetails={() => setDetailsEvent(ev)}
              onRate={() => setRatingEvent(ev)}
              onGallery={() => navigate(`/customer/gallery/${ev.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {detailsEvent && (
        <DetailsModal
          event={detailsEvent}
          onClose={() => setDetailsEvent(null)}
          onRate={(ev) => { setDetailsEvent(null); setRatingEvent(ev); }}
        />
      )}
      {ratingEvent && (
        <RatingModal
          event={ratingEvent}
          onClose={() => setRatingEvent(null)}
          onRated={handleRated}
        />
      )}
    </div>
  );
}

/* ── Event Card ─────────────────────────────────────────── */
function EventCard({ ev, onDetails, onRate, onGallery }) {
  const d = new Date(ev.date);
  const day   = String(d.getDate()).padStart(2, "0");
  const month = HEBREW_MONTHS[d.getMonth()];
  const { label, cls, step } = getStatusInfo(ev);
  const canRate = step === 3 && ev.customer_rating === null;

  return (
    <div className={`${styles.card} ${styles[`card_${cls}`]}`}>
      {/* Date block */}
      <div className={styles.cardDate}>
        <div className={styles.cardDateDay}>{day}</div>
        <div className={styles.cardDateMonth}>{month}</div>
      </div>

      {/* Main info */}
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <span className={styles.cardIcon}>{getIcon(ev.name)}</span>
          <span className={styles.cardTitle}>{ev.name}</span>
          <span className={`${styles.statusPill} ${styles[`pill_${cls}`]}`}>{label}</span>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}>📷 {ev.photographerName}</span>
          <span className={styles.cardMetaItem}>📍 {ev.place}</span>
        </div>
        {/* Mini status bar */}
        <div className={styles.miniTimeline}>
          {["נשלחה", "אושרה", "הסתיים"].map((s, i) => {
            const active = step > i || (step === i + 1);
            const current = step === i + 1;
            return (
              <div key={i} className={styles.miniStep}>
                <div className={`${styles.miniDot} ${active ? styles.miniDotOn : ""} ${current ? styles.miniDotCurrent : ""}`} />
                <div className={`${styles.miniLabel} ${active ? styles.miniLabelOn : ""}`}>{s}</div>
                {i < 2 && <div className={`${styles.miniLine} ${step > i + 1 ? styles.miniLineOn : ""}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <button className={styles.detailsBtn} onClick={onDetails}>פרטים</button>
        {step >= 2 && (
          <button className={styles.galleryBtn} onClick={onGallery}>🖼️ גלריה</button>
        )}
        {canRate && (
          <button className={styles.rateBtn} onClick={onRate}>⭐ דרג</button>
        )}
        {step === 3 && ev.customer_rating !== null && (
          <div className={styles.ratedStars}>{"⭐".repeat(ev.customer_rating)}</div>
        )}
      </div>
    </div>
  );
}

/* ── Details Modal ──────────────────────────────────────── */
function DetailsModal({ event: ev, onClose, onRate }) {
  const { label, cls, step } = getStatusInfo(ev);
  const canRate = step === 3 && ev.customer_rating === null;

  const STEPS = [
    { label: "בקשה נשלחה",  desc: "הצלם קיבל את הבקשה שלך" },
    { label: "אושר ע\"י הצלם", desc: "הצלם אישר את האירוע" },
    { label: "האירוע הסתיים", desc: "האירוע עבר בהצלחה" },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>

        {/* Hero */}
        <div className={styles.detailsHero}>
          <div className={styles.detailsHeroIcon}>{getIcon(ev.name)}</div>
          <div className={styles.detailsHeroTitle}>{ev.name}</div>
          <span className={`${styles.statusPill} ${styles[`pill_${cls}`]}`}>{label}</span>
        </div>

        {/* Info grid */}
        <div className={styles.detailsGrid}>
          {[
            { icon: "📅", label: "תאריך", value: formatDate(ev.date) },
            { icon: "📍", label: "מיקום",  value: ev.place },
            { icon: "📷", label: "צלם",    value: ev.photographerName },
          ].map((r, i) => (
            <div key={i} className={styles.detailsRow}>
              <span className={styles.detailsRowIcon}>{r.icon}</span>
              <div className={styles.detailsRowBody}>
                <div className={styles.detailsRowLabel}>{r.label}</div>
                <div className={styles.detailsRowValue}>{r.value}</div>
              </div>
            </div>
          ))}
          {ev.notes && (
            <div className={styles.detailsRow}>
              <span className={styles.detailsRowIcon}>📝</span>
              <div className={styles.detailsRowBody}>
                <div className={styles.detailsRowLabel}>הערות</div>
                <div className={styles.detailsRowValue} style={{ whiteSpace: "pre-wrap" }}>{ev.notes}</div>
              </div>
            </div>
          )}
        </div>

        {/* Status timeline */}
        <div className={styles.timelineTitle}>מצב האירוע</div>
        {ev.status === "declined" ? (
          <div className={styles.declinedNote}>❌ הבקשה נדחתה על ידי הצלם</div>
        ) : (
          <div className={styles.timeline}>
            {STEPS.map((s, i) => {
              const done    = step > i + 1;
              const current = step === i + 1;
              const pending = step < i + 1;
              return (
                <div key={i} className={styles.timelineStep}>
                  <div className={styles.timelineLeft}>
                    <div className={`${styles.timelineDot}
                      ${done ? styles.timelineDotDone : ""}
                      ${current ? styles.timelineDotCurrent : ""}
                      ${pending ? styles.timelineDotPending : ""}`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    {i < 2 && (
                      <div className={`${styles.timelineConnector} ${done ? styles.timelineConnectorDone : ""}`} />
                    )}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={`${styles.timelineLabel} ${pending ? styles.timelineLabelPending : ""}`}>
                      {s.label}
                    </div>
                    <div className={styles.timelineDesc}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rating area */}
        {step === 3 && ev.customer_rating !== null && (
          <div className={styles.detailsRated}>
            <div className={styles.detailsRatedLabel}>הדירוג שלך</div>
            <div className={styles.detailsRatedStars}>{"⭐".repeat(ev.customer_rating)}</div>
          </div>
        )}
        {canRate && (
          <button className={styles.rateBtn} style={{ width: "100%", marginTop: 16 }} onClick={() => onRate(ev)}>
            ⭐ דרג את הצלם
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Rating Modal ───────────────────────────────────────── */
function RatingModal({ event, onClose, onRated }) {
  const [selected, setSelected] = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const LABELS = ["", "גרוע", "לא טוב", "בסדר", "טוב", "מצוין! 🎉"];

  const submit = async () => {
    if (!selected) { setError("אנא בחר דירוג"); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/${event.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה");
      onRated(event.id, selected);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.ratingHeroIcon}>{getIcon(event.name)}</div>
        <div className={styles.modalTitle}>איך היה האירוע?</div>
        <div className={styles.modalSub}>דרג את {event.photographerName}</div>
        <div className={styles.modalEventName}>{event.name} · {event.place}</div>

        <div className={styles.stars}>
          {[1,2,3,4,5].map((n) => (
            <span
              key={n}
              className={`${styles.star} ${n <= (hovered || selected) ? styles.starOn : ""}`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(n)}
            >★</span>
          ))}
        </div>
        <div className={styles.ratingLabel}>{LABELS[hovered || selected] || "\u00A0"}</div>

        {error && <div className={styles.error}>{error}</div>}

        <button className={styles.submitBtn} onClick={submit} disabled={submitting || !selected}>
          {submitting ? "שולח..." : "שלח דירוג"}
        </button>
      </div>
    </div>
  );
}
