import { Routes, Route, Navigate } from "react-router-dom";
import { PhotographerDashboard } from "../components/Photographer/PhotographerDashboard.jsx";
import { PhotographerRequests } from "../components/Photographer/PhotographerRequests.jsx";
import { PhotographerEvents } from "../components/Photographer/PhotographerEvents.jsx";
import { GalleryPage } from "../components/Photographer/Gallery.jsx";
import { StatsPage } from "../components/Photographer/Stats.jsx";
import { ProfilePage } from "../components/Shared/Profile.jsx";
import { PhotographerReceipt } from "../components/Photographer/PhotographerReceipt.jsx";
// הפרדת קומפוננטות של צלם
export default function PhotographerRoutes({ user, setUser }) {
  return (
    <Routes>
      <Route path="/"         element={<PhotographerDashboard user={user} />} />
      <Route path="/requests" element={<PhotographerRequests />} />
      <Route path="/events"   element={<PhotographerEvents />} />
      <Route path="/gallery/:eventId" element={<GalleryPage />} />
      <Route path="/stats"    element={<StatsPage user={user} />} />
      <Route path="/receipt"  element={<PhotographerReceipt user={user} />} />
      <Route path="/profile"  element={<ProfilePage user={user} setUser={setUser} />} />
      <Route path="*"         element={<Navigate to="/photographer" />} />
    </Routes>
  );
}
