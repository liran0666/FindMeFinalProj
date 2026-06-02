// Profile.jsx - עריכת פרופיל לשני הצדדים

import { useState, useEffect, useRef } from "react";
import styles from "./Profile.module.css";

const AUTH_BASE_URL = "http://localhost:5000/api/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfilePage({
  user,
  setUser,
  isPhotographer: isPhotographerProp,
}) {
  const isPhotographer =
    isPhotographerProp ?? user?.userType === "photographer";

  const [form, setForm] = useState({
    username: user?.username || user?.userName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    service1: user?.service1 ?? 0,
    service2: user?.service2 ?? 0,
    service3: user?.service3 ?? 0,
  });

  const [errors, setErrors] = useState({});
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [picUploading, setPicUploading] = useState(false);
  const picInputRef = useRef(null);

  // מביא רשימת שירותים
  useEffect(() => {
    if (!isPhotographer) return;
    fetch(`${AUTH_BASE_URL}/services`)
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isPhotographer]);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "שם משתמש לא יכול להיות ריק.";
    else if (form.username.trim().length < 3)
      errs.username = "שם משתמש חייב להכיל לפחות 3 תווים.";
    if (!form.email.trim()) errs.email = 'דוא"ל לא יכול להיות ריק.';
    else if (!emailRegex.test(form.email.trim()))
      errs.email = 'כתובת דוא"ל אינה תקינה.';
    else if (
      !form.phone.trim() ||
      form.phone.length < 10 ||
      !form.phone.startsWith("05") ||
      isNaN(form.phone)
    )
      errs.phone = "טלפון חייב להיות תקין";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const body = {
        username: form.username.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
      };
      if (isPhotographer) {
        body.service1 = Number(form.service1);
        body.service2 = Number(form.service2);
        body.service3 = Number(form.service3);
      }

      const res = await fetch(`${AUTH_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.message || "שגיאה בשמירה." });
      } else {
        if (setUser) setUser(data.user);
        setToast({ type: "success", message: "השינויים נשמרו בהצלחה!" });
      }
    } catch {
      setToast({ type: "error", message: "שגיאת תקשורת עם השרת." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      city: user?.city || "",
      service1: user?.service1 ?? 0,
      service2: user?.service2 ?? 0,
      service3: user?.service3 ?? 0,
    });
    setErrors({});
  };
  //שינוי תמונת פרופיל
  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "יש לבחור קובץ תמונה בלבד." });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "התמונה גדולה מדי. מקסימום 5MB." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    //מראה תמונת פרופיל ברירת מחדל ישירות
    const localUrl = URL.createObjectURL(file);
    setPicPreview(localUrl);
    setPicUploading(true);

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("profile_pic", file);
      const res = await fetch(`${AUTH_BASE_URL}/profile-pic`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setPicPreview(null);
        setToast({
          type: "error",
          message: data.message || "שגיאה בהעלאת התמונה.",
        });
      } else {
        if (setUser) setUser(data.user);
        setPicPreview(null);
        setToast({ type: "success", message: "תמונת הפרופיל עודכנה!" });
      }
    } catch {
      setPicPreview(null);
      setToast({ type: "error", message: "שגיאת תקשורת עם השרת." });
    } finally {
      setPicUploading(false);
      setTimeout(() => setToast(null), 3000);
      if (picInputRef.current) picInputRef.current.value = "";
    }
  };

  const emoji = user?.emoji || (isPhotographer ? "📸" : "👤");
  const photoUrl =
    picPreview ||
    (user?.profile_pic ? `http://localhost:5000${user.profile_pic}` : null);

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>👤 פרופיל</div>

      <div className={styles.profileCard}>
        <div className={styles.profileBanner}>{emoji}</div>
        <div className={styles.profileBody}>
          <div className={styles.profileAvatarRow}>
            <button
              className={styles.profileAvatar}
              onClick={() => picInputRef.current?.click()}
              title="לחץ לשינוי תמונת פרופיל"
              disabled={picUploading}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="תמונת פרופיל"
                  className={styles.profileAvatarImg}
                />
              ) : (
                <span className={styles.profileAvatarEmoji}>{emoji}</span>
              )}
              <span className={styles.profileAvatarOverlay}>
                {picUploading ? "⏳" : "📷"}
              </span>
            </button>
            <input
              ref={picInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePicChange}
            />
            <div className={styles.avatarEditHint}>
              {picUploading ? "מעלה תמונה..." : "לחץ על התמונה לעריכה"}
            </div>
          </div>
        </div>
      </div>

      {/*  פרטים  */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>📋 פרטים אישיים</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>שם משתמש</label>
            <input
              className={`${styles.formInput} ${errors.username ? styles.inputError : ""}`}
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
            {errors.username && (
              <span className={styles.errorMsg}>{errors.username}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>דוא"ל</label>
            <input
              className={`${styles.formInput} ${errors.email ? styles.inputError : ""}`}
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            {errors.email && (
              <span className={styles.errorMsg}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>עיר</label>
            <input
              className={styles.formInput}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
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
            <span className={styles.errorMsg}>{errors.phone}</span>
          </div>
        </div>
      </div>

      {/* שירותי צלם */}
      {isPhotographer && services.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>📷 שירותים</div>
          <div className={styles.formGrid}>
            {[1, 2, 3].map((n) => (
              <div className={styles.formGroup} key={n}>
                <label className={styles.formLabel}>שירות {n}</label>
                <select
                  className={styles.formInput}
                  value={form[`service${n}`]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [`service${n}`]: e.target.value }))
                  }
                >
                  <option value={0}>ללא</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.type}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.saveActions}>
        <button className={styles.cancelBtn} onClick={handleCancel}>
          ביטול
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "שומר..." : "💾 שמור שינויים"}
        </button>
      </div>

      {toast && (
        <div
          className={
            toast.type === "success" ? styles.savedToast : styles.errorToast
          }
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
