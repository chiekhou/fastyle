import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/layout/Guards';
import Spinner from './components/ui/Spinner';

const HomePage        = lazy(() => import('./pages/HomePage'));
const ServicesPage    = lazy(() => import('./pages/ServicesPage'));
const BoutiquePage    = lazy(() => import('./pages/BoutiquePage'));
const ProductPage     = lazy(() => import('./pages/ProductPage'));
const ReservationPage = lazy(() => import('./pages/ReservationPage'));
const CartPage        = lazy(() => import('./pages/CartPage'));
const ReviewsPage     = lazy(() => import('./pages/ReviewsPage'));
const AccountPage     = lazy(() => import('./pages/AccountPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage      = lazy(() => import('./pages/VerifyEmailPage'));
const MentionsLegalesPage  = lazy(() => import('./pages/MentionsLegalesPage'));
const CGVPage              = lazy(() => import('./pages/CGVPage'));

const AdminDashboard    = lazy(() => import('./pages/admin/DashboardPage'));
const AdminReservations = lazy(() => import('./pages/admin/ReservationsPage'));
const AdminServices     = lazy(() => import('./pages/admin/ServicesPage'));
const AdminProducts     = lazy(() => import('./pages/admin/ProductsPage'));
const AdminOrders       = lazy(() => import('./pages/admin/OrdersPage'));
const AdminReviews      = lazy(() => import('./pages/admin/ReviewsPage'));
const AdminClientes     = lazy(() => import('./pages/admin/ClientesPage'));
const AdminSlots        = lazy(() => import('./pages/admin/SlotsPage'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#faf7f4',
              color: '#333333',
              border: '1px solid #ddd0c4',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#6c8a2c', secondary: '#fffbe9' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Suspense fallback={<Spinner fullPage />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services"     element={<ServicesPage />} />
              <Route path="boutique"     element={<BoutiquePage />} />
              <Route path="boutique/:id" element={<ProductPage />} />
              <Route path="avis"         element={<ReviewsPage />} />
              <Route path="panier"       element={<CartPage />} />
              <Route path="login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="verify-email"    element={<VerifyEmailPage />} />
              <Route path="mentions-legales" element={<MentionsLegalesPage />} />
              <Route path="cgv"              element={<CGVPage />} />
              <Route path="reservation"  element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
              <Route path="compte"       element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            </Route>
            <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index               element={<AdminDashboard />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="services"     element={<AdminServices />} />
              <Route path="produits"     element={<AdminProducts />} />
              <Route path="commandes"    element={<AdminOrders />} />
              <Route path="avis"         element={<AdminReviews />} />
              <Route path="clientes"     element={<AdminClientes />} />
              <Route path="creneaux"     element={<AdminSlots />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
