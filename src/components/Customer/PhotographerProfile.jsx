// PhotographerProfile.jsx - View photographer + send proposal

import { useState } from "react";
import styles from "./PhotographerProfile.module.css";

const MOCK_PACKAGES = [
  { id: 1, name: "בסיסי", price: 800, desc: "4 שעות צילום, 100 תמונות ערוכות" },
  {
    id: 2,
    name: "פרימיום",
    price: 1400,
    desc: "8 שעות צילום, 250 תמונות, אלבום דיגיטלי",
  },
  {
    id: 3,
    name: "VIP",
    price: 2200,
    desc: "יום שלם, 500 תמונות, אלבום מודפס, וידאו",
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "דנה מ.",
    initials: "ד",
    date: "15.02.26",
    stars: 5,
    text: "צלם מדהים! מקצועי, אדיב ותוצאות עוצרות נשימה. ממש המתין לרגע הנכון.",
  },
  {
    id: 2,
    name: "רון כ.",
    initials: "ר",
    date: "10.01.26",
    stars: 5,
    text: "שירות מצויין מתחילה ועד סוף. התמונות יצאו פנטסטיות לחתונה שלנו.",
  },
  {
    id: 3,
    name: "ליאת ב.",
    initials: "ל",
    date: "20.12.25",
    stars: 4,
    text: "צלם טוב מאוד, הגיע בזמן ונתן יחס אישי. ממליצה!",
  },
];

const EVENT_TYPES = [
  "חתונה",
  "בר/בת מצווה",
  "יום הולדת",
  "סיום לימודים",
  "אירוע עסקי",
  "אחר",
];

export function PhotographerProfile({ photographer, onBack }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [proposal, setProposal] = useState({
    eventType: "",
    date: "",
    location: "",
    description: "",
    package: "",
  });

  const p = photographer || {
    id: 1,
    name: "יונתן לוי",
    username: "yonatan_photos",
    location: "תל אביב",
    rating: 4.9,
    reviews: 128,
    price: 800,
    specialties: ["חתונות", "אירועים", "פורטרט"],
    emoji: "🎭",
    bio: "צלם מקצועי עם ניסיון של 10 שנים. מתמחה בצילום חתונות ואירועים מיוחדים. כל אירוע הוא סיפור ייחודי שאני שמח לתעד עבורכם.",
  };

  const handleSendProposal = () => {
    if (proposal.eventType && proposal.date && proposal.location) {
      setSent(true);
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>
        ← חזרה לחיפוש
      </button>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBanner}>{p.emoji}</div>
        <div className={styles.heroBody}>
          <div className={styles.heroAvatar}>{p.emoji}</div>
          <div className={styles.heroInfo}>
            <div className={styles.heroName}>{p.name}</div>
            <div className={styles.heroMeta}>
              <span className={styles.heroRating}>
                ⭐ {p.rating} ({p.reviews} ביקורות)
              </span>
              <span className={styles.heroMetaItem}>📍 {p.location}</span>
              <span className={styles.heroMetaItem}>💰 החל מ-₪{p.price}</span>
            </div>
            <div className={styles.heroActions}>
              <button
                className={styles.proposalBtn}
                onClick={() => setModalOpen(true)}
              >
                📩 שלח הצעת אירוע
              </button>
              <button className={styles.contactBtn}>💬 שלח הודעה</button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Left column */}
        <div>
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>📖 אודות</div>
            <p className={styles.bio}>{p.bio}</p>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>🎨 התמחויות</div>
            <div className={styles.specialties}>
              {p.specialties.map((s) => (
                <span key={s} className={styles.specialtyTag}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>📦 חבילות</div>
            <div className={styles.packages}>
              {MOCK_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`${styles.packageCard} ${selectedPackage === pkg.id ? styles.selected : ""}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <div className={styles.packageHeader}>
                    <span className={styles.packageName}>{pkg.name}</span>
                    <span className={styles.packagePrice}>₪{pkg.price}</span>
                  </div>
                  <div className={styles.packageDesc}>{pkg.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>⭐ ביקורות</div>
            <div className={styles.reviews}>
              {MOCK_REVIEWS.map((r) => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAvatar}>{r.initials}</div>
                    <div>
                      <div className={styles.reviewName}>{r.name}</div>
                      <div className={styles.reviewStars}>
                        {"⭐".repeat(r.stars)}
                      </div>
                    </div>
                    <div className={styles.reviewDate}>{r.date}</div>
                  </div>
                  <div className={styles.reviewText}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>📊 נתונים</div>
            <div className={styles.statsList}>
              {[
                { icon: "⭐", label: "דירוג ממוצע", value: `${p.rating}/5` },
                { icon: "📸", label: "אירועים שצולמו", value: "247" },
                { icon: "👥", label: "לקוחות חוזרים", value: "68%" },
                { icon: "⚡", label: "זמן תגובה", value: "< שעה" },
                { icon: "📅", label: "חבר מאז", value: "ינואר 2023" },
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

      {/* Proposal Modal */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setModalOpen(false);
            setSent(false);
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => {
                setModalOpen(false);
                setSent(false);
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

                <div className={styles.modalActions}>
                  <button
                    className={styles.modalCancelBtn}
                    onClick={() => setModalOpen(false)}
                  >
                    ביטול
                  </button>
                  <button
                    className={styles.modalSubmitBtn}
                    onClick={handleSendProposal}
                  >
                    שלח הצעה 🚀
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
