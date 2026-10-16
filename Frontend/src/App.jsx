import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Tách riêng 2 trang đăng nhập: Khách Hàng (Vãng lai) & Nhân Sự Nội Bộ (Staff)
import CustomerAuthPage from './pages/CustomerAuthPage';
import StaffAuthPage from './pages/StaffAuthPage';

// Staff Dashboards
import WarehouseDashboard from './pages/WarehouseDashboard';
import CskhDashboard from './pages/CskhDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#e60012] selection:text-white ${isHome ? 'bg-[#0a0a0f] text-white' : 'bg-white text-neutral-900'}`}>
      
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isHome ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />

            {/* Đăng nhập riêng cho Người Mua / Vãng Lai (Không thấy vai trò nội bộ) */}
            <Route path="/login" element={<CustomerAuthPage />} />
            <Route path="/customer/login" element={<CustomerAuthPage />} />

            {/* Đăng nhập riêng cho Nhân Sự Nội Bộ: Warehouse, CSKH, Admin (Không thấy phần khách vãng lai) */}
            <Route path="/staff/login" element={<StaffAuthPage />} />
            <Route path="/admin/login" element={<StaffAuthPage />} />

            {/* Protected Customer Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Staff Dashboards (Liên kết CSDL động) */}
            <Route
              path="/warehouse"
              element={
                <ProtectedRoute allowedRoles={['warehouse', 'admin']}>
                  <WarehouseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cskh"
              element={
                <ProtectedRoute allowedRoles={['cskh', 'admin']}>
                  <CskhDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Toast Notification Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#18181b',
              color: '#ffffff',
              fontSize: '13px',
              borderRadius: '2px',
              border: '1px solid #27272a',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
              padding: '12px 18px',
            },
          }}
        />

      </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
