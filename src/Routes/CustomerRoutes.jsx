import { Routes, Route, Navigate } from "react-router-dom";
import { PhotographerExplore } from "../components/Customer/PhotographerExplore.jsx";
import { PhotographerProfile } from "../components/Customer/PhotographerProfile.jsx";
import { ProfilePage } from "../components/Shared/Profile.jsx";
import CustomerEventsPage from "../components/Customer/CustomerEventsPage.jsx";
import CustomerDashboard from "../components/Customer/CustomerDashboard.jsx";
import { GalleryPage } from "../components/Photographer/Gallery.jsx";

export default function CustomerRoutes({ user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<CustomerDashboard user={user} />} />
      <Route path="/explore" element={<PhotographerExplore />} />
      <Route path="/photographer/:id" element={<PhotographerProfile user={user} />} />
      <Route path="/events" element={<CustomerEventsPage user={user} />} />
      <Route path="/gallery/:eventId" element={<GalleryPage isCustomer={true} />} />
      <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />

      <Route path="*" element={<Navigate to="/customer" />} />
    </Routes>
  );
}
