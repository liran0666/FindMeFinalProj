import { Routes, Route, Navigate } from "react-router-dom";
import { PhotographerExplore } from "../components/Customer/PhotographerExplore.jsx";
import { PhotographerProfile } from "../components/Customer/PhotographerProfile.jsx";
import { ProfilePage } from "../components/Shared/Profile.jsx";
import CustomerEventsPage from "../components/Customer/CustomerEventsPage.jsx";

export default function CustomerRoutes({ user }) {
  return (
    <Routes>
      <Route path="/" element={<PhotographerExplore />} />
      <Route path="/explore" element={<PhotographerExplore />} />
      <Route path="/photographer/:id" element={<PhotographerProfile user={user} />} />
      <Route path="/events" element={<CustomerEventsPage />} />
      <Route path="/profile" element={<ProfilePage user={user} />} />

      <Route path="*" element={<Navigate to="/customer" />} />
    </Routes>
  );
}
