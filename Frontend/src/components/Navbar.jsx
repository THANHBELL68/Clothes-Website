import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, LogOut, Package, MapPin, Award, ChevronDown, Shield, Headphones, Video, VideoOff, RefreshCw } from 'lucide-react';
import { useAuthStore, DEMO_ACCOUNTS } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useBackgroundStore } from '../store/backgroundStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, login } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { isVideoBgEnabled, toggleVideoBg } = useBackgroundStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickSwitchRole = (account) => {
    login(account.email, 'password123');
    setRoleSwitcherOpen(false);
    setUserMenuOpen(false);
    toast.success(`Đã chuyển sang vai trò: ${account.full_name} (${account.role})`);
  };

  return (
    <header className="sticky top-0 z-50 liquid-glass border-b border-white/20 shadow-lg">
      
      {/* Top Banner Thông báo khuyến mãi & Tiện ích Chuyển đổi Phân Quyền */}
      <div className="bg-neutral-950/90 text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-400">✨ Ưu Đãi:</span>
            <span className="hidden sm:inline text-neutral-300">
              Miễn phí vận chuyển từ 500.000đ • Đổi trả trong 7 ngày
            </span>
          </div>

          {/* Quick Role Switcher Pill & Video Toggle */}
          <div className="flex items-center gap-2">
            
            {/* Toggle Video Web */}
            <button
              onClick={toggleVideoBg}
              className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white flex items-center gap-1 transition-all"
              title="Bật/Tắt video nền trang web"
            >
              {isVideoBgEnabled ? (
                <>
                  <VideoOff className="w-3 h-3 text-rose-400" />
                  <span className="hidden md:inline">Tắt Video Web</span>
                </>
              ) : (
                <>
                  <Video className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Bật Video Web</span>
                </>
              )}
            </button>

            {/* Role Switcher Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-sm bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Vai trò: <strong className="text-white uppercase">{user ? user.role : 'Khách vãng lai'}</strong></span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 liquid-glass-dark text-white rounded-sm shadow-2xl p-2 z-50 border border-white/20 text-xs space-y-1">
                  <div className="px-2 py-1.5 border-b border-white/10 text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                    Chọn nhanh vai trò để kiểm thử CSDL:
                  </div>

                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleQuickSwitchRole(acc)}
                      className={`w-full text-left p-2 rounded-sm transition-all flex items-center justify-between ${
                        user?.email === acc.email
                          ? 'bg-amber-600/40 text-amber-300 font-bold border border-amber-400/40'
                          : 'hover:bg-white/10 text-neutral-200'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{acc.full_name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{acc.email}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold uppercase bg-white/10">
                        {acc.role}
                      </span>
                    </button>
                  ))}

                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setRoleSwitcherOpen(false);
                        toast.success('Đã chuyển về Khách Vãng Lai (chưa đăng nhập)');
                      }}
                      className="w-full text-left p-2 text-rose-400 hover:bg-rose-950/30 rounded-sm font-semibold text-[11px]"
                    >
                      Đăng xuất (Khách vãng lai)
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 liquid-glass-btn-dark text-amber-400 flex items-center justify-center font-black text-xl rounded-sm tracking-tighter transition-all group-hover:scale-105">
              CS
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-neutral-900 leading-none">
                CLOTHES<span className="text-amber-600">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Store Fashion</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-wider text-neutral-800">
            <Link to="/products" className="hover:text-amber-600 transition-colors">Tất Cả</Link>
            <Link to="/products?category=nu" className="hover:text-rose-600 transition-colors text-rose-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              Nữ (Có Video)
            </Link>
            <Link to="/products?category=nam" className="hover:text-amber-600 transition-colors">Nam</Link>
            <Link to="/products?category=unisex" className="hover:text-amber-600 transition-colors">Unisex</Link>
          </nav>

          {/* Search bar góc cạnh Liquid Glass */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Tìm áo, quần, mã sp (479073)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-md border border-neutral-300/80 rounded-sm py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:bg-white focus:border-neutral-500 transition-all placeholder:text-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3" />
          </form>

          {/* User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wishlist Button góc cạnh */}
            <Link
              to="/wishlist"
              className="p-2.5 liquid-glass-btn text-neutral-700 hover:text-rose-600 relative"
              title="Danh sách yêu thích"
            >
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-xs flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button góc cạnh */}
            <Link
              to="/cart"
              className="p-2.5 liquid-glass-btn text-neutral-700 hover:text-amber-600 relative"
              title="Giỏ hàng của bạn"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-xs flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Account / Role Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 liquid-glass-btn text-neutral-900"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">
                      {user.role} • {user.loyalty_points || 0}đ
                    </span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-900 text-amber-400 rounded-sm flex items-center justify-center font-black text-xs">
                    {user.full_name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu góc cạnh Liquid Glass */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 liquid-glass rounded-sm shadow-2xl py-2 z-50 text-xs border border-white/40">
                    <div className="px-4 py-2 border-b border-neutral-200/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Vai trò: {user.role}
                      </p>
                      <p className="font-bold text-neutral-900 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Customer Links */}
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 font-semibold"
                    >
                      <Package className="w-4 h-4 text-neutral-500" /> Đơn hàng của tôi
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 font-semibold"
                    >
                      <MapPin className="w-4 h-4 text-neutral-500" /> Sổ địa chỉ & Điểm tích lũy
                    </Link>

                    {/* Staff Portals Links if applicable */}
                    {(user.role === 'warehouse' || user.role === 'admin') && (
                      <Link
                        to="/warehouse"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold"
                      >
                        <Package className="w-4 h-4 text-amber-600" /> Cổng Quản Lý Kho
                      </Link>
                    )}

                    {(user.role === 'cskh' || user.role === 'admin') && (
                      <Link
                        to="/cskh"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold"
                      >
                        <Headphones className="w-4 h-4 text-emerald-600" /> Cổng Chăm Sóc Khách Hàng
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-rose-800 bg-rose-50 hover:bg-rose-100 font-bold"
                      >
                        <Shield className="w-4 h-4 text-rose-600" /> Cổng Admin Tối Cao
                      </Link>
                    )}

                    <div className="border-t border-neutral-200/50 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="liquid-glass-btn-dark px-4 py-2.5 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
