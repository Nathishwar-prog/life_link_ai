import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Overview } from './pages/dashboard/Overview';
import { SearchBlood } from './pages/dashboard/SearchBlood';
import { Inventory } from './pages/dashboard/Inventory';
import { MyDonations } from './pages/dashboard/MyDonations';
import { AiAssistant } from './pages/dashboard/AiAssistant';
import { SOS } from './pages/dashboard/SOS';
import { Campaigns } from './pages/dashboard/Campaigns';
import { DonorCard } from './pages/dashboard/DonorCard';
import { PatientCard } from './pages/dashboard/PatientCard';

import { Donors } from './pages/dashboard/Donors';
import { Requests } from './pages/dashboard/Requests';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes (Login/Register) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes (Dashboard) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="search" element={<SearchBlood />} />
                <Route path="my-donations" element={<MyDonations />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="ai-assistant" element={<AiAssistant />} />
                <Route path="sos" element={<SOS />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="donor-card" element={<DonorCard />} />
                <Route path="patient-card" element={<PatientCard />} />
                <Route path="donors" element={<Donors />} />
                <Route path="requests" element={<Requests />} />
              </Route>
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
