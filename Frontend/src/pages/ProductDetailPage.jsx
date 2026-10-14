import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Truck, RefreshCw, Heart, ShoppingBag, Play, Pause, Volume2, VolumeX, Video, VideoOff } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const product = PRODUCTS.find((p) => p.id === Number(id)) || PRODUCTS[0];
  const isFav = isInWishlist(product.id);

  // Danh sách ảnh & video
  const mediaList = useMemo(() => {
    const list = product.images.map((img, idx) => ({ type: 'image', url: img, id: idx }));
    if (product.video) {
      list.unshift({ type: 'video', url: product.video, id: 'vid' });
    }
    return list;
  }, [product]);

  const [activeMedia, setActiveMedia] = useState(mediaList[0] || { type: 'image', url: product.images[0] });
  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.color || '');
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'material' | 'policy'

  // Chế độ video nền tự động chạy cho sản phẩm (nếu sản phẩm có video)
  const [isVideoBgMode, setIsVideoBgMode] = useState(Boolean(product.video));
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Tìm biến thể khớp với Color và Size đang chọn (tương ứng bảng product_variants trong DB)
  const currentVariant = useMemo(() => {
    return product.variants?.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    ) || product.variants?.[0];
  }, [product, selectedColor, selectedSize]);

  // Các màu sắc có sẵn
  const availableColors = useMemo(() => {
    const map = new Map();
    product.variants?.forEach((v) => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, color_code: v.color_code, border: v.border });
      }
    });
    return Array.from(map.values());
  }, [product]);

  // Các size có sẵn
  const availableSizes = useMemo(() => {
    const set = new Set();
    product.variants?.forEach((v) => {
      if (v.color === selectedColor) {
        set.add(v.size);
      }
    });
    return Array.from(set);
  }, [product, selectedColor]);

  const toggleVideoPlayback = () => {
    const videoElem = document.getElementById('product-detail-video');
    if (videoElem) {
      if (isPlaying) {
        videoElem.pause();
        setIsPlaying(false);
      } else {
        videoElem.play();
        setIsPlaying(true);
      }
    }
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!currentVariant) return;

    addToCart({
      variant_id: currentVariant.id,
      product_id: product.id,
      name: product.name,
      size: currentVariant.size,
      color: currentVariant.color,
      price: product.price,
      image: product.images[0],
      stock: currentVariant.stock,
      quantity: quantity,
    });

    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="space-y-12">
      
      {/* Breadcrumb góc cạnh */}
      <nav className="text-xs font-bold text-neutral-400 flex items-center gap-2">
        <Link to="/" className="hover:text-neutral-900 transition-colors">TRANG CHỦ</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_id}`} className="hover:text-neutral-900 transition-colors uppercase">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Section: Gallery + Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Media Gallery (Hỗ trợ chế độ Video nền tự động chạy và bật/tắt) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails góc cạnh */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {mediaList.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveMedia(item);
                  if (item.type === 'video') {
                    setIsVideoBgMode(true);
                  }
                }}
                className={`relative w-16 h-20 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${
                  activeMedia.url === item.url
                    ? 'border-neutral-900 shadow-md scale-95'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center text-white p-1">
                    <Play className="w-4 h-4 fill-current text-rose-500" />
                    <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Video</span>
                  </div>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>

          {/* Main Display Viewer - Hỗ trợ Video nền tự động chạy có nút bật/tắt */}
          <div className="flex-1 aspect-[3/4] bg-neutral-950 rounded-sm overflow-hidden relative border border-neutral-300 shadow-xl">
            
            {product.video && isVideoBgMode ? (
              <div className="relative w-full h-full">
                <video
                  id="product-detail-video"
                  src={product.video}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Video controls góc cạnh phong cách Liquid Glass */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <button
                    onClick={toggleVideoPlayback}
                    className="liquid-glass-btn-dark p-2 text-white"
                    title={isPlaying ? 'Tạm dừng video' : 'Phát tiếp video'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                  </button>

                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="liquid-glass-btn-dark p-2 text-white"
                    title={isVideoMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  >
                    {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setIsVideoBgMode(false)}
                    className="liquid-glass-btn-dark px-2.5 py-1.5 text-white text-[11px] font-bold flex items-center gap-1"
                    title="Chuyển sang chế độ xem ảnh tĩnh"
                  >
                    <VideoOff className="w-3 h-3 text-rose-400" /> Tắt Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {activeMedia.type === 'video' ? (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                  />
                )}

                {product.video && (
                  <button
                    onClick={() => setIsVideoBgMode(true)}
                    className="absolute top-4 right-4 liquid-glass-btn-accent text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg"
                  >
                    <Video className="w-3.5 h-3.5" /> Bật Video Nền Tự Động
                  </button>
                )}
              </div>
            )}

            {product.code && (
              <span className="absolute top-4 left-4 liquid-glass-btn-dark text-white text-[11px] font-mono font-bold px-2.5 py-1 z-10">
                MÃ: {product.code}
              </span>
            )}
          </div>

        </div>

        {/* Right Column: Product Details & Purchase Form */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-xs">
                {product.category_name}
              </span>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 liquid-glass-btn transition-colors ${isFav ? 'text-rose-600 bg-rose-50 border-rose-300' : 'text-neutral-500 hover:text-rose-500'}`}
                title="Lưu vào danh sách yêu thích"
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-2 leading-snug">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-neutral-400 font-normal">({product.reviews_count} đánh giá)</span>
              </div>
              <span className="text-neutral-300">|</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-xs">
                Có sẵn tại kho
              </span>
            </div>

            {/* Giá */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-900">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-xs text-neutral-500">Đã bao gồm thuế VAT</span>
            </div>
          </div>

          <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed border-t border-neutral-200/60 pt-4">
            {product.short_desc}
          </p>

          {/* Chọn Màu Sắc (bảng product_variants.color) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800">Màu sắc: <span className="font-semibold text-neutral-500">{selectedColor}</span></span>
            </div>

            <div className="flex items-center gap-2">
              {availableColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setSelectedColor(c.color)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold border-2 transition-all ${
                    selectedColor === c.color
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-white/70 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-xs border ${c.border ? 'border-neutral-300' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color_code || '#000' }}
                  />
                  <span>{c.color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Size (bảng product_variants.size) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800">Kích thước (Size):</span>
              <span className="text-amber-600 font-bold cursor-pointer hover:underline text-[11px]">Bảng quy đổi size</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 rounded-sm text-xs font-black uppercase transition-all ${
                    selectedSize === size
                      ? 'liquid-glass-btn-accent text-white shadow-md'
                      : 'liquid-glass-btn text-neutral-800 bg-white/80'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Hiển thị số lượng tồn kho (bảng product_variants.stock) */}
          <div className="text-xs text-neutral-600 flex items-center justify-between bg-white/70 liquid-glass p-3 rounded-sm border border-neutral-200">
            <span>Mã SKU: <strong className="font-mono text-neutral-900">{currentVariant?.sku}</strong></span>
            <span>Tồn kho hiện tại: <strong className="text-amber-700 font-mono font-bold">{currentVariant?.stock} chiếc</strong></span>
          </div>

          {/* Số lượng & Nút Thêm giỏ hàng góc cạnh Liquid Glass */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              
              {/* Bộ đếm số lượng góc cạnh */}
              <div className="flex items-center border border-neutral-300 rounded-sm overflow-hidden bg-white/80 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-black font-mono text-neutral-900 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentVariant?.stock || 99, quantity + 1))}
                  className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 text-sm font-bold"
                >
                  +
                </button>
              </div>

              {/* Nút Thêm vào giỏ */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 liquid-glass-btn text-neutral-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-600" /> Thêm Vào Giỏ
              </button>
            </div>

            {/* Nút Mua Ngay góc cạnh Liquid Glass */}
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 liquid-glass-btn-accent text-white font-black text-xs uppercase tracking-wider shadow-xl"
            >
              Mua Ngay - Thanh Toán Ngay
            </button>
          </div>

          {/* Quyền lợi mua sắm */}
          <div className="border-t border-neutral-200/60 pt-4 space-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Miễn phí giao hàng toàn quốc cho đơn hàng từ 500.000₫.</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chính sách đổi trả trong vòng 7 ngày kể từ khi hoàn tất giao hàng.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Thông tin chi tiết */}
      <div className="border-t border-neutral-200/80 pt-10">
        <div className="flex border-b border-neutral-200 gap-8 text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition-all relative ${activeTab === 'details' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Chi Tiết Sản Phẩm & Thiết Kế
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={`pb-3 transition-all relative ${activeTab === 'material' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Chất Liệu & Hướng Dẫn Giặt
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`pb-3 transition-all relative ${activeTab === 'policy' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Vận Chuyển & Đổi Trả (Quy Định DB)
          </button>
        </div>

        <div className="py-6 max-w-4xl">
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <h4 className="font-bold text-neutral-900 text-sm">Đặc điểm thiết kế nổi bật</h4>
              <ul className="list-disc pl-5 space-y-2">
                {product.details?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <div className="liquid-glass p-4 rounded-sm border border-amber-300/40 mt-4">
                <p className="text-xs text-amber-950">
                  <strong>Cam kết phát triển bền vững:</strong> Quần áo sử dụng nguyên liệu dệt tái chế giúp giảm thiểu tác động đến môi trường tự nhiên.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Thành phần chất liệu vải:</h4>
                <p>{product.material}</p>
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Cách thức bảo quản & giặt:</h4>
                <p>{product.care_instructions}</p>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="border-b border-neutral-100 pb-3">
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Quy định giao nhận:</h4>
                <p>{product.shipping_info}</p>
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-neutral-900 text-sm mb-1">Quy định đổi trả hàng (Theo CSDL):</h4>
                <p>Khách hàng có thể tạo yêu cầu đổi/trả trực tiếp trên giao diện website trong vòng 7 ngày sau khi đơn hàng chuyển sang trạng thái <strong>Hoàn thành (completed)</strong>.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
