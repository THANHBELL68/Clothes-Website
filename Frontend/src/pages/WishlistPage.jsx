import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useDbStore } from '../store/dbStore';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const rawItems = useWishlistStore((state) => state.items);
  const items = Array.isArray(rawItems) ? rawItems : [];
  const rawProducts = useDbStore((state) => state.products);
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const favoriteProducts = products.filter((p) => p && items.includes(p.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Header Technical Brutalism */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              ARCHIVE // 01
            </span>
          </div>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-white tracking-tight uppercase flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-current" />
            DANH SÁCH YÊU THÍCH
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Lưu trữ các thiết kế bạn quan tâm để theo dõi biến động tồn kho và đặt hàng nhanh chóng.
          </p>
        </div>

        <div className="font-mono text-xs border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-zinc-400">
          <span>TỔNG SỐ LƯU TRỮ: </span>
          <strong className="text-white">{favoriteProducts.length} SẢN PHẨM</strong>
        </div>
      </div>

      {/* Grid Sản Phẩm Yêu Thích */}
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        /* Empty State phong cách Technical Terminal */
        <div className="text-center py-20 max-w-lg mx-auto p-8 border border-zinc-800 bg-[#0c0c0c] space-y-4 font-mono">
          <div className="w-14 h-14 border border-zinc-800 bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
            <Heart className="w-6 h-6 text-zinc-600" />
          </div>
          <h2 className="font-inter font-bold text-lg text-white tracking-tight uppercase">
            CHƯA CÓ THIẾT KẾ YÊU THÍCH
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Hãy nhấn vào biểu tượng trái tim ở các mẫu quần áo Streetwear & Techwear để lưu trữ và so sánh tại đây.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold uppercase tracking-widest transition-all"
            >
              <span>KHÁM PHÁ BỘ SƯU TẬP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
