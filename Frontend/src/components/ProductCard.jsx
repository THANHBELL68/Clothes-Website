import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye, Play } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isFav = isInWishlist(product.id);

  const primaryImage = product.images?.[0] || 'https://via.placeholder.com/600x800';

  return (
    <div className="group relative flex flex-col bg-white/90 liquid-glass rounded-sm overflow-hidden border border-neutral-200/80 hover:shadow-2xl transition-all duration-300">
      
      {/* Product Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-[3/4] bg-neutral-900 overflow-hidden block">
        {/* Main image */}
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges góc cạnh */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-neutral-900 text-white shadow-md">
              {product.badge}
            </span>
          )}
          {product.video && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-rose-600 text-white flex items-center gap-1 shadow-md">
              <Play className="w-2.5 h-2.5 fill-current" /> Video
            </span>
          )}
        </div>

        {/* Quick View Overlay icon góc cạnh Liquid Glass */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="liquid-glass-btn-accent text-white text-xs font-bold px-3 py-1.5 shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> Xem chi tiết
          </span>
        </div>
      </Link>

      {/* Wishlist button góc cạnh Liquid Glass */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-xs flex items-center justify-center backdrop-blur-md transition-all z-10 ${
          isFav
            ? 'liquid-glass text-rose-600 border border-rose-300 shadow-md'
            : 'liquid-glass text-neutral-700 hover:text-rose-600 shadow-xs'
        }`}
        title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
      </button>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1">
        
        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mb-2">
          {product.variants?.reduce((acc, v) => {
            if (!acc.find(item => item.color === v.color)) {
              acc.push(v);
            }
            return acc;
          }, []).slice(0, 4).map((variant) => (
            <span
              key={variant.id}
              className={`w-3.5 h-3.5 rounded-xs border ${variant.border ? 'border-neutral-300' : 'border-transparent'}`}
              style={{ backgroundColor: variant.color_code || '#ccc' }}
              title={variant.color}
            />
          ))}
          {product.variants?.length > 4 && (
            <span className="text-[10px] text-neutral-400 font-bold">+{product.variants.length - 4}</span>
          )}
        </div>

        <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-1">
          {product.category_name}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-amber-600 line-clamp-2 transition-colors mb-2 leading-snug flex-1"
        >
          {product.name}
        </Link>

        {/* Rating and Price */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-auto">
          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{product.rating}</span>
            <span className="text-neutral-400 font-normal">({product.reviews_count})</span>
          </div>

          <span className="font-black text-neutral-900 text-sm">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
        </div>

      </div>

    </div>
  );
}
