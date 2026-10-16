import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Play } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isFav = isInWishlist(product.id);

  const primaryImage = product.images?.[0] || 'https://via.placeholder.com/600x800';

  return (
    <div className="group relative flex flex-col bg-white border border-neutral-200 transition-all duration-300 hover:shadow-lg">
      
      {/* Product Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-[3/4] bg-neutral-100 overflow-hidden block">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges góc vuông tối giản */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-neutral-900 text-white">
              {product.badge}
            </span>
          )}
          {product.video && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#e60012] text-white flex items-center gap-1 shadow-xs">
              <Play className="w-2.5 h-2.5 fill-current" /> Video
            </span>
          )}
        </div>

        {/* Quick View Overlay on hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-neutral-900 text-xs font-black uppercase tracking-widest px-4 py-2 shadow-md">
            Xem Chi Tiết
          </span>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center backdrop-blur-md transition-all z-10 ${
          isFav
            ? 'bg-white text-[#e60012] shadow-sm'
            : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-black shadow-xs'
        }`}
        title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
      </button>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 space-y-2">
        
        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          {product.variants?.reduce((acc, v) => {
            if (!acc.find(item => item.color === v.color)) {
              acc.push(v);
            }
            return acc;
          }, []).slice(0, 4).map((variant) => (
            <span
              key={variant.id}
              className={`w-3.5 h-3.5 border ${variant.border ? 'border-neutral-400' : 'border-transparent'}`}
              style={{ backgroundColor: variant.color_code || '#ccc' }}
              title={variant.color}
            />
          ))}
          {product.variants?.length > 4 && (
            <span className="text-[10px] text-neutral-400 font-bold">+{product.variants.length - 4}</span>
          )}
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          {product.category_name}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="font-bold text-sm text-neutral-900 hover:text-[#e60012] line-clamp-2 transition-colors leading-snug flex-1"
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
