import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Sparkles, LogOut, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useThemeStore } from '../store/themeStore';

export default function Navbar({ onOpenCart, onOpenSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const rawCartItems = useCartStore((state) => state.items);
  const cartItems = Array.isArray(rawCartItems) ? rawCartItems : [];
  const rawWishlistItems = useWishlistStore((state) => state.items);
  const wishlistItems = Array.isArray(rawWishlistItems) ? rawWishlistItems : [];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  const totalWishlistCount = wishlistItems.length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-zinc-800">

      {/* Main Bar */}
      <div className="w-full flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Geometric Stylized 'A' Logo & Navigation Links */}
        <div className="flex items-center gap-5 lg:gap-7">
          
          {/* Logo 'A' AETHER LABS */}
          <Link to="/" className="flex items-center gap-3 group text-left">
            <div className="w-8 h-8 border border-zinc-700 bg-zinc-900 flex items-center justify-center transition-colors group-hover:border-zinc-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                className="w-4 h-4 text-white transition-transform group-hover:scale-110"
              >
                <path d="M12 3 L3 21 H7 L9.5 15 H14.5 L17 21 H21 L12 3 Z" />
                <line x1="9.5" y1="15" x2="14.5" y2="15" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="font-inter font-black text-sm tracking-tight text-[#fafafa] uppercase">
                AETHER LABS
              </span>
              <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase -mt-0.5 hidden sm:block">
                TECHWEAR STUDIO
              </span>
            </div>
          </Link>

          {/* Navigation Links Monospace */}
          <nav className="hidden xl:flex items-center gap-5 border-l border-zinc-800 pl-6 h-8 font-mono text-[11px] tracking-widest uppercase">
            <Link
              to="/products"
              className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors relative py-1 group"
            >
              <span>ALL DROPS</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </Link>

            <Link
              to="/products?category=nu"
              className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors relative py-1 group"
            >
              <span>THỜI TRANG NỮ</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </Link>

            <Link
              to="/products?category=nam"
              className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors relative py-1 group"
            >
              <span>THỜI TRANG NAM</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </Link>

            <Link
              to="/orders"
              className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors relative py-1 group"
            >
              <span>ĐƠN HÀNG</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </Link>
          </nav>
        </div>

        {/* Right Side: Search, Loyalty Points, Wishlist, Role Login, Cart Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Search */}
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleQuickSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-[#141414] border border-zinc-700 px-3 py-1 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white w-48"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="px-2 text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => (onOpenSearch ? onOpenSearch() : setSearchOpen(true))}
                className="flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 px-2.5 py-1.5 font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-[#fafafa] transition-all cursor-pointer"
                title="Tìm kiếm sản phẩm"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden md:inline">TÌM KIẾM</span>
              </button>
            )}
          </div>

          {/* Loyalty Points (Thành viên) */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 border border-amber-500/40 bg-amber-950/20 px-2.5 py-1.5 font-mono text-[11px] tracking-widest text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{user.loyalty_points || 0} PTS</span>
            </div>
          )}

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 px-2.5 py-1.5 font-mono text-[11px] tracking-widest text-zinc-300 hover:text-white transition-all"
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">WISHLIST</span>
            <span className="text-zinc-500">({totalWishlistCount})</span>
          </Link>

          {/* Phân quyền 1: Cổng Người Mua */}
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-500 bg-zinc-900/40 text-zinc-300 hover:text-white font-mono text-[11px] tracking-widest uppercase transition-all"
                title="Hồ sơ tài khoản"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden lg:inline truncate max-w-[80px]">
                  {user.full_name || user.phone}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-500 bg-zinc-900/40 text-zinc-300 hover:text-white font-mono text-[11px] tracking-widest uppercase transition-all"
              title="Đăng nhập khách hàng"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">ĐĂNG NHẬP</span>
            </Link>
          )}

          {/* Nút chuyển đổi Giao diện Sáng / Tối */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 border border-zinc-800 hover:border-zinc-500 bg-zinc-900/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            )}
          </button>

          {/* Nút Giỏ Hàng Nổi Bật Nền Trắng Chữ Đen */}
          <button
            onClick={() => (onOpenCart ? onOpenCart() : navigate('/cart'))}
            className="flex items-center gap-2 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 px-3.5 py-2 font-mono text-[11px] font-bold tracking-widest uppercase transition-all shadow-sm cursor-pointer ml-1"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>CART ({String(totalCartCount).padStart(2, '0')})</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-8 h-8 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-zinc-800 bg-[#080808] px-4 py-5 space-y-3 font-mono text-xs">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-zinc-900 text-zinc-300 hover:text-white uppercase tracking-wider"
          >
            ALL DROPS // TẤT CẢ
          </Link>
          <Link
            to="/products?category=nu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-zinc-900 text-zinc-300 hover:text-white uppercase tracking-wider"
          >
            THỜI TRANG NỮ [RAYON]
          </Link>
          <Link
            to="/products?category=nam"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-zinc-900 text-zinc-300 hover:text-white uppercase tracking-wider"
          >
            THỜI TRANG NAM [LÔNG CỪU]
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-zinc-900 text-zinc-300 hover:text-white uppercase tracking-wider"
          >
            THEO DÕI ĐƠN HÀNG
          </Link>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border border-zinc-800 text-center text-zinc-300 hover:text-white"
            >
              KHÁCH HÀNG
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 border border-zinc-800 text-center text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              <span>{theme === 'dark' ? 'GIAO DIỆN SÁNG' : 'GIAO DIỆN TỐI'}</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
