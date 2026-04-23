// Gallery.jsx — real event photo gallery (photographer upload / customer view)

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Gallery.module.css";

const SERVER = "http://localhost:5000";
const API    = `${SERVER}/api/events`;

export function GalleryPage({ isCustomer = false }) {
  const { eventId } = useParams();
  const navigate    = useNavigate();

  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragover,  setDragover]  = useState(false);
  const [lightbox,  setLightbox]  = useState(null); // url of photo to enlarge
  const [error,     setError]     = useState("");
  const fileInputRef = useRef(null);

  const fetchPhotos = () => {
    const token = localStorage.getItem("token");
    fetch(`${API}/${eventId}/photos`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos || []))
      .catch(() => setError("שגיאה בטעינת התמונות."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPhotos(); }, [eventId]);

  // ── Upload ────────────────────────────────────────────────
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

  // ── Delete ────────────────────────────────────────────────
  const deletePhoto = async (filename) => {
    if (!confirm("למחוק את התמונה?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/${eventId}/photos/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos((prev) => prev.filter((p) => p.filename !== filename));
    } catch {
      setError("שגיאה במחיקת התמונה.");
    }
  };

  // ── Drag & drop ───────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className={styles.page}>
      {/* Back */}
      <button
        className={styles.backBtn}
        onClick={() => navigate(isCustomer ? "/customer/events" : "/photographer/events")}
      >
        ← חזרה לאירועים
      </button>

      {/* Header */}
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

      {/* Hidden file input */}
      {!isCustomer && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => uploadFiles(e.target.files)}
        />
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Customer banner */}
      {isCustomer && photos.length > 0 && (
        <div className={styles.sharedBanner}>
          <div className={styles.sharedBannerIcon}>🔗</div>
          <div className={styles.sharedBannerText}>
            <div className={styles.sharedBannerTitle}>התמונות שלך מוכנות!</div>
            <div className={styles.sharedBannerSub}>הצלם העלה {photos.length} תמונות עבורך</div>
          </div>
        </div>
      )}

      {/* Drag-and-drop upload zone (photographer only, shown when no photos or dragging) */}
      {!isCustomer && (
        <div
          className={`${styles.uploadZone} ${dragover ? styles.dragover : ""} ${photos.length > 0 ? styles.uploadZoneCompact : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadZoneIcon}>{uploading ? "⏳" : "📁"}</div>
          <div className={styles.uploadZoneText}>
            {uploading ? "מעלה תמונות..." : "גרור תמונות לכאן או לחץ לבחירה"}
          </div>
          <div className={styles.uploadZoneSub}>JPG, PNG, WEBP עד 20MB לתמונה</div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyText}>טוען תמונות...</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && photos.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{isCustomer ? "📷" : "🖼️"}</div>
          <div className={styles.emptyText}>
            {isCustomer ? "הצלם טרם העלה תמונות לאירוע זה" : "העלה תמונות לאירוע זה"}
          </div>
        </div>
      )}

      {/* Photo grid */}
      {!loading && photos.length > 0 && (
        <div className={styles.photoGrid}>
          {photos.map((photo) => (
            <div key={photo.filename} className={styles.photoItem}>
              <img
                src={`${SERVER}${photo.url}`}
                alt=""
                className={styles.photoImg}
                loading="lazy"
              />
              <div className={styles.photoOverlay}>
                <button className={styles.photoActionBtn} onClick={() => setLightbox(`${SERVER}${photo.url}`)}>
                  🔍
                </button>
                <a
                  className={styles.photoActionBtn}
                  href={`${SERVER}${photo.url}`}
                  download
                  onClick={(e) => e.stopPropagation()}
                >
                  ⬇️
                </a>
                {!isCustomer && (
                  <button className={styles.photoActionBtn} onClick={() => deletePhoto(photo.filename)}>
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
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
