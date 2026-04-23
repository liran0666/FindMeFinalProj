// Auth.jsx - Login & Register pages

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("אנא מלא את כל השדות");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onLogin?.({ ...form });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <DecorativePanel />
      <div className={styles.authFormWrapper}>
        <div className={styles.authFormHeader}>
          <h1 className={styles.authFormTitle}>ברוכים השבים 👋</h1>
          <p className={styles.authFormSubtitle}>התחבר לחשבון FindMe שלך</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>אימייל</label>
          <input
            className={styles.formInput}
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>סיסמה</label>
          <input
            className={styles.formInput}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <button className={styles.authSubmitBtn} onClick={handleSubmit} disabled={busy}>
          {busy ? "מתחבר..." : "התחבר"}
        </button>

        <p className={styles.authSwitchText}>
          אין לך חשבון?{" "}
          <span className={styles.authSwitchLink} onClick={() => navigate("/register")}>
            הירשם עכשיו
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export function RegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    city: "",
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Clean up preview object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
    };
  }, [profilePicPreview]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("קובץ התמונה אינו תקין. יש לבחור קובץ תמונה.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("התמונה גדולה מדי. גודל מקסימלי: 5MB.");
      return;
    }
    setError("");
    if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/services")
      .then((r) => r.json())
      .then((data) => setServices(data))
      .catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleService = (id) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) {
      setError("אנא מלא את כל השדות החובה");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    if (role === "photographer" && selectedServices.length === 0) {
      setError("צלם חייב לבחור לפחות שירות אחד");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      const fd = new FormData();
      Object.entries({ ...payload, userType: role,
        service1: selectedServices[0] || 0,
        service2: selectedServices[1] || 0,
        service3: selectedServices[2] || 0,
      }).forEach(([k, v]) => fd.append(k, v));
      if (profilePicFile) fd.append("profile_pic", profilePicFile);
      await onRegister?.(fd);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <DecorativePanel />
      <div className={styles.authFormWrapper}>
        <div className={styles.authFormScroll}>
          <div className={styles.authFormHeader}>
            <h1 className={styles.authFormTitle}>הצטרפות ל-FindMe 📸</h1>
            <p className={styles.authFormSubtitle}>צור חשבון חדש ותתחיל</p>
          </div>

          {/* Role selector */}
          <div className={styles.roleSelector}>
            {[
              { id: "customer",     icon: "🙋", label: "לקוח",  desc: "מחפש צלם לאירוע" },
              { id: "photographer", icon: "📷", label: "צלם",   desc: "מציע שירותי צילום" },
            ].map((r) => (
              <div
                key={r.id}
                className={`${styles.roleCard} ${role === r.id ? styles.active : ""}`}
                onClick={() => { setRole(r.id); setSelectedServices([]); }}
              >
                <span className={styles.roleCardIcon}>{r.icon}</span>
                <span className={styles.roleCardLabel}>{r.label}</span>
                <span className={styles.roleCardDesc}>{r.desc}</span>
              </div>
            ))}
          </div>

          {/* Profile picture */}
          <div className={styles.sectionDivider}>תמונת פרופיל</div>
          <div className={styles.avatarPickerRow}>
            <label className={styles.avatarPickerLabel} htmlFor="profile_pic_input">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="תצוגה מקדימה" className={styles.avatarPreview} />
              ) : (
                <div className={styles.avatarPickerPlaceholder}>
                  <span className={styles.avatarPickerIcon}>📷</span>
                  <span className={styles.avatarPickerHint}>לחץ להעלאת תמונה</span>
                  <span className={styles.avatarPickerSub}>JPG / PNG / WEBP עד 5MB</span>
                </div>
              )}
            </label>
            <input
              id="profile_pic_input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfilePicChange}
            />
            {profilePicPreview && (
              <button
                type="button"
                className={styles.avatarRemoveBtn}
                onClick={() => { setProfilePicFile(null); setProfilePicPreview(null); }}
              >
                הסר תמונה
              </button>
            )}
          </div>

          {/* Account details */}
          <div className={styles.sectionDivider}>פרטי חשבון</div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              שם משתמש <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="username123"
              value={form.username}
              onChange={set("username")}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              אימייל <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={set("email")}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                סיסמה <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>אימות סיסמה</label>
              <input
                className={`${styles.formInput} ${
                  form.confirmPassword && form.confirmPassword !== form.password
                    ? styles.formInputError
                    : form.confirmPassword && form.confirmPassword === form.password
                    ? styles.formInputSuccess
                    : ""
                }`}
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
              />
            </div>
          </div>

          {/* Personal details */}
          <div className={styles.sectionDivider}>פרטים אישיים</div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>תאריך לידה</label>
              <input
                className={styles.formInput}
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>עיר</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="תל אביב"
                value={form.city}
                onChange={set("city")}
              />
            </div>
          </div>

          {/* Services — photographers only */}
          {role === "photographer" && (
            <>
              <div className={styles.sectionDivider}>
                שירותים <span className={styles.sectionDividerNote}>(בחר עד 3)</span>
              </div>
              <div className={styles.servicesGrid}>
                {services.map((s) => {
                  const selected = selectedServices.includes(s.id);
                  const disabled = !selected && selectedServices.length >= 3;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.serviceChip} ${selected ? styles.serviceChipActive : ""} ${disabled ? styles.serviceChipDisabled : ""}`}
                      onClick={() => !disabled && toggleService(s.id)}
                    >
                      {s.type}
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <p className={styles.servicesNote}>
                  {selectedServices.length}/3 שירותים נבחרו
                </p>
              )}
            </>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button className={styles.authSubmitBtn} onClick={handleSubmit} disabled={busy}>
            {busy ? "יוצר חשבון..." : "יצירת חשבון"}
          </button>

          <p className={styles.authSwitchText}>
            יש לך חשבון?{" "}
            <span className={styles.authSwitchLink} onClick={() => navigate("/login")}>
              התחבר
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── DECORATIVE PANEL ─────────────────────────────────────────────────────────
function DecorativePanel() {
  return (
    <div className={styles.authPanel}>
      <div className={styles.authPanelGrid} />
      <div className={styles.authPanelContent}>
        <div className={styles.authPanelLogo}>FindMe 📸</div>
        <p className={styles.authPanelTagline}>מחברים רגעים לאמנות</p>
        <div className={styles.authPanelFeatures}>
          {[
            { icon: "🌍", title: "חיפוש לפי מיקום",   desc: "מצא צלמים קרובים אליך" },
            { icon: "⭐", title: "דירוגים ועדויות",    desc: "בחר על פי ניסיון לקוחות אחרים" },
            { icon: "📅", title: "ניהול אירועים",      desc: "שלח הצעות ועקוב אחר פגישות" },
          ].map((f, i) => (
            <div className={styles.authPanelFeature} key={i}>
              <span className={styles.authPanelFeatureIcon}>{f.icon}</span>
              <div className={styles.authPanelFeatureText}>
                <div className={styles.authPanelFeatureTitle}>{f.title}</div>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
