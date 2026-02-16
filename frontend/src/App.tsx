import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { RequireRole } from './components/auth/RequireRole';
import { LoginPage } from './pages/LoginPage';
import { SearchPage } from './pages/SearchPage';
import { RoomDetailsPage } from './pages/RoomDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { BookingPage } from './pages/BookingPage';
import { GuestDashboardPage } from './pages/GuestDashboardPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { StaffBookingsPage } from './pages/StaffBookingsPage';
import { StaffRoomsPage } from './pages/StaffRoomsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { DigitalKeyPage } from './pages/DigitalKeyPage';
import { DigitalKeyWalkthroughPage } from './pages/DigitalKeyWalkthroughPage';
import { EnhanceStayPage } from './pages/EnhanceStayPage';
import { LoyaltyRewardsPage } from './pages/LoyaltyRewardsPage';
import { ConciergeServicesPage } from './pages/ConciergeServicesPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            {/* Guest routes */}
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation/:id" element={<BookingConfirmationPage />} />
            <Route path="/bookings" element={<GuestDashboardPage />} />
            <Route path="/bookings/:id" element={<BookingPage />} />
            <Route path="/bookings/:id/enhance" element={<EnhanceStayPage />} />
            <Route path="/profile" element={<EditProfilePage />} />
            <Route path="/digital-key" element={<DigitalKeyPage />} />
            <Route path="/digital-key/guide" element={<DigitalKeyWalkthroughPage />} />
            <Route path="/rewards" element={<LoyaltyRewardsPage />} />
            <Route path="/concierge" element={<ConciergeServicesPage />} />

            {/* Staff routes */}
            <Route element={<RequireRole allowedRoles={['Staff', 'Admin']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
              <Route path="/staff/bookings" element={<StaffBookingsPage />} />
              <Route path="/staff/rooms" element={<StaffRoomsPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<RequireRole allowedRoles={['Admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
