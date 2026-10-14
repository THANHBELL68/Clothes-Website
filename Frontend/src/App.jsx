import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Video, VideoOff, Volume2, VolumeX, Shield, Package, Headphones } from 'lucide-react';
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
import AuthPage from './pages/AuthPage';

// Staff Dashboards
import WarehouseDashboard from './pages/WarehouseDashboard';
import CskhDashboard from './pages/CskhDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Stores
import { useBackgroundStore } from './store/backgroundStore';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { isVideoBgEnabled, isMuted, toggleVideoBg, toggleMute } = useBackgroundStore();
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col relative text-neutral-900 selection:bg-amber-500 selection:text-white font-sans overflow-x-hidden">
        
        {/* =========================================================================
            GLOBAL BACKGROUND LAYER (VIDEO HOẶC GRADIENT MẶC ĐỊNH)
            Có thể bật / tắt linh hoạt theo yêu cầu của người dùng
        ========================================================================== */}
        {isVideoBgEnabled ? (
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              src="/site_bg.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.05]"
            />
            {/* Lớp phủ Liquid Glass Frosted làm dịu và đảm bảo văn bản cực kỳ dễ đọc */}
            <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[3px]" />
          </div>
        ) : (
          <div className="fixed inset-0 z-0 bg-gradient-to-br from-neutral-50 via-neutral-100/70 to-neutral-200/50 pointer-events-none" />
        )}

        {/* Content Wrapper to sit above the fixed background */}
        <div className="relative z-10 flex flex-col min-h-screen">
          
          {/* Navigation Bar */}
          <Navbar />

          {/* Quick Staff Navigation Bar (Hiển thị nếu là Staff hoặc để test nhanh quyền) */}
          {user && user.role !== 'customer' && (
            <div className="liquid-glass-dark border-b border-white/10 text-white text-xs py-1.5 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-neutral-300">Cổng Nhân Viên:</span>
                  <span className="font-mono font-bold text-amber-400 uppercase tracking-wider">
                    {user.role} ({user.full_name})
                  </span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  {(user.role === 'warehouse' || user.role === 'admin') && (
                    <Link
                      to="/warehouse"
                      className="px-2.5 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-400" /> Bảng Thủ Kho
                    </Link>
                  )}
                  {(user.role === 'cskh' || user.role === 'admin') && (
                    <Link
                      to="/cskh"
                      className="px-2.5 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
                    >
                      <Headphones className="w-3.5 h-3.5 text-emerald-400" /> Bảng CSKH
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="px-2.5 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" /> Bảng Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<AuthPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Staff Dashboards (Tối giản, năng suất cao, liên kết DB động) */}
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

          {/* =========================================================================
              FLOATING CONTROLLER PILL: BẬT / TẮT VIDEO NỀN TOÀN TRANG & ÂM THANH
          ========================================================================== */}
          <aside aria-label="Bộ điều khiển nền trang web" className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
            <button
              onClick={toggleVideoBg}
              className="liquid-glass-btn-dark px-3 py-2 text-white text-xs font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"
              title="Bật/Tắt video nền của toàn trang web"
            >
              {isVideoBgEnabled ? (
                <>
                  <VideoOff className="w-4 h-4 text-rose-400" />
                  <span>Tắt Video Web</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Bật Video Web</span>
                </>
              )}
            </button>

            {isVideoBgEnabled && (
              <button
                onClick={toggleMute}
                className="liquid-glass-btn-dark p-2 text-white shadow-2xl hover:scale-105 transition-all"
                title="Bật/Tắt âm thanh video nền"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>
            )}
          </aside>

          {/* Toast Notification Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(24, 24, 32, 0.92)',
                backdropFilter: 'blur(12px)',
                color: '#ffffff',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                padding: '12px 18px',
              },
            }}
          />

        </div>
      </div>
    </BrowserRouter>
  );
}
