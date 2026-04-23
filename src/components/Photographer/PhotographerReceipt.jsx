// PhotographerReceipt.jsx — receipt generator with tax calculation and PDF export

import { useState, useEffect, useRef } from "react";
import styles from "./PhotographerReceipt.module.css";

const API = "http://localhost:5000/api/events";
const TAX_RATE = 0.18;

function formatDate(dateVal) {
  const d = new Date(dateVal);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function formatMoney(n) {
  return "₪" + Number(n).toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcPrices(amount, includesTax) {
  const raw = parseFloat(amount) || 0;
  if (includesTax) {
    const beforeTax = raw / (1 + TAX_RATE);
    const tax       = raw - beforeTax;
    return { beforeTax, tax, total: raw };
  } else {
    const tax  = raw * TAX_RATE;
    const total = raw + tax;
    return { beforeTax: raw, tax, total };
  }
}

export function PhotographerReceipt({ user }) {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedId,  setSelectedId]  = useState("");
  const [fullName,    setFullName]    = useState("");
  const [amount,      setAmount]      = useState("");
  const [includesTax, setIncludesTax] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/receipts`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-fill customer name when event is selected
  useEffect(() => {
    const ev = events.find((e) => String(e.id) === String(selectedId));
    if (ev) setFullName(ev.customerName || "");
  }, [selectedId, events]);

  const selectedEvent = events.find((e) => String(e.id) === String(selectedId));
  const prices        = calcPrices(amount, includesTax);
  const today         = formatDate(new Date());
  const receiptNumber = selectedEvent ? `REC-${selectedEvent.id}-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}${String(new Date().getDate()).padStart(2,"0")}` : "";
  const canPrint      = selectedEvent && fullName.trim() && parseFloat(amount) > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      {/* ── Form (hidden on print) ── */}
      <div className={styles.formPanel}>
        <div className={styles.pageTitle}>🧾 הפקת קבלה</div>
        <div className={styles.pageSubtitle}>בחר אירוע, מלא פרטים ושמור כ-PDF</div>

        {/* Event selector */}
        <div className={styles.formSection}>
          <div className={styles.sectionLabel}>בחר אירוע</div>
          {loading ? (
            <div className={styles.loadingText}>טוען אירועים...</div>
          ) : events.length === 0 ? (
            <div className={styles.emptyText}>אין אירועים מאושרים עדיין</div>
          ) : (
            <select
              className={styles.select}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">— בחר אירוע —</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} · {formatDate(ev.date)} · {ev.customerName}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedEvent && (
          <>
            {/* Customer name */}
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>שם מלא של הלקוח</div>
              <input
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="שם מלא..."
              />
            </div>

            {/* Price */}
            <div className={styles.formSection}>
              <div className={styles.sectionLabel}>סכום (₪)</div>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Tax checkbox */}
            <label className={styles.taxCheckbox}>
              <input
                type="checkbox"
                checked={includesTax}
                onChange={(e) => setIncludesTax(e.target.checked)}
              />
              <span>הסכום כולל מע"מ (18%)</span>
            </label>

            {/* Live breakdown */}
            {parseFloat(amount) > 0 && (
              <div className={styles.breakdown}>
                <div className={styles.breakdownRow}>
                  <span>מחיר לפני מע"מ</span>
                  <span>{formatMoney(prices.beforeTax)}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>מע"מ (18%)</span>
                  <span>{formatMoney(prices.tax)}</span>
                </div>
                <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
                  <span>סה"כ לתשלום</span>
                  <span>{formatMoney(prices.total)}</span>
                </div>
              </div>
            )}

            {/* Print button */}
            <button
              className={styles.printBtn}
              onClick={handlePrint}
              disabled={!canPrint}
            >
              🖨️ שמור כ-PDF / הדפס
            </button>
          </>
        )}
      </div>

      {/* ── Receipt (visible on screen + printed) ── */}
      {selectedEvent && canPrint && (
        <div className={styles.receiptWrapper} ref={receiptRef}>
          <div className={styles.receipt}>
            {/* Header */}
            <div className={styles.receiptHeader}>
              <div className={styles.receiptLogo}>📸 FindMe</div>
              <div className={styles.receiptHeaderDetails}>
                <div className={styles.receiptNumber}>קבלה מס׳ {receiptNumber}</div>
                <div className={styles.receiptDate}>תאריך הפקה: {today}</div>
              </div>
            </div>

            <div className={styles.receiptDivider} />

            {/* Parties */}
            <div className={styles.receiptParties}>
              <div className={styles.receiptParty}>
                <div className={styles.receiptPartyLabel}>מאת (צלם)</div>
                <div className={styles.receiptPartyName}>{user?.username || user?.userName}</div>
              </div>
              <div className={styles.receiptParty}>
                <div className={styles.receiptPartyLabel}>לכבוד (לקוח)</div>
                <div className={styles.receiptPartyName}>{fullName}</div>
                <div className={styles.receiptPartyMeta}>{selectedEvent.customerEmail}</div>
              </div>
            </div>

            <div className={styles.receiptDivider} />

            {/* Event details */}
            <div className={styles.receiptSection}>
              <div className={styles.receiptSectionTitle}>פרטי האירוע</div>
              <div className={styles.receiptGrid}>
                <div className={styles.receiptGridRow}>
                  <span className={styles.receiptGridLabel}>סוג אירוע</span>
                  <span className={styles.receiptGridValue}>{selectedEvent.name}</span>
                </div>
                <div className={styles.receiptGridRow}>
                  <span className={styles.receiptGridLabel}>תאריך</span>
                  <span className={styles.receiptGridValue}>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className={styles.receiptGridRow}>
                  <span className={styles.receiptGridLabel}>מיקום</span>
                  <span className={styles.receiptGridValue}>{selectedEvent.place}</span>
                </div>
              </div>
            </div>

            <div className={styles.receiptDivider} />

            {/* Price table */}
            <div className={styles.receiptSection}>
              <div className={styles.receiptSectionTitle}>פירוט תשלום</div>
              <table className={styles.priceTable}>
                <thead>
                  <tr>
                    <th>תיאור השירות</th>
                    <th>סכום</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>שירותי צילום — {selectedEvent.name}</td>
                    <td>{formatMoney(prices.beforeTax)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className={styles.taxRow}>
                    <td>מע"מ (18%)</td>
                    <td>{formatMoney(prices.tax)}</td>
                  </tr>
                  <tr className={styles.totalRow}>
                    <td>סה"כ לתשלום</td>
                    <td>{formatMoney(prices.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer */}
            <div className={styles.receiptFooter}>
              תודה על הבחירה בשירותינו 🙏
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotographerReceipt;
