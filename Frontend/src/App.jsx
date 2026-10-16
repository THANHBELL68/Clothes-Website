import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LiveChatWidget from './components/LiveChatWidget';

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
  const isAetherTheme =
    ['/', '/checkout', '/orders'].includes(location.pathname) ||
    location.pathname.startsWith('/products/') ||
    location.pathname.startsWith('/admin');

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#fafafa] selection:text-[#080808] ${
        isAetherTheme ? 'bg-[#080808] text-[#fafafa]' : 'bg-white text-neutral-900'
      }`}
    >
      {/* Navigation Bar (Chỉ hiển thị cho các trang con theme sáng, trang Aether tự quản lý Navbar) */}
      {!isAetherTheme && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isAetherTheme ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Checkout & Orders: Hỗ trợ cả Khách Thành Viên và Khách Vãng Lai theo Trigger DB */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />

          {/* Đăng nhập riêng cho Người Mua / Vãng Lai (Không thấy vai trò nội bộ) */}
          <Route path="/login" element={<CustomerAuthPage />} />
          <Route path="/customer/login" element={<CustomerAuthPage />} />

          {/* Đăng nhập riêng cho Nhân Sự Nội Bộ: Warehouse, CSKH, Admin (Không thấy phần khách vãng lai) */}
          <Route path="/staff/login" element={<StaffAuthPage />} />
          <Route path="/admin/login" element={<StaffAuthPage />} />

          {/* Protected Customer Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['customer', 'CUSTOMER']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Staff Dashboards (Liên kết CSDL động) */}
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={['warehouse', 'admin', 'WAREHOUSE_MANAGER', 'SUPER_ADMIN']}>
                <WarehouseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cskh"
            element={
              <ProtectedRoute allowedRoles={['cskh', 'admin', 'CS_STAFF', 'SUPER_ADMIN']}>
                <CskhDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'cskh', 'warehouse', 'SUPER_ADMIN', 'CS_STAFF', 'WAREHOUSE_MANAGER']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer (Chỉ hiển thị cho các trang con theme sáng) */}
      {!isAetherTheme && <Footer />}

      {/* Floating Live Chat Widget (kết nối chat_conversations & chat_messages, yêu cầu guest_name & guest_contact với khách chưa đăng nhập) */}
      <LiveChatWidget />

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
