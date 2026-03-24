// Gallery.jsx - Photo gallery for photographer (and customer view)

import { useState } from "react";
import styles from "./Gallery.module.css";

const MOCK_EVENTS = [
  {
    id: 1,
    name: "חתונת צירו ומירב",
    date: "13/06/26",
    customer: "מירב כץ",
    photosCount: 342,
  },
  {
    id: 2,
    name: "בר מצווה של אבי",
    date: "29/03/27",
    customer: "אבי לוי",
    photosCount: 187,
  },
  {
    id: 3,
    name: "יום הולדת 50 של רחל",
    date: "22/04/26",
    customer: "רחל שמש",
    photosCount: 256,
  },
];

// Placeholder photo data (sizes vary for masonry effect)
const generatePhotos = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    emoji: [
      "🌸",
      "✨",
      "💍",
      "🎊",
      "🥂",
      "🌹",
      "🎉",
      "💫",
      "🌟",
      "🎵",
      "🕯️",
      "🌿",
    ][i % 12],
    height: [140, 200, 160, 220, 180, 150, 240, 170, 190, 210, 155, 230][
      i % 12
    ],
  }));

export function GalleryPage({ isCustomer = false }) {
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0]);
  const [dragover, setDragover] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const photos = generatePhotos(
    selectedEvent.photosCount > 12 ? 12 : selectedEvent.photosCount,
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>🖼️ גלריה</div>
          <div className={styles.pageSubtitle}>
            {isCustomer ? "התמונות שלך מהאירועים" : "ניהול תמונות לפי אירוע"}
          </div>
        </div>
        {!isCustomer && (
          <button
            className={styles.uploadBtn}
            onClick={() => setShowUpload((s) => !s)}
          >
            📤 העלה תמונות
          </button>
        )}
      </div>

      {/* Event tabs */}
      <div className={styles.eventTabs}>
        {MOCK_EVENTS.map((ev) => (
          <button
            key={ev.id}
            className={`${styles.eventTab} ${selectedEvent.id === ev.id ? styles.active : ""}`}
            onClick={() => setSelectedEvent(ev)}
          >
            {ev.name} ({ev.photosCount})
          </button>
        ))}
      </div>

      {/* Event info */}
      <div className={styles.eventInfoBar}>
        <div className={styles.eventInfoItem}>
          📅 <strong>{selectedEvent.date}</strong>
        </div>
        <div className={styles.eventInfoItem}>
          👤 <strong>{selectedEvent.customer}</strong>
        </div>
        <div className={styles.eventInfoItem}>
          🖼️ <strong>{selectedEvent.photosCount} תמונות</strong>
        </div>
      </div>

      {/* Customer shared banner */}
      {isCustomer && (
        <div className={styles.sharedBanner}>
          <div className={styles.sharedBannerIcon}>🔗</div>
          <div className={styles.sharedBannerText}>
            <div className={styles.sharedBannerTitle}>התמונות שלך מוכנות!</div>
            <div className={styles.sharedBannerSub}>
              הצלם העלה {selectedEvent.photosCount} תמונות עבורך
            </div>
          </div>
          <button className={styles.downloadAllBtn}>⬇️ הורד הכל</button>
        </div>
      )}

      {/* Upload zone (photographer) */}
      {!isCustomer && showUpload && (
        <div
          className={`${styles.uploadZone} ${dragover ? styles.dragover : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragover(true);
          }}
          onDragLeave={() => setDragover(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragover(false);
          }}
        >
          <div className={styles.uploadZoneIcon}>📁</div>
          <div className={styles.uploadZoneText}>גרור תמונות לכאן</div>
          <div className={styles.uploadZoneSub}>
            JPG, PNG, HEIC עד 50MB לתמונה
          </div>
          <button className={styles.uploadZoneBtn}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
            />
            📷 בחר תמונות
          </button>
        </div>
      )}

      {/* Photo grid */}
      <div className={styles.photoGrid}>
        {photos.map((photo) => (
          <PhotoItem key={photo.id} photo={photo} isCustomer={isCustomer} />
        ))}
      </div>
    </div>
  );
}

function PhotoItem({ photo, isCustomer }) {
  return (
    <div className={styles.photoItem}>
      <div
        className={styles.photoPlaceholder}
        style={{
          height: photo.height,
          fontSize: Math.min(photo.height / 2.5, 56),
        }}
      >
        {photo.emoji}
        <div className={styles.photoOverlay}>
          <button className={styles.photoActionBtn}>🔍</button>
          <button className={styles.photoActionBtn}>⬇️</button>
          {!isCustomer && <button className={styles.photoActionBtn}>🗑️</button>}
        </div>
      </div>
    </div>
  );
}

export default GalleryPage;
