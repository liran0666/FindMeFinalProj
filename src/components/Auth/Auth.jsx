// Auth.jsx - Login & Register pages

import { useState } from "react";
import styles from "./Auth.module.css";

export function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) return;
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
            placeholder="הכנס אימייל"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>סיסמה</label>
          <input
            className={styles.formInput}
            type="password"
            placeholder="הכנס סיסמה"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </div>

        {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

        <button
          className={styles.authSubmitBtn}
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? "מתחבר..." : "התחבר"}
        </button>

        <p className={styles.authSwitchText}>
          אין לך חשבון?{" "}
          <span className={styles.authSwitchLink}>הירשם עכשיו</span>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage({ onRegister }) {
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) return;
    setError("");
    setBusy(true);
    try {
      await onRegister?.({ ...form, userType: role });
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
          <h1 className={styles.authFormTitle}>הצטרפות ל-FindMe</h1>
          <p className={styles.authFormSubtitle}>צור חשבון חדש ותתחיל</p>
        </div>

        <div className={styles.roleSelector}>
          {[
            {
              id: "customer",
              icon: "🙋",
              label: "לקוח",
              desc: "מחפש צלם לאירוע",
            },
            {
              id: "photographer",
              icon: "📷",
              label: "צלם",
              desc: "מציע שירותי צילום",
            },
          ].map((r) => (
            <div
              key={r.id}
              className={`${styles.roleCard} ${role === r.id ? styles.active : ""}`}
              onClick={() => setRole(r.id)}
            >
              <span className={styles.roleCardIcon}>{r.icon}</span>
              <span className={styles.roleCardLabel}>{r.label}</span>
              <span className={styles.roleCardDesc}>{r.desc}</span>
            </div>
          ))}
        </div>

        {[
          { key: "username", label: "שם משתמש", placeholder: "username" },
          {
            key: "email",
            label: "אימייל",
            placeholder: "example@email.com",
            type: "email",
          },
          {
            key: "password",
            label: "סיסמה",
            placeholder: "••••••••",
            type: "password",
          },
          { key: "city", label: "עיר", placeholder: "תל אביב" },
          { key: "age", label: "גיל", placeholder: "25", type: "number" },
        ].map((f) => (
          <div className={styles.formGroup} key={f.key}>
            <label className={styles.formLabel}>{f.label}</label>
            <input
              className={styles.formInput}
              type={f.type || "text"}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
            />
          </div>
        ))}

        {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

        <button
          className={styles.authSubmitBtn}
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? "יוצר חשבון..." : "יצירת חשבון"}
        </button>

        <p className={styles.authSwitchText}>
          יש לך חשבון? <span className={styles.authSwitchLink}>התחבר</span>
        </p>
      </div>
    </div>
  );
}

function DecorativePanel() {
  return (
    <div className={styles.authPanel}>
      <div className={styles.authPanelGrid} />
      <div className={styles.authPanelContent}>
        <div className={styles.authPanelLogo}>FindMe 📸</div>
        <p className={styles.authPanelTagline}>מחברים רגעים לאמנות</p>
        <div className={styles.authPanelFeatures}>
          {[
            {
              icon: "🌍",
              title: "חיפוש לפי מיקום",
              desc: "מצא צלמים קרובים אליך",
            },
            {
              icon: "⭐",
              title: "דירוגים ועדויות",
              desc: "בחר על פי ניסיון לקוחות אחרים",
            },
            {
              icon: "📅",
              title: "ניהול אירועים",
              desc: "שלח הצעות ועקוב אחר פגישות",
            },
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
