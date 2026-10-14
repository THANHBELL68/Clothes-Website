import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, LogOut, Package, MapPin, Award, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Banner Thông báo khuyến mãi & Chính sách CSDL */}
      <div className="bg-neutral-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span>✨ Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ • Đổi trả dễ dàng trong 7 ngày</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center font-black text-xl rounded-lg tracking-tighter group-hover:bg-amber-600 transition-colors">
              CS
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900 leading-none">
                CLOTHES<span className="text-amber-600">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Store Fashion</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-neutral-700">
            <Link to="/products" className="hover:text-amber-600 transition-colors">Tất Cả</Link>
            <Link to="/products?category=nu" className="hover:text-amber-600 transition-colors font-semibold text-rose-600">
              Nữ (Có Video)
            </Link>
            <Link to="/products?category=nam" className="hover:text-amber-600 transition-colors">Nam</Link>
            <Link to="/products?category=unisex" className="hover:text-amber-600 transition-colors">Unisex</Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Tìm áo, quần, mã sp (479073)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border border-transparent rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-neutral-300 transition-all placeholder:text-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
          </form>

          {/* User & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-neutral-700 hover:text-rose-600 relative rounded-full hover:bg-neutral-100 transition-colors"
              title="Yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="p-2 text-neutral-700 hover:text-amber-600 relative rounded-full hover:bg-neutral-100 transition-colors"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Account / Role Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 border border-neutral-200 rounded-full hover:border-neutral-400 transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-neutral-900 leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <Award className="w-3 h-3" /> {user.loyalty_points} điểm
                    </span>
                  </div>
                  <div className="w-7 h-7 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-xs">
                    {user.full_name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 rounded-xl shadow-xl py-2 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs text-neutral-400 font-medium">Vai trò: Khách hàng thành viên</p>
                      <p className="font-semibold text-neutral-800 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <Package className="w-4 h-4 text-neutral-500" /> Đơn hàng của tôi
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <MapPin className="w-4 h-4 text-neutral-500" /> Sổ địa chỉ & Điểm tích lũy
                    </Link>

                    <div className="border-t border-neutral-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-all"
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

