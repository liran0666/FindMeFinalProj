import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PhotographerExplore.module.css";

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function PhotographerExplore() {
  const navigate = useNavigate();
  const [photographers, setPhotographers] = useState([]);
  const [services, setServices]           = useState([]);
  const [search, setSearch]               = useState("");
  const [sort, setSort]                   = useState("rating");
  const [cityFilter, setCityFilter]       = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [minRating, setMinRating]         = useState("");
  const [filtersOpen, setFiltersOpen]     = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/photographers")
      .then((r) => r.json())
      .then((data) => setPhotographers(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:5000/api/auth/services")
      .then((r) => r.json())
      .then((data) => setServices(data))
      .catch(() => {});
  }, []);

  const formatted = photographers.map((p) => ({
    ...p,
    name: p.userName,
    location: p.city || "לא צוין",
    rating: p.rating >= 0 ? p.rating : null,
    age: calcAge(p.dateOfBirth),
    services: [p.service1Name, p.service2Name, p.service3Name].filter(Boolean),
    photoUrl: p.profile_pic ? `http://localhost:5000${p.profile_pic}` : null,
  }));

  const activeFilterCount = [cityFilter, serviceFilter, minRating].filter(Boolean).length;

  const clearFilters = () => {
    setCityFilter("");
    setServiceFilter("");
    setMinRating("");
  };

  const filtered = formatted
    .filter((p) => {
      if (search && !p.name.includes(search) && !p.location.includes(search)) return false;
      if (cityFilter && !p.location.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (serviceFilter && !p.services.includes(serviceFilter)) return false;
      if (minRating && (p.rating === null || p.rating < Number(minRating))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "rating") {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      }
      if (sort === "name") return a.name.localeCompare(b.name, "he");
      return 0;
    });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.searchHero}>
        <h1 className={styles.searchHeroTitle}>
          מצא את הצלם <span>המושלם</span> לך
        </h1>
        <p className={styles.searchHeroSub}>מאות צלמים מקצועיים מכל הארץ</p>

        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            placeholder="חפש לפי שם, עיר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter + sort bar */}
      <div className={styles.controlBar}>
        <button
          className={`${styles.filterToggleBtn} ${filtersOpen ? styles.filterToggleBtnActive : ""}`}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          🔧 סינון
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </button>

        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>מיין לפי:</span>
          {[
            { value: "rating", label: "⭐ דירוג" },
            { value: "name", label: "🔤 שם" },
          ].map((o) => (
            <button
              key={o.value}
              className={`${styles.sortBtn} ${sort === o.value ? styles.sortBtnActive : ""}`}
              onClick={() => setSort(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>

        <span className={styles.resultsCount}>{filtered.length} צלמים</span>
      </div>

      {/* Expandable filter panel */}
      {filtersOpen && (
        <div className={styles.filterPanel}>
          <div className={styles.filterPanelGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterFieldLabel}>📍 עיר</label>
              <input
                className={styles.filterInput}
                placeholder="לדוגמה: תל אביב"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterFieldLabel}>🎨 סוג שירות</label>
              <select
                className={styles.filterInput}
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="">כל השירותים</option>
                {services.map((s) => (
                  <option key={s.id} value={s.type}>{s.type}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterField}>
              <label className={styles.filterFieldLabel}>
                ⭐ דירוג מינימלי
              </label>
              <select
                className={styles.filterInput}
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">כולם</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="4.5">4.5</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              ✕ נקה סינונים
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <h3 className={styles.emptyStateTitle}>לא נמצאו צלמים</h3>
            <p>נסה לשנות את הסינון</p>
          </div>
        ) : (
          filtered.map((p) => (
            <PhotographerCard
              key={p.id}
              photographer={p}
              onClick={() => navigate(`/customer/photographer/${p.id}`)}
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
        {p.photoUrl ? (
          <img className={styles.cardImage} src={p.photoUrl} alt={p.name} />
        ) : (
          <div className={styles.cardImagePlaceholder}>📸</div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <div className={styles.cardName}>{p.name}</div>
          <div className={styles.cardRating}>
            {p.rating !== null ? `⭐ ${p.rating}` : "חדש"}
          </div>
        </div>

        <div className={styles.cardMeta}>
          <span>📍 {p.location}</span>
          {p.age !== null && <span>🎂 גיל {p.age}</span>}
        </div>

        {p.services.length > 0 && (
          <div className={styles.cardServices}>
            {p.services.map((s) => (
              <span key={s} className={styles.cardServiceTag}>{s}</span>
            ))}
          </div>
        )}

        <div className={styles.cardFooter}>
          <button className={styles.cardCta}>צפה בפרופיל</button>
        </div>
      </div>
    </div>
  );
}

export default PhotographerExplore;
