// PhotographerProfile.jsx - פרופיל של צלם בתוך רשימת צלמים והצעת אירוע

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PhotographerProfile.module.css";

const EVENT_TYPES = [
  "חתונה",
  "בר/בת מצווה",
  "יום הולדת",
  "סיום לימודים",
  "אירוע עסקי",
  "אחר",
];

export function PhotographerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proposalError, setProposalError] = useState("");
  const [proposal, setProposal] = useState({
    eventType: "",
    date: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/photographers/${id}`)
      .then((r) => r.json())
      .then((data) => setPhotographer(data))
      .catch((err) => console.error("Failed to load photographer:", err))
      .finally(() => setLoading(false));

    fetch(`http://localhost:5000/api/events/ratings/${id}`)
      .then((r) => r.json())
      .then((data) => setReviews(data.ratings || []))
      .catch(() => {});
  }, [id]);

  if (loading)
    return <div style={{ padding: 40, color: "white" }}>טוען...</div>;
  if (!photographer)
    return <div style={{ padding: 40, color: "white" }}>צלם לא נמצא</div>;

  const services = [
    photographer.service1Name,
    photographer.service2Name,
    photographer.service3Name,
  ].filter(Boolean);

  const calcAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const p = {
    ...photographer,
    name: photographer.userName,
    location: photographer.city || "לא צוין",
    rating: photographer.rating >= 0 ? photographer.rating : null,
    age: calcAge(photographer.dateOfBirth),
    services,
    emoji: "📸",
    photoUrl: photographer.profile_pic
      ? `http://localhost:5000${photographer.profile_pic}`
      : null,
  };

  const handleSendProposal = async () => {
    if (!proposal.eventType || !proposal.date || !proposal.location) {
      setProposalError("אנא מלא את כל השדות הנדרשים");
      return;
    }
    if (new Date(proposal.date) <= new Date()) {
      setProposalError("תאריך חייב להיות מאוחר מהיום");
      return;
    }
    setProposalError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photographerId: photographer.id,
          name: proposal.eventType,
          date: proposal.date,
          place: proposal.location,
          notes: proposal.description || null,
        }),
      });
      if (!res.ok) throw new Error("שגיאה בשליחת הבקשה");
      setSent(true);
    } catch (err) {
      setProposalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← חזרה לחיפוש
      </button>

      
      <div className={styles.hero}>
        <div className={styles.heroBanner}></div>
        <div className={styles.heroBody}>
          <div className={styles.heroAvatar}>
            {p.photoUrl ? (
              <img
                src={p.photoUrl}
                alt={p.name}
                className={styles.heroAvatarImg}
              />
            ) : (
              p.emoji
            )}
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroName}>{p.name}</div>
            <div className={styles.heroMeta}>
              <span className={styles.heroRating}>
                {p.rating !== null ? `⭐ ${p.rating}` : "אין דירוג עדיין"}
              </span>
              <span className={styles.heroMetaItem}>📍 {p.location}</span>
              {p.age !== null && (
                <span className={styles.heroMetaItem}>🎂 גיל {p.age}</span>
              )}
            </div>
            <div className={styles.heroActions}>
              <button
                className={styles.proposalBtn}
                onClick={() => setModalOpen(true)}
              >
                📩 שלח הצעת אירוע
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        
        <div>
          {p.services.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitle}>🎨 שירותים</div>
              <div className={styles.specialties}>
                {p.services.map((s) => (
                  <span key={s} className={styles.specialtyTag}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>⭐ ביקורות</div>
            {reviews.length === 0 ? (
              <div className={styles.noReviews}>אין ביקורות עדיין</div>
            ) : (
              <div className={styles.reviews}>
                {reviews.map((r, i) => {
                  const d = new Date(r.date);
                  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                  return (
                    <div key={i} className={styles.reviewItem}>
                      <div className={styles.reviewerName}>
                        {r.reviewerName}
                      </div>
                      <div className={styles.reviewStars}>
                        {"⭐".repeat(r.customer_rating)}
                      </div>
                      <div className={styles.reviewMeta}>{dateStr}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        
        <div>
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>📊 נתונים</div>
            <div className={styles.statsList}>
              {[
                {
                  icon: "⭐",
                  label: "דירוג ממוצע",
                  value:
                    p.rating !== null ? `${p.rating} / 5` : "אין דירוג עדיין",
                },
                {
                  icon: "📸",
                  label: "אירועים שצולמו",
                  value: photographer.eventsFilmed ?? 0,
                },
              ].map((s, i) => (
                <div key={i} className={styles.statRow}>
                  <span className={styles.statLabel}>
                    {s.icon} {s.label}
                  </span>
                  <span className={styles.statValue}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setModalOpen(false);
            setSent(false);
            setProposalError("");
            setProposal({
              eventType: "",
              date: "",
              location: "",
              description: "",
            });
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => {
                setModalOpen(false);
                setSent(false);
                setProposalError("");
                setProposal({
                  eventType: "",
                  date: "",
                  location: "",
                  description: "",
                });
              }}
            >
              ×
            </button>

            {sent ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>🎉</div>
                <div className={styles.successTitle}>ההצעה נשלחה!</div>
                <p className={styles.successText}>
                  {p.name} יקבל את ההצעה שלך ויחזור אליך בהקדם.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.modalTitle}>📩 הצעת אירוע</div>
                <div className={styles.modalSubtitle}>שלח הצעה ל-{p.name}</div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>סוג האירוע</label>
                  <select
                    className={styles.formSelect}
                    value={proposal.eventType}
                    onChange={(e) =>
                      setProposal((f) => ({ ...f, eventType: e.target.value }))
                    }
                  >
                    <option value="">בחר סוג אירוע</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>תאריך האירוע</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={proposal.date}
                    onChange={(e) =>
                      setProposal((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>מיקום האירוע</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="לדוגמה: אולם X, תל אביב"
                    value={proposal.location}
                    onChange={(e) =>
                      setProposal((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    תיאור ופרטים נוספים
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="ספר לנו על האירוע שלך..."
                    value={proposal.description}
                    onChange={(e) =>
                      setProposal((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                {proposalError && (
                  <p
                    style={{ color: "#f87171", fontSize: 13, marginBottom: 8 }}
                  >
                    {proposalError}
                  </p>
                )}

                <div className={styles.modalActions}>
                  <button
                    className={styles.modalCancelBtn}
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    ביטול
                  </button>
                  <button
                    className={styles.modalSubmitBtn}
                    onClick={handleSendProposal}
                    disabled={submitting}
                  >
                    {submitting ? "שולח..." : "שלח הצעה 🚀"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotographerProfile;
