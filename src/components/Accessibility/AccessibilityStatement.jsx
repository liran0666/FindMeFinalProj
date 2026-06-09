import styles from "./AccessibilityStatement.module.css";

export function AccessibilityStatement() {
  return (
    <main className={styles.page} lang="he" dir="rtl">
      <div className={styles.card}>
        <h1 className={styles.title}>הצהרת נגישות</h1>
        <p className={styles.updated}>עודכן לאחרונה: יוני 2026</p>

        <section className={styles.section}>
          <h2>אודות הנגישות באתר</h2>
          <p>
            אתר FindMe מחויב לאפשר שימוש נוח ונגיש לכלל המשתמשים, לרבות אנשים
            עם מוגבלויות. אנו פועלים בהתאם לתקן הישראלי לנגישות אתרי אינטרנט
            (ת"י 5568) וברמת WCAG 2.1 AA.
          </p>
        </section>

        <section className={styles.section}>
          <h2>תכונות נגישות באתר</h2>
          <ul>
            <li>ניתן להגדיל ולהקטין את גודל הטקסט באמצעות תפריט הנגישות.</li>
            <li>ניתן להפעיל מצב ניגודיות גבוהה לשיפור הקריאות.</li>
            <li>ניתן להפעיל מצב גווני אפור.</li>
            <li>ניתן להדגיש קישורים בקו תחתון.</li>
            <li>ניתן לעבור לפונט ידידותי לדיסלקסיה.</li>
            <li>האתר תומך בניווט מלא באמצעות המקלדת.</li>
            <li>האתר כתוב בשפה העברית עם כיוון RTL מובנה.</li>
            <li>תמונות כוללות טקסט חלופי (alt text) לתיאור התוכן.</li>
            <li>מבנה הכותרות (H1–H3) עקבי לסיוע בניווט בקוראי מסך.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>הגבלות ידועות</h2>
          <p>
            למרות מאמצינו, ייתכן שחלק מהתכנים אינם נגישים במלואם. אנו עובדים
            על שיפור מתמיד של הנגישות באתר.
          </p>
        </section>

        <section className={styles.section}>
          <h2>יצירת קשר בנושא נגישות</h2>
          <p>
            נתקלת בבעיית נגישות? נשמח לשמוע ממך:
          </p>
          <ul>
            <li>
              <strong>דוא"ל: </strong>
              <a href="mailto:accessibility@findme.co.il">
                accessibility@findme.co.il
              </a>
            </li>
          </ul>
          <p>נשתדל להגיב תוך 5 ימי עסקים.</p>
        </section>

        <section className={styles.section}>
          <h2>תאריך הצהרה זו</h2>
          <p>הצהרה זו הוכנה ביוני 2026.</p>
        </section>
      </div>
    </main>
  );
}

export default AccessibilityStatement;
