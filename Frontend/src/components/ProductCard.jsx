import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isFav = isInWishlist(product.id);

  const primaryImage = product.images?.[0] || 'https://via.placeholder.com/600x800';
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-xl transition-all duration-300">
      
      {/* Product Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-[3/4] bg-neutral-100 overflow-hidden block">
        {/* Main image */}
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-neutral-900 text-white shadow-xs">
              {product.badge}
            </span>
          )}
          {product.video && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-600 text-white flex items-center gap-1 shadow-xs">
              ▶ Video
            </span>
          )}
        </div>

        {/* Quick View Overlay icon */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Xem chi tiết
          </span>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all z-10 ${
          isFav
            ? 'bg-rose-50 text-rose-500 shadow-sm'
            : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-rose-500 shadow-xs'
        }`}
        title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
      </button>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        
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
              className={`w-3.5 h-3.5 rounded-full border ${variant.border ? 'border-neutral-300' : 'border-transparent'}`}
              style={{ backgroundColor: variant.color_code || '#ccc' }}
              title={variant.color}
            />
          ))}
          {product.variants?.length > 4 && (
            <span className="text-[11px] text-neutral-400 font-medium">+{product.variants.length - 4}</span>
          )}
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
          {product.category_name}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="font-medium text-sm text-neutral-900 group-hover:text-amber-600 line-clamp-2 transition-colors mb-2 leading-snug flex-1"
        >
          {product.name}
        </Link>

        {/* Rating and Price */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-auto">
          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{product.rating}</span>
            <span className="text-neutral-400 font-normal">({product.reviews_count})</span>
          </div>

          <span className="font-bold text-neutral-900 text-sm">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
        </div>

      </div>

    </div>
  );
}

