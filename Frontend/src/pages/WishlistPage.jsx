import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const favoriteProducts = PRODUCTS.filter((p) => items.includes(p.id));

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200/80 pb-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500 fill-current" /> Danh Sách Yêu Thích
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Lưu lại các mẫu trang phục bạn quan tâm để dễ dàng theo dõi và mua sắm sau này
        </p>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-sm flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Chưa có sản phẩm yêu thích</h2>
          <p className="text-xs text-neutral-500">
            Hãy bấm biểu tượng trái tim ở các mẫu quần áo bạn thích để lưu lại tại đây!
          </p>
          <Link
            to="/products"
            className="liquid-glass-btn-accent inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-xs uppercase tracking-wider"
          >
            Khám phá trang phục <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
