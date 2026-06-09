import { useState, useEffect } from "react";
import styles from "./AccessibilityWidget.module.css";

const FEATURES = [
  { key: "large-text",      label: "הגדל טקסט",       icon: "A+" },
  { key: "high-contrast",   label: "ניגודיות גבוהה",   icon: "◑"  },
  { key: "grayscale",       label: "גווני אפור",        icon: "◐"  },
  { key: "underline-links", label: "הדגש קישורים",     icon: "🔗" },
  { key: "readable-font",   label: "פונט קריא",         icon: "Aa" },
];

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem("a11y") || "{}"); }
  catch { return {}; }
}

export function AccessibilityWidget() {
  const [open, setOpen]   = useState(false);
  const [active, setActive] = useState(loadPrefs);

  useEffect(() => {
    const html = document.documentElement;
    FEATURES.forEach(({ key }) => {
      html.classList.toggle(`a11y-${key}`, !!active[key]);
    });
    localStorage.setItem("a11y", JSON.stringify(active));
  }, [active]);

  const toggle = (key) => setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  const reset  = () => {
    setActive({});
    FEATURES.forEach(({ key }) => document.documentElement.classList.remove(`a11y-${key}`));
  };

  return (
    <div className={styles.root}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        title="נגישות"
      >
        ♿
      </button>

      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-label="תפריט נגישות"
        >
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>נגישות</span>
            <button
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="סגור תפריט נגישות"
            >
              ✕
            </button>
          </div>

          <div className={styles.features}>
            {FEATURES.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`${styles.featureBtn} ${active[key] ? styles.featureBtnActive : ""}`}
                onClick={() => toggle(key)}
                aria-pressed={!!active[key]}
              >
                <span className={styles.featureIcon} aria-hidden="true">{icon}</span>
                <span className={styles.featureLabel}>{label}</span>
              </button>
            ))}
          </div>

          <button className={styles.resetBtn} onClick={reset}>
            איפוס הגדרות
          </button>

          <a
            className={styles.statementLink}
            href="/accessibility"
            target="_blank"
            rel="noopener noreferrer"
          >
            הצהרת נגישות
          </a>
        </div>
      )}
    </div>
  );
}

export default AccessibilityWidget;
