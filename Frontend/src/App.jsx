import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LiveChatWidget from './components/LiveChatWidget';
import AetherCartDrawer from './components/AetherCartDrawer';
import AetherSearchModal from './components/AetherSearchModal';
import { useCartStore } from './store/cartStore';

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
import AdminDashboard from './pages/AdminDashboard';
import { useAuthStore, normalizeRoleCode } from './store/authStore';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const rawCartItems = useCartStore((state) => state.items);
  const cartItems = Array.isArray(rawCartItems) ? rawCartItems : [];
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const authUser = useAuthStore((state) => state.user);
  const normalizedRole = authUser ? normalizeRoleCode(authUser.role) : null;
  const isStaff = normalizedRole && normalizedRole !== 'CUSTOMER';

  const isHomePage = location.pathname === '/';
  const isInternalPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

  // Quy tắc cách ly: Nhân viên nội bộ không truy cập vào giao diện người mua mà chỉ ở trong /admin
  React.useEffect(() => {
    if (isStaff && !isInternalPortal) {
      navigate('/admin', { replace: true });
    }
  }, [isStaff, isInternalPortal, navigate]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#fafafa] flex flex-col font-sans overflow-x-hidden selection:bg-[#fafafa] selection:text-[#080808]">
      
      {/* Top Navbar Aether Labs: Chỉ hiển thị cho khách hàng trên các trang con */}
      {!isHomePage && !isInternalPortal && (
        <Navbar
          onOpenCart={() => setCartOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${!isHomePage && !isInternalPortal ? 'pt-14' : ''}`}>
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

          {/* Protected Staff Dashboards: Hợp nhất về Command Center /admin có phân quyền v_user_permissions */}
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={['warehouse', 'admin', 'WAREHOUSE_MANAGER', 'SUPER_ADMIN']}>
                <Navigate to="/admin" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cskh"
            element={
              <ProtectedRoute allowedRoles={['cskh', 'admin', 'CS_STAFF', 'SUPER_ADMIN']}>
                <Navigate to="/admin" replace />
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

      {/* Footer Aether Labs: Chỉ hiển thị trên các trang phụ của khách hàng */}
      {!isHomePage && !isInternalPortal && <Footer />}

      {/* Global Slide-Out Cart Drawer */}
      <AetherCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      {/* Global Search Modal */}
      <AetherSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectGarment={(garment) => {
          setSearchOpen(false);
          navigate(`/products/${garment.id}`);
        }}
      />

      {/* Floating Live Chat Widget (Chỉ hiển thị cho khách hàng ở storefront) */}
      {!isInternalPortal && <LiveChatWidget />}

      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#121212',
            color: '#fafafa',
            fontSize: '12px',
            borderRadius: '0px',
            border: '1px solid #27272a',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            padding: '12px 18px',
            fontFamily: 'JetBrains Mono',
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
