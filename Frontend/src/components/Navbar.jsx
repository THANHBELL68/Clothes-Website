import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, LogOut, Package, MapPin, Award, ChevronDown, Menu, X, Shield, Headphones } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isStaff = user && user.role !== 'customer';
  const isHome = location.pathname === '/';

  // Kiểm tra danh mục đang active trên URL
  const queryParams = new URLSearchParams(location.search);
  const activeCategory = queryParams.get('category') || (isHome ? 'all' : '');

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${isHome ? 'bg-[#0a0a0f]/90 text-white border-b border-white/10 backdrop-blur-md' : 'bg-white text-neutral-900 border-b border-neutral-200'}`}>
      
      {/* Thanh Bar Thông báo cho Nhân viên (Chỉ hiển thị khi Nhân viên nội bộ đăng nhập) */}
      {isStaff && (
        <div className="bg-neutral-950 text-white text-xs py-1.5 px-4 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-neutral-400">Đang truy cập Cổng Nội Bộ:</span>
              <span className="font-mono font-bold text-amber-400 uppercase tracking-wider">
                {user.role} ({user.full_name})
              </span>
            </div>

            <div className="flex items-center gap-3 font-semibold text-[11px]">
              {(user.role === 'warehouse' || user.role === 'admin') && (
                <Link to="/warehouse" className="text-amber-400 hover:underline flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Bảng Thủ Kho
                </Link>
              )}
              {(user.role === 'cskh' || user.role === 'admin') && (
                <Link to="/cskh" className="text-emerald-400 hover:underline flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5" /> Bảng CSKH
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-rose-400 hover:underline flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Bảng Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Đỏ phong cách ảnh mẫu (Logo riêng: CLOTHES SHOP) */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 bg-[#e60012] text-white flex flex-col items-center justify-center font-black leading-none tracking-tighter select-none shadow-sm transition-transform group-hover:scale-105">
              <span className="text-[9px] font-black tracking-widest">CLO</span>
              <span className="text-[10px] font-black tracking-widest">THES</span>
            </div>
          </Link>

          {/* Navigation Links (NỮ, NAM) */}
          <nav className={`hidden md:flex items-center gap-8 text-sm font-black tracking-wider h-full ${isHome ? 'text-white' : 'text-neutral-800'}`}>
            <Link
              to="/products?category=nu"
              className={`h-full flex items-center border-b-2 transition-all ${
                activeCategory === 'nu'
                  ? isHome ? 'border-white text-white font-black' : 'border-neutral-900 text-neutral-900 font-black'
                  : isHome ? 'border-transparent text-neutral-400 hover:text-white' : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              NỮ
            </Link>

            <Link
              to="/products?category=nam"
              className={`h-full flex items-center border-b-2 transition-all ${
                activeCategory === 'nam'
                  ? isHome ? 'border-white text-white font-black' : 'border-neutral-900 text-neutral-900 font-black'
                  : isHome ? 'border-transparent text-neutral-400 hover:text-white' : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              NAM
            </Link>
          </nav>

          {/* Search Box phong cách ảnh mẫu */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-sm relative">
            <input
              type="text"
              placeholder="Bạn đang tìm sản phẩm gì?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-full py-2 pl-4 pr-10 text-xs font-medium focus:outline-none transition-all ${
                isHome
                  ? 'bg-white/10 text-white placeholder:text-neutral-400 border border-white/20 focus:border-white/50 focus:bg-white/15'
                  : 'bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-300 focus:bg-white focus:border-neutral-600 text-neutral-900 placeholder:text-neutral-500'
              }`}
            />
            <button type="submit" className={`absolute right-3 p-1 transition-colors ${isHome ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action Icons: Wishlist, User, Cart, Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`p-2 relative transition-colors ${isHome ? 'text-neutral-300 hover:text-rose-400' : 'text-neutral-700 hover:text-rose-600'}`}
              title="Yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e60012] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* User Account (Dành riêng cho Khách hàng) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-1.5 p-1.5 transition-colors ${isHome ? 'text-neutral-300 hover:text-white' : 'text-neutral-800 hover:text-black'}`}
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 border shadow-2xl py-2 z-50 text-xs ${isHome ? 'bg-[#14141e] border-neutral-700 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                    <div className={`px-4 py-2 border-b ${isHome ? 'border-neutral-800' : 'border-neutral-100'}`}>
                      <p className={`font-bold truncate ${isHome ? 'text-white' : 'text-neutral-900'}`}>{user.full_name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{user.email}</p>
                      {user.role === 'customer' && (
                        <p className="text-[10px] font-bold text-amber-500 mt-1 flex items-center gap-1">
                          <Award className="w-3 h-3" /> {user.loyalty_points || 0} điểm loyalty
                        </p>
                      )}
                    </div>

                    {user.role === 'customer' ? (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 font-semibold transition-colors ${isHome ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-50'}`}
                        >
                          <Package className="w-4 h-4 text-neutral-400" /> Đơn hàng của tôi
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 font-semibold transition-colors ${isHome ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-700 hover:bg-neutral-50'}`}
                        >
                          <MapPin className="w-4 h-4 text-neutral-400" /> Sổ địa chỉ & Điểm
                        </Link>
                      </>
                    ) : (
                      <>
                        {user.role === 'warehouse' && (
                          <Link
                            to="/warehouse"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-amber-400 bg-amber-950/40 font-bold"
                          >
                            <Package className="w-4 h-4 text-amber-400" /> Quản Lý Kho
                          </Link>
                        )}
                        {user.role === 'cskh' && (
                          <Link
                            to="/cskh"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-emerald-400 bg-emerald-950/40 font-bold"
                          >
                            <Headphones className="w-4 h-4 text-emerald-400" /> CSKH
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-rose-400 bg-rose-950/40 font-bold"
                          >
                            <Shield className="w-4 h-4 text-rose-400" /> Admin
                          </Link>
                        )}
                      </>
                    )}

                    <div className={`border-t my-1 ${isHome ? 'border-neutral-800' : 'border-neutral-100'}`}></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-950/30 text-left font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`p-2 transition-colors ${isHome ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}
                title="Đăng nhập tài khoản khách hàng"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className={`p-2 relative transition-colors ${isHome ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e60012] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ${isHome ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t p-4 space-y-3 ${isHome ? 'bg-[#0f0f16] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'}`}>
          <form onSubmit={handleSearch} className="flex items-center relative mb-3">
            <input
              type="text"
              placeholder="Bạn đang tìm sản phẩm gì?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-full py-2 pl-4 pr-10 text-xs ${isHome ? 'bg-white/10 text-white placeholder:text-neutral-400 border border-white/20' : 'bg-neutral-100 border border-neutral-300 text-neutral-900'}`}
            />
            <button type="submit" className="absolute right-3 text-neutral-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-2 font-black text-sm">
            <Link to="/products?category=nu" onClick={() => setMobileMenuOpen(false)} className={`py-2 border-b ${isHome ? 'border-neutral-800' : 'border-neutral-100'}`}>
              NỮ
            </Link>
            <Link to="/products?category=nam" onClick={() => setMobileMenuOpen(false)} className="py-2">
              NAM
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}
