import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/lib/auth';

import Splash from '@/pages/customer/Splash';
import Onboarding from '@/pages/customer/Onboarding';
import AuthPage from '@/pages/customer/AuthPage';
import CustomerLayout from '@/pages/customer/CustomerLayout';
import Home from '@/pages/customer/Home';
import Coupons from '@/pages/customer/Coupons';
import CouponDetail from '@/pages/customer/CouponDetail';
import Rewards from '@/pages/customer/Rewards';
import Profile from '@/pages/customer/Profile';
import Notifications from '@/pages/customer/Notifications';
import PurchaseHistory from '@/pages/customer/PurchaseHistory';
import Gamification from '@/pages/customer/Gamification';
import Finder from '@/pages/customer/Finder';
import Copilot from '@/pages/customer/Copilot';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminLocations from '@/pages/admin/AdminLocations';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import GamificationManager from '@/pages/admin/GamificationManager';
import PromotionsManager from '@/pages/admin/PromotionsManager';
import AdminFraud from '@/pages/admin/AdminFraud';
import AdminSettings from '@/pages/admin/AdminSettings';

import Scanner from '@/pages/scanner/Scanner';

import '@/index.css';

function RequireAuth({ children, allowedRoles }) {
  const { user, status } = useAuth();
  if (status === 'loading') {
    return <div className="min-h-screen bg-fp-navy flex items-center justify-center text-white">Loading…</div>;
  }
  if (status !== 'authenticated' || !user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function CustomerArea() {
  const { status, user } = useAuth();
  if (status === 'loading') return <div className="min-h-screen bg-fp-navy flex items-center justify-center text-white">Loading…</div>;
  if (status !== 'authenticated' || !user) return <Navigate to="/onboarding" replace />;
  
  const adminRoles = ['admin', 'owner', 'regional_manager', 'store_manager'];
  if (adminRoles.includes(user.role)) return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/scanner" replace />;
  
  return <CustomerLayout />;
}

function AdminArea() {
  const { status, user } = useAuth();
  if (status === 'loading') return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading…</div>;
  if (status !== 'authenticated' || !user) return <Navigate to="/admin/login" replace />;
  
  const adminRoles = ['admin', 'owner', 'regional_manager', 'store_manager'];
  if (!adminRoles.includes(user.role)) {
    if (user.role === 'staff') return <Navigate to="/scanner" replace />;
    return <Navigate to="/" replace />;
  }
  return <AdminLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Customer area with bottom-tab layout */}
          <Route path="/" element={<CustomerArea />}>
            <Route index element={<Home />} />
            <Route path="finder" element={<Finder />} />
            <Route path="copilot" element={<Copilot />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="coupons/:id" element={<CouponDetail />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="history" element={<PurchaseHistory />} />
            <Route path="gamification" element={<Gamification />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminArea />}>
            <Route index element={<AdminDashboard />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="gamification" element={<GamificationManager />} />
            <Route path="promotions" element={<PromotionsManager />} />
            <Route path="fraud" element={<AdminFraud />} />
            <Route path="settings/*" element={<AdminSettings />} />
          </Route>

          {/* Scanner */}
          <Route path="/scanner" element={
            <RequireAuth allowedRoles={['admin', 'owner', 'regional_manager', 'store_manager', 'staff']}>
              <Scanner />
            </RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
