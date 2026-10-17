import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Plus } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const isFav = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || 'https://via.placeholder.com/600x800';
  const defaultVariant = product.variants?.[0] || null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.id,
      product_id: product.id,
      variant_id: defaultVariant?.id || 101,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: primaryImage,
      color: defaultVariant?.color || 'Đen',
      size: defaultVariant?.size || 'M',
    });

    toast.success(`[ĐÃ THÊM] ${product.name} vào giỏ hàng!`, {
      style: {
        background: '#080808',
        color: '#fafafa',
        border: '1px solid #27272a',
        fontFamily: 'JetBrains Mono',
        fontSize: '11px',
      },
    });
  };

  return (
    <div className="group relative flex flex-col bg-[#0c0c0c] border border-zinc-800 hover:border-zinc-500 transition-all duration-300 font-mono text-xs">
      
      {/* Top Header nhỏ góc trên: SKU + Đánh giá */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 bg-[#0e0e0e]">
        <span>SKU: {defaultVariant?.sku || `ITEM-0${product.id}`}</span>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-3 h-3 fill-current" />
          <span>{product.rating || '5.0'}</span>
          <span className="text-zinc-600">({product.reviews_count || 12})</span>
        </div>
      </div>

      {/* Image Container with dot matrix backdrop */}
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-[3/4] bg-[#080808] overflow-hidden flex items-center justify-center p-4 block group"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges góc trên */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-white text-black">
              {product.badge}
            </span>
          )}
        </div>

        {/* Nút yêu thích Heart góc phải */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
            toast.success(isFav ? 'Đã xóa khỏi Wishlist' : 'Đã thêm vào Wishlist!', {
              style: {
                background: '#080808',
                color: '#fafafa',
                border: '1px solid #27272a',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
              },
            });
          }}
          className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center border transition-all z-10 cursor-pointer ${
            isFav
              ? 'bg-rose-950 border-rose-800 text-rose-400'
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500'
          }`}
          title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Overlay hover actions */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
          <span className="px-3 py-2 bg-black/90 border border-zinc-600 text-white font-mono text-[10px] tracking-widest uppercase flex items-center gap-1">
            <Eye className="w-3 h-3" /> XEM CHI TIẾT
          </span>
          <button
            onClick={handleQuickAdd}
            className="px-3 py-2 bg-white text-black font-mono text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 hover:bg-zinc-200 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> + THÊM
          </button>
        </div>
      </Link>

      {/* Info footer */}
      <div className="p-4 border-t border-zinc-800 bg-[#0c0c0c] space-y-2">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
          {product.category_name || 'STREETWEAR'}
        </span>
        <Link
          to={`/products/${product.id}`}
          className="font-inter font-bold text-sm text-[#fafafa] hover:text-zinc-300 transition-colors line-clamp-1 block"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
          <span className="text-[10px] text-zinc-500 uppercase">GIÁ TỪ</span>
          <span className="font-bold text-white text-sm">
            {product.price?.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

    </div>
  );
}
