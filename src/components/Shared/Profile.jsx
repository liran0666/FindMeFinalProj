// Profile.jsx - Edit profile (both user types)

import { useState, useEffect } from "react";
import styles from "./Profile.module.css";

export function ProfilePage({ user, isPhotographer = false }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "ישראל ישראלי",
    username: user?.username || "israel123",
    email: user?.email || "meie@gmail.com",
    phone: user?.phone || "052-5381648",
    location: user?.location || "תל אביב",
    bio: user?.bio || "צלם מקצועי עם ניסיון של 10 שנים.",
    website: user?.website || "",
    instagram: user?.instagram || "",
  });

  const [specialties, setSpecialties] = useState(
    user?.specialties || ["חתונות", "אירועים", "פורטרט"],
  );
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      setSpecialties((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (i) =>
    setSpecialties((prev) => prev.filter((_, idx) => idx !== i));

  const emoji = user?.emoji || "📸";

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>👤 פרופיל</div>

      {/* Profile hero */}
      <div className={styles.profileCard}>
        <div className={styles.profileBanner}>{emoji}</div>
        <div className={styles.profileBody}>
          <div className={styles.profileAvatarRow}>
            <div className={styles.profileAvatar}>{emoji}</div>
            <div className={styles.avatarEditHint}>לחץ לשינוי תמונה</div>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>📋 פרטים אישיים</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>שם מלא</label>
            <input
              className={styles.formInput}
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>שם משתמש</label>
            <input
              className={styles.formInput}
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>דוא"ל</label>
            <input
              className={styles.formInput}
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>טלפון</label>
            <input
              className={styles.formInput}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>מיקום</label>
            <input
              className={styles.formInput}
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Photographer only fields */}
      {isPhotographer && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>📷 פרטים מקצועיים</div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>ביוגרפיה</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>
                  התמחויות (Enter להוספה)
                </label>
                <div className={styles.tagsWrap}>
                  {specialties.map((s, i) => (
                    <span key={i} className={styles.tag}>
                      {s}
                      <button
                        className={styles.tagRemove}
                        onClick={() => removeTag(i)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className={styles.tagInput}
                    value={tagInput}
                    placeholder="הוסף התמחות..."
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>אתר אינטרנט</label>
                <input
                  className={styles.formInput}
                  value={form.website}
                  placeholder="https://..."
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Instagram</label>
                <input
                  className={styles.formInput}
                  value={form.instagram}
                  placeholder="@username"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instagram: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.saveActions}>
        <button className={styles.cancelBtn}>ביטול</button>
        <button className={styles.saveBtn} onClick={handleSave}>
          💾 שמור שינויים
        </button>
      </div>

      {saved && (
        <div className={styles.savedToast}>✅ השינויים נשמרו בהצלחה!</div>
      )}
    </div>
  );
}

export default ProfilePage;
