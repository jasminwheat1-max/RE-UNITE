import { Route, Routes } from 'react-router-dom';
import AmbientBackground from './components/AmbientBackground';
import Navbar from './components/Navbar';
import ReloadPrompt from './components/ReloadPrompt';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Deals from './pages/Deals';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HostDashboard from './pages/HostDashboard';
import HostEventForm from './pages/HostEventForm';
import PartnerDashboard from './pages/PartnerDashboard';

export default function App() {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <ReloadPrompt />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/host"
            element={
              <ProtectedRoute role="host">
                <HostDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/events/new"
            element={
              <ProtectedRoute role="host">
                <HostEventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/events/:id/edit"
            element={
              <ProtectedRoute role="host">
                <HostEventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner"
            element={
              <ProtectedRoute role="partner">
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
