// PhotographerExplore.jsx - Customer view to browse photographers

import { useState } from "react";
import styles from "./PhotographerExplore.module.css";

const MOCK_PHOTOGRAPHERS = [
  {
    id: 1,
    name: "יונתן לוי",
    username: "yonatan_photos",
    location: "תל אביב",
    rating: 4.9,
    reviews: 128,
    price: 800,
    specialties: ["חתונות", "אירועים", "פורטרט"],
    badge: "top",
    emoji: "🎭",
  },
  {
    id: 2,
    name: "מיכל כהן",
    username: "michal_lens",
    location: "ירושלים",
    rating: 4.7,
    reviews: 84,
    price: 650,
    specialties: ["בר מצווה", "ילדים", "משפחה"],
    badge: null,
    emoji: "🌸",
  },
  {
    id: 3,
    name: "אורי גלעד",
    username: "uri.captures",
    location: "חיפה",
    rating: 4.8,
    reviews: 56,
    price: 700,
    specialties: ["נוף", "עסקי", "מוצרים"],
    badge: "new",
    emoji: "🏔️",
  },
  {
    id: 4,
    name: "שירה בן-דוד",
    username: "shira_photo",
    location: "רמת גן",
    rating: 5.0,
    reviews: 203,
    price: 1200,
    specialties: ["חתונות", "הריון", "ניובורן"],
    badge: "top",
    emoji: "✨",
  },
  {
    id: 5,
    name: "אמיר שלום",
    username: "amir_visual",
    location: "באר שבע",
    rating: 4.6,
    reviews: 41,
    price: 500,
    specialties: ["ספורט", "אירועים", "קונצרטים"],
    badge: null,
    emoji: "⚡",
  },
  {
    id: 6,
    name: "נועה פישר",
    username: "noa_fisher_photo",
    location: "נתניה",
    rating: 4.8,
    reviews: 97,
    price: 900,
    specialties: ["חתונות", "אירועים", "פורטרט"],
    badge: null,
    emoji: "🦋",
  },
];

const SPECIALTIES = ["הכל", "חתונות", "ילדים", "אירועים", "פורטרט", "עסקי"];
const SORT_OPTIONS = [
  { value: "rating", label: "לפי דירוג" },
  { value: "price_asc", label: "מחיר עולה" },
  { value: "price_desc", label: "מחיר יורד" },
  { value: "reviews", label: "לפי ביקורות" },
];

export function PhotographerExplore({ onSelectPhotographer }) {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("הכל");
  const [sort, setSort] = useState("rating");

  const filtered = MOCK_PHOTOGRAPHERS.filter((p) => {
    const matchSearch =
      p.name.includes(search) ||
      p.location.includes(search) ||
      p.username.includes(search);
    const matchSpec = specialty === "הכל" || p.specialties.includes(specialty);
    return matchSearch && matchSpec;
  }).sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  return (
    <div className={styles.page}>
      <div className={styles.searchHero}>
        <h1 className={styles.searchHeroTitle}>
          מצא את הצלם <span>המושלם</span> לך
        </h1>
        <p className={styles.searchHeroSub}>מאות צלמים מקצועיים מכל הארץ</p>
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            placeholder="חפש לפי שם, עיר, סגנון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.searchBtn}>🔍 חיפוש</button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>סנן:</span>
        <div className={styles.filterChips}>
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              className={`${styles.filterChip} ${specialty === s ? styles.active : ""}`}
              onClick={() => setSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          className={styles.filterSelect}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <h3 className={styles.emptyStateTitle}>לא נמצאו צלמים</h3>
            <p>נסה לשנות את פרמטרי החיפוש</p>
          </div>
        ) : (
          filtered.map((p) => (
            <PhotographerCard
              key={p.id}
              photographer={p}
              onClick={() => onSelectPhotographer?.(p)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PhotographerCard({ photographer: p, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardImageWrap}>
        <div className={styles.cardImagePlaceholder}>{p.emoji}</div>
        {p.badge && (
          <span
            className={`${styles.cardBadge} ${p.badge === "top" ? styles.badgeTop : styles.badgeNew}`}
          >
            {p.badge === "top" ? "🏆 מוביל" : "✨ חדש"}
          </span>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <div className={styles.cardName}>{p.name}</div>
          <div className={styles.cardRating}>
            <span className={styles.cardRatingStar}>⭐</span>
            <span className={styles.cardRatingValue}>{p.rating}</span>
          </div>
        </div>
        <div className={styles.cardLocation}>
          📍 {p.location} · {p.reviews} ביקורות
        </div>
        <div className={styles.cardSpecialties}>
          {p.specialties.map((s) => (
            <span key={s} className={styles.specialty}>
              {s}
            </span>
          ))}
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.cardPrice}>
            החל מ- <span className={styles.cardPriceValue}>₪{p.price}</span>
          </div>
          <button className={styles.cardCta}>צפה בפרופיל</button>
        </div>
      </div>
    </div>
  );
}

export default PhotographerExplore;
