import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, X, Menu, ArrowRight, User, Heart, Sparkles, LogOut, Sun, Moon } from 'lucide-react';
import { MOCK_CATEGORIES } from '../data/mockData';
import { useThemeStore } from '../store/themeStore';

export default function AetherNavbar({
  categories = MOCK_CATEGORIES,
  activeCategory = null,
  onSelectCategory,
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenSearch,
  onScrollToSection,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useThemeStore();

  // Đọc dữ liệu user đăng nhập từ localStorage (users.loyalty_points)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shop_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Lọc danh mục is_active = true và sắp xếp theo sort_order theo đúng Schema DB
  const safeCategories = Array.isArray(categories) ? categories : (MOCK_CATEGORIES || []);
  const activeCategories = [...safeCategories]
    .filter((c) => c && c.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const handleNavClick = (cat) => {
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(cat.slug);
    }
    if (onScrollToSection) {
      onScrollToSection('catalog');
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSectionClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shop_auth_token');
    localStorage.removeItem('shop_auth_user');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/92 backdrop-blur-md border-b border-zinc-800">
      <div className="w-full flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Geometric Stylized 'A' Logo & Monospace Categories */}
        <div className="flex items-center gap-5 lg:gap-7">
          
          {/* Logo 'A' cách điệu trong khung vuông 1px chuẩn Swiss Grid */}
          <button
            onClick={() => handleSectionClick('hero')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 border border-zinc-700 bg-zinc-900/80 flex items-center justify-center transition-colors group-hover:border-zinc-300">
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
                XƯỞNG THỜI TRANG KỸ THUẬT
              </span>
            </div>
          </button>

          {/* Dynamic Monospace Navigation Categories từ bảng categories */}
          <nav className="hidden xl:flex items-center gap-5 border-l border-zinc-800 pl-6 h-8">
            <button
              onClick={() => handleSectionClick('catalog')}
              className={`font-mono text-[11px] tracking-widest uppercase transition-colors relative py-1 cursor-pointer group ${
                !activeCategory ? 'text-white' : 'text-[#a1a1aa] hover:text-[#fafafa]'
              }`}
            >
              <span>TẤT CẢ SẢN PHẨM</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </button>

            {activeCategories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleNavClick(cat)}
                className={`font-mono text-[11px] tracking-widest uppercase transition-colors relative py-1 cursor-pointer group ${
                  activeCategory === cat.slug ? 'text-white' : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
              </button>
            ))}

            <button
              onClick={() => handleSectionClick('craftsmanship')}
              className="font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-[#fafafa] uppercase transition-colors relative py-1 cursor-pointer group"
            >
              <span>CHẤT LIỆU</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </button>

            <button
              onClick={() => handleSectionClick('reviews')}
              className="font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-[#fafafa] uppercase transition-colors relative py-1 cursor-pointer group"
            >
              <span>ĐÁNH GIÁ</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-200 group-hover:w-full" />
            </button>
          </nav>
        </div>

        {/* Right Side: Tìm kiếm, Điểm Loyalty, Wishlist, 2 Link Role & Cart Drawer */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Nút Tìm Kiếm (⌘K) */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 px-2.5 py-1.5 font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-[#fafafa] transition-all cursor-pointer"
            title="Tìm kiếm sản phẩm (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">TÌM KIẾM</span>
            <span className="text-[9px] text-zinc-600 border border-zinc-800 px-1">⌘K</span>
          </button>

          {/* Điểm tích lũy loyalty_points (hiển thị khi đã đăng nhập) */}
          {user && (
            <div
              className="hidden md:flex items-center gap-1.5 border border-amber-500/40 bg-amber-950/20 px-2.5 py-1.5 font-mono text-[11px] tracking-widest text-amber-300"
              title="Điểm tích lũy thành viên (1 điểm = 1.000₫)"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{user.loyalty_points || 0} PTS</span>
            </div>
          )}

          {/* Nút Yêu Thích (WISHLIST) */}
          <Link
            to="/wishlist"
            className="hidden sm:flex items-center gap-1.5 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 px-2.5 py-1.5 font-mono text-[11px] tracking-widest text-zinc-300 hover:text-white transition-all"
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">YÊU THÍCH</span>
            <span className="text-zinc-500">({wishlistCount})</span>
          </Link>

          {/* Phân quyền 1: Khách hàng thành viên / Đăng nhập */}
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-500 bg-zinc-900/40 text-zinc-300 hover:text-white font-mono text-[11px] tracking-widest uppercase transition-all"
                title="Hồ sơ cá nhân"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden lg:inline truncate max-w-[90px]">
                  {user.full_name || user.phone}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-red-400 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-500 bg-zinc-900/40 text-zinc-300 hover:text-white font-mono text-[11px] tracking-widest uppercase transition-all"
              title="Đăng nhập tài khoản khách hàng"
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

          {/* Nút Cart Drawer Nổi Bật Nền Trắng Chữ Đen theo chuẩn ArtCraft */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 navbar-cart-btn px-3.5 py-2 font-mono text-[11px] font-bold tracking-widest uppercase transition-all shadow-sm active:translate-y-0.5 cursor-pointer ml-1"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>GIỎ HÀNG ({String(cartCount).padStart(2, '0')})</span>
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-zinc-800 bg-[#080808] px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleSectionClick('catalog')}
              className="flex items-center justify-between py-2.5 px-3 border-b border-zinc-900 font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-white hover:bg-zinc-900/40 text-left transition-colors"
            >
              <span>TẤT CẢ SẢN PHẨM</span>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
            </button>

            {activeCategories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleNavClick(cat)}
                className="flex items-center justify-between py-2.5 px-3 border-b border-zinc-900 font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-white hover:bg-zinc-900/40 text-left transition-colors"
              >
                <span>{cat.name}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
              </button>
            ))}

            <button
              onClick={() => handleSectionClick('craftsmanship')}
              className="flex items-center justify-between py-2.5 px-3 border-b border-zinc-900 font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-white hover:bg-zinc-900/40 text-left transition-colors"
            >
              <span>CHẤT LIỆU KỸ THUẬT</span>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
            </button>

            <button
              onClick={() => handleSectionClick('reviews')}
              className="flex items-center justify-between py-2.5 px-3 border-b border-zinc-900 font-mono text-[11px] tracking-widest text-[#a1a1aa] hover:text-white hover:bg-zinc-900/40 text-left transition-colors"
            >
              <span>ĐÁNH GIÁ KHÁCH HÀNG</span>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
            </button>
          </div>

          {/* User info on mobile */}
          {user && (
            <div className="p-3 border border-zinc-800 bg-zinc-900/40 flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">{user.full_name || user.phone}</span>
              <span className="text-amber-300">✦ {user.loyalty_points || 0} PTS</span>
            </div>
          )}

          {/* Mobile links */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-zinc-800 font-mono text-[11px] tracking-widest text-zinc-300 hover:text-white text-center"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>KHÁCH HÀNG</span>
            </Link>

            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-zinc-800 font-mono text-[11px] tracking-widest text-zinc-300 hover:text-white text-center cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              <span>{theme === 'dark' ? 'GIAO DIỆN SÁNG' : 'GIAO DIỆN TỐI'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSearch) onOpenSearch();
              }}
              className="w-full flex items-center justify-center gap-2 border border-zinc-800 py-2.5 font-mono text-[11px] tracking-widest text-zinc-300 hover:text-white"
            >
              <Search className="w-3.5 h-3.5" />
              <span>TÌM KIẾM SẢN PHẨM (⌘K)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
