// App.jsx - FindMe main app with routing between all views

import { useState } from "react";
import { LoginPage, RegisterPage } from "../Auth/Auth";
import { Navbar } from "../Layout/Navbar.jsx";
import { PhotographerExplore } from "../Customer/PhotographerExplore.jsx";
import { PhotographerProfile } from "../Customer/PhotographerProfile.jsx";
import { PhotographerDashboard } from "../Photographer/PhotographerDashboard.jsx";
import { GalleryPage } from "../Photographer/Gallery.jsx";
import { StatsPage } from "../Photographer/Stats.jsx";
import { ProfilePage } from "../Shared/Profile.jsx";

// Demo users to quickly switch roles
const DEMO_USERS = {
  customer: { fullName: "דנה כהן", username: "dana_c", role: "customer" },
  photographer: {
    fullName: "יונתן לוי",
    username: "yonatan_photos",
    role: "photographer",
  },
};

export default function App() {
  const [authPage, setAuthPage] = useState("login"); // 'login' | 'register'
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);

  // Auto-set first tab after login
  const handleLogin = (data) => {
    const loggedUser = data.role ? data : DEMO_USERS.customer;
    setUser(loggedUser);
    setActiveTab(loggedUser.role === "photographer" ? "proposals" : "explore");
  };

  const handleLogout = () => {
    setUser(null);
    setAuthPage("login");
    setSelectedPhotographer(null);
  };

  // Not logged in
  if (!user) {
    return authPage === "login" ? (
      <LoginPage onLogin={handleLogin} />
    ) : (
      <RegisterPage onRegister={handleLogin} />
    );
  }

  // Render active page
  const renderPage = () => {
    if (user.role === "customer") {
      if (selectedPhotographer) {
        return (
          <PhotographerProfile
            photographer={selectedPhotographer}
            onBack={() => setSelectedPhotographer(null)}
          />
        );
      }
      switch (activeTab) {
        case "explore":
          return (
            <PhotographerExplore
              onSelectPhotographer={(p) => setSelectedPhotographer(p)}
            />
          );
        case "events":
          return <CustomerEventsPage />;
        case "profile":
          return <ProfilePage user={user} isPhotographer={false} />;
        default:
          return (
            <PhotographerExplore
              onSelectPhotographer={setSelectedPhotographer}
            />
          );
      }
    } else {
      // Photographer
      switch (activeTab) {
        case "proposals":
          return <PhotographerDashboard user={user} />;
        case "events":
          return <PhotographerDashboard user={user} />;
        case "gallery":
          return <GalleryPage isCustomer={false} />;
        case "stats":
          return <StatsPage user={user} />;
        case "profile":
          return <ProfilePage user={user} isPhotographer />;
        default:
          return <PhotographerDashboard user={user} />;
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Quick role switcher for demo */}
      <DemoSwitcher
        currentRole={user.role}
        onSwitch={(role) => {
          setUser(DEMO_USERS[role]);
          setActiveTab(role === "photographer" ? "proposals" : "explore");
          setSelectedPhotographer(null);
        }}
      />

      {renderPage()}
    </div>
  );
}

// Demo-only role switcher ribbon
function DemoSwitcher({ currentRole, onSwitch }) {
  return (
    <div
      style={{
        background: "rgba(21,101,192,0.12)",
        borderBottom: "1px solid rgba(66,165,245,0.2)",
        padding: "6px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 12,
        color: "var(--text-muted)",
        justifyContent: "center",
      }}
    >
      <span>⚡ Demo:</span>
      {["customer", "photographer"].map((role) => (
        <button
          key={role}
          onClick={() => onSwitch(role)}
          style={{
            padding: "3px 12px",
            borderRadius: 999,
            border: `1px solid ${currentRole === role ? "var(--blue-400)" : "var(--border)"}`,
            background:
              currentRole === role ? "rgba(21,101,192,0.25)" : "transparent",
            color:
              currentRole === role ? "var(--blue-300)" : "var(--text-muted)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {role === "customer" ? "🙋 לקוח" : "📷 צלם"}
        </button>
      ))}
    </div>
  );
}

// Simple customer events page placeholder
function CustomerEventsPage() {
  const events = [
    {
      id: 1,
      type: "חתונה",
      photographer: "יונתן לוי",
      date: "13/06/26",
      status: "upcoming",
      photosReady: false,
    },
    {
      id: 2,
      type: "יום הולדת",
      photographer: "מיכל כהן",
      date: "05/12/25",
      status: "completed",
      photosReady: true,
    },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 800,
          color: "var(--white)",
          marginBottom: 24,
        }}
      >
        📅 האירועים שלי
      </div>
      {events.map((ev) => (
        <div
          key={ev.id}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{ fontSize: 40 }}>
            {ev.type === "חתונה" ? "💍" : "🎂"}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                color: "var(--white)",
                marginBottom: 4,
              }}
            >
              {ev.type}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                display: "flex",
                gap: 16,
              }}
            >
              <span>📷 {ev.photographer}</span>
              <span>📅 {ev.date}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {ev.photosReady && (
              <button
                style={{
                  padding: "8px 18px",
                  background:
                    "linear-gradient(135deg,var(--blue-600),var(--blue-500))",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🖼️ צפה בתמונות
              </button>
            )}
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background:
                  ev.status === "upcoming"
                    ? "rgba(255,213,79,0.12)"
                    : "rgba(105,240,174,0.1)",
                color:
                  ev.status === "upcoming"
                    ? "var(--accent-gold)"
                    : "var(--accent-mint)",
                border: `1px solid ${ev.status === "upcoming" ? "rgba(255,213,79,0.25)" : "rgba(105,240,174,0.2)"}`,
              }}
            >
              {ev.status === "upcoming" ? "קרוב" : "הושלם"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
