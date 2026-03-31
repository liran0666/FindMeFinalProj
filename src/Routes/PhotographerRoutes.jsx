import { Routes, Route, Navigate } from "react-router-dom";
import { PhotographerDashboard } from "../components/Photographer/PhotographerDashboard.jsx";
import { GalleryPage } from "../components/Photographer/Gallery.jsx";
import { StatsPage } from "../components/Photographer/Stats.jsx";
import { ProfilePage } from "../components/Shared/Profile.jsx";

export default function PhotographerRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<PhotographerDashboard user={user} />} />
      <Route
        path="/proposals"
        element={<PhotographerDashboard user={user} />}
      />
      <Route path="/events" element={<PhotographerDashboard user={user} />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/stats" element={<StatsPage user={user} />} />
      <Route path="/profile" element={<ProfilePage user={user} />} />

      <Route path="*" element={<Navigate to="/photographer" />} />
    </Routes>
  );
}
