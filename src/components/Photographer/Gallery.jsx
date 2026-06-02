// Gallery.jsx — גלריית תמונות גם לצלם וגם למשתמש

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Gallery.module.css";

const SERVER = "http://localhost:5000";
const API    = `${SERVER}/api/events`;

export function GalleryPage({ isCustomer = false }) {
  const { eventId } = useParams();
  const navigate    = useNavigate();

  const [photos,         setPhotos]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [dragover,       setDragover]       = useState(false);
  const [lightbox,       setLightbox]       = useState(null);
  const [error,          setError]          = useState("");

  // state של פילטר פנים
  const [faceFiltering,  setFaceFiltering]  = useState(false);
  const [filteredPhotos, setFilteredPhotos] = useState(null);
  const [faceFilterMsg,  setFaceFilterMsg]  = useState("");
  const [selfiePreview,  setSelfiePreview]  = useState(null);

  // state של בחירת תמונה
  const [selected, setSelected] = useState(new Set());

  const fileInputRef   = useRef(null);
  const selfieInputRef = useRef(null);

  const fetchPhotos = () => {
    const token = localStorage.getItem("token");
    fetch(`${API}/${eventId}/photos`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || []))
      .catch(() => setError("שגיאה בטעינת התמונות."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPhotos(); }, [eventId]);

  //ניקוי בחירה אם יש שינוי בתמונות
  useEffect(() => { setSelected(new Set()); }, [filteredPhotos]);

  // העלאת תמונות (צלם)
  const uploadFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const fd    = new FormData();
      Array.from(files).forEach((f) => fd.append("photos", f));
      const res  = await fetch(`${API}/${eventId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה בהעלאה.");
      setPhotos((prev) => [...prev, ...data.photos]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // מחיקת תמונות (רק לצלם)
  const deletePhoto = async (filename) => {
    if (!confirm("למחוק את התמונה?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/${eventId}/photos/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos((prev) => prev.filter((p) => p.filename !== filename));
      if (filteredPhotos) setFilteredPhotos((prev) => prev.filter((p) => p.filename !== filename));
      setSelected((prev) => { const s = new Set(prev); s.delete(filename); return s; });
    } catch {
      setError("שגיאה במחיקת התמונה.");
    }
  };

  // סינון פנים (לקוח)
  const handleSelfieChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfiePreview(URL.createObjectURL(file));
    setFaceFiltering(true);
    setFaceFilterMsg("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const fd    = new FormData();
      fd.append("selfie", file);
      const res  = await fetch(`${API}/${eventId}/face-filter`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה בסינון פנים.");
      setFilteredPhotos(data.photos || []);
      setFaceFilterMsg(
        data.photos.length > 0
          ? `נמצאו ${data.photos.length} תמונות עם הפנים שלך מתוך ${data.total}`
          : `לא נמצאו תמונות עם הפנים שלך מתוך ${data.total} תמונות`,
      );
    } catch (err) {
      setError(err.message);
      setSelfiePreview(null);
    } finally {
      setFaceFiltering(false);
      if (selfieInputRef.current) selfieInputRef.current.value = "";
    }
  };

  const clearFaceFilter = () => {
    setFilteredPhotos(null);
    setFaceFilterMsg("");
    setSelfiePreview(null);
  };

  //בחירה מרובה של תמונות
  const toggleSelect = (filename, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(filename) ? s.delete(filename) : s.add(filename);//אם לחיצה קיימת מוריד, אם לא אז מוסיף
      return s;
    });
  };
//ניקוי בחירה
  const clearSelection = () => setSelected(new Set());
//בחירת הכל
  const selectAll = () => setSelected(new Set(displayedPhotos.map((p) => p.filename)));
//מחיקת תמונות שנבחרו (צלם)
  const deleteSelected = async () => {
    if (!confirm(`למחוק ${selected.size} תמונות?`)) return;
    const token = localStorage.getItem("token");
    for (const filename of selected) {
      try {
        await fetch(`${API}/${eventId}/photos/${filename}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhotos((prev) => prev.filter((p) => p.filename !== filename));
        if (filteredPhotos) setFilteredPhotos((prev) => prev.filter((p) => p.filename !== filename));
      } catch {
        setError("שגיאה במחיקת תמונה.");
      }
    }
    setSelected(new Set());
  };

  const downloadSelected = async () => {
    for (const filename of selected) {
      const photo = displayedPhotos.find((p) => p.filename === filename);
      if (!photo) continue;
      try {
        const blob = await fetch(`${SERVER}${photo.url}`).then((r) => r.blob());
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {
        //מדלג על תמונות שלא ניתנו להורדה ללא הפרעה
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  // גרור ושחרר תמונה להעלאה
  const onDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    uploadFiles(e.dataTransfer.files);
  };

  const displayedPhotos = filteredPhotos !== null ? filteredPhotos : photos;

  return (
    <div className={styles.page}>
      {/* חזור */}
      <button
        className={styles.backBtn}
        onClick={() => navigate(isCustomer ? "/customer/events" : "/photographer/events")}
      >
        ← חזרה לאירועים
      </button>

      
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>🖼️ גלריה</div>
          <div className={styles.pageSubtitle}>
            {isCustomer ? "התמונות שלך מהאירוע" : `אירוע #${eventId} · ${photos.length} תמונות`}
          </div>
        </div>
        {!isCustomer && (
          <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "מעלה..." : "📤 העלה תמונות"}
          </button>
        )}
      </div>

      {/*במידה ולקוח, מוסיף אופציה לסלפי */}
      {!isCustomer && (
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={(e) => uploadFiles(e.target.files)} />
      )}
      {isCustomer && (
        <input ref={selfieInputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={handleSelfieChange} />
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* התראות ללקוח */}
      {isCustomer && photos.length > 0 && (
        <>
          <div className={styles.sharedBanner}>
            <div className={styles.sharedBannerIcon}>🔗</div>
            <div className={styles.sharedBannerText}>
              <div className={styles.sharedBannerTitle}>התמונות שלך מוכנות!</div>
              <div className={styles.sharedBannerSub}>הצלם העלה {photos.length} תמונות עבורך</div>
            </div>
          </div>

          <div className={styles.faceFilterPanel}>
            <div className={styles.faceFilterLeft}>
              {selfiePreview
                ? <img src={selfiePreview} alt="סלפי" className={styles.selfieThumb} />
                : <div className={styles.selfieIcon}>🤳</div>}
              <div className={styles.faceFilterInfo}>
                <div className={styles.faceFilterTitle}>מצא את הסלפי שלך</div>
                <div className={styles.faceFilterSub}>
                  {faceFilterMsg || "העלה סלפי ונמצא את כל התמונות שבהן הפנים שלך מופיעות"}
                </div>
              </div>
            </div>
            <div className={styles.faceFilterActions}>
              {filteredPhotos !== null && (
                <button className={styles.clearFilterBtn} onClick={clearFaceFilter}>הצג הכל</button>
              )}
              <button className={styles.selfieBtn} onClick={() => selfieInputRef.current?.click()} disabled={faceFiltering}>
                {faceFiltering ? <span className={styles.filteringSpinner}>⏳ מנתח...</span> : "📸 העלה סלפי"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* גרור ושחרר העלאת תמונות (צלם בלבד) */}
      {!isCustomer && (
        <div
          className={`${styles.uploadZone} ${dragover ? styles.dragover : ""} ${photos.length > 0 ? styles.uploadZoneCompact : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadZoneIcon}>{uploading ? "⏳" : "📁"}</div>
          <div className={styles.uploadZoneText}>{uploading ? "מעלה תמונות..." : "גרור תמונות לכאן או לחץ לבחירה"}</div>
          <div className={styles.uploadZoneSub}>JPG, PNG, WEBP עד 20MB לתמונה</div>
        </div>
      )}

      {/* טעינת תמונות */}
      {loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>טוען תמונות...</div>
        </div>
      )}

      {/* באנר של המתנה לניתוח תמונות פנים */}
      {faceFiltering && (
        <div className={styles.scanOverlay}>
          <div className={styles.scanBox}>
            <div className={styles.scanSpinner}></div>
            <div className={styles.scanText}>מנתח פנים בתמונות...</div>
            <div className={styles.scanSub}>אנא המתן, זה עשוי לקחת מספר שניות</div>
          </div>
        </div>
      )}

      {/* במידה ולא נמצא תמונות */}
      {!loading && displayedPhotos.length === 0 && !faceFiltering && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{isCustomer ? "📷" : "🖼️"}</div>
          <div className={styles.emptyText}>
            {filteredPhotos !== null
              ? "לא נמצאו תמונות עם הפנים שלך"
              : isCustomer ? "הצלם טרם העלה תמונות לאירוע זה" : "העלה תמונות לאירוע זה"}
          </div>
        </div>
      )}

      {/* גלריה של תמונות */}
      {!loading && displayedPhotos.length > 0 && (
        <>
        <div className={styles.gridHeader}>
          <button className={styles.selectAllBtn} onClick={selectAll}>
            ☑️ בחר הכל ({displayedPhotos.length})
          </button>
        </div>
        <div className={styles.photoGrid}>
          {displayedPhotos.map((photo) => {
            const isSelected = selected.has(photo.filename);
            return (
              <div
                key={photo.filename}
                className={`${styles.photoItem} ${isSelected ? styles.photoItemSelected : ""}`}
              >
                <img src={`${SERVER}${photo.url}`} alt="" className={styles.photoImg} loading="lazy" />

                {/* עיגול בחירה*/}
                <div
                  className={`${styles.selectCircle} ${isSelected ? styles.selectCircleChecked : ""}`}
                  onClick={(e) => toggleSelect(photo.filename, e)}
                >
                  {isSelected && <span className={styles.checkmark}>✓</span>}
                </div>

                {photo.confidence && (
                  <div className={styles.confidenceBadge}>{photo.confidence}%</div>
                )}

                <div className={styles.photoOverlay}>
                  <button className={styles.photoActionBtn} onClick={() => setLightbox(`${SERVER}${photo.url}`)}>
                    🔍
                  </button>
                  <button
                    className={styles.photoActionBtn}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const blob = await fetch(`${SERVER}${photo.url}`).then((r) => r.blob());
                      const blobUrl = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = blobUrl;
                      a.download = photo.filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(blobUrl);
                    }}
                  >
                    ⬇️
                  </button>
                  {!isCustomer && (
                    <button className={styles.photoActionBtn} onClick={() => deletePhoto(photo.filename)}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {/* שורת בחירות (אחרי בחירת תמונות מרובה) */}
      {selected.size > 0 && (
        <div className={styles.selectionBar}>
          <span className={styles.selectionCount}>{selected.size} תמונות נבחרו</span>
          <div className={styles.selectionActions}>
            <button className={styles.selectionClearBtn} onClick={clearSelection}>נקה</button>
            {!isCustomer && (
              <button className={styles.selectionDeleteBtn} onClick={deleteSelected}>
                🗑️ מחק ({selected.size})
              </button>
            )}
            <button className={styles.selectionDownloadBtn} onClick={downloadSelected}>
              ⬇️ הורד ({selected.size})
            </button>
          </div>
        </div>
      )}

      {/* זכוכית מגדלת תמונה */}
      {lightbox && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox} alt="" className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default GalleryPage;
