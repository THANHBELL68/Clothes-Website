import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, Heart, ShoppingBag, Check, Play, FileText, Info } from 'lucide-react';
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
      
      {/* Breadcrumb */}
      <nav className="text-xs font-medium text-neutral-400 flex items-center gap-2">
        <Link to="/" className="hover:text-neutral-700">Trang chủ</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_id}`} className="hover:text-neutral-700">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Section: Gallery + Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Media Gallery (Support Image + Video Player) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {mediaList.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveMedia(item)}
                className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeMedia.url === item.url
                    ? 'border-neutral-900 shadow-md scale-95'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-white p-1">
                    <Play className="w-4 h-4 fill-current text-rose-500" />
                    <span className="text-[9px] font-bold mt-1 uppercase">Video</span>
                  </div>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>

          {/* Main Display Viewer */}
          <div className="flex-1 aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden relative border border-neutral-200">
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

            {product.code && (
              <span className="absolute top-4 left-4 bg-neutral-900/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                Mã: {product.code}
              </span>
            )}
          </div>

        </div>

        {/* Right Column: Product Details & Purchase Form */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                {product.category_name}
              </span>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 rounded-full border ${isFav ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-neutral-200 text-neutral-500 hover:text-rose-500'}`}
                title="Lưu yêu thích"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-2 leading-snug">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-neutral-400 font-normal">({product.reviews_count} đánh giá)</span>
              </div>
              <span className="text-neutral-300">|</span>
              <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Có sẵn tại kho
              </span>
            </div>

            {/* Giá */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-neutral-900">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-xs text-neutral-400">Đã bao gồm thuế VAT</span>
            </div>
          </div>

          <p className="text-neutral-600 text-sm leading-relaxed border-t border-neutral-100 pt-4">
            {product.short_desc}
          </p>

          {/* Chọn Màu Sắc (bảng product_variants.color) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800">Màu sắc: <span className="font-semibold text-neutral-500">{selectedColor}</span></span>
            </div>

            <div className="flex items-center gap-3">
              {availableColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setSelectedColor(c.color)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    selectedColor === c.color
                      ? 'border-neutral-900 bg-neutral-50 text-neutral-900 shadow-xs'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border ${c.border ? 'border-neutral-300' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color_code || '#000' }}
                  />
                  <span>{c.color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Size (bảng product_variants.size) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800">Kích thước (Size):</span>
              <span className="text-amber-600 font-semibold cursor-pointer hover:underline">Hướng dẫn chọn size</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    selectedSize === size
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                      : 'border-neutral-200 text-neutral-800 hover:border-neutral-400 bg-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Hiển thị số lượng tồn kho (bảng product_variants.stock) */}
          <div className="text-xs text-neutral-500 flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <span>Mã SKU: <strong className="font-mono text-neutral-800">{currentVariant?.sku}</strong></span>
            <span>Tồn kho: <strong className="text-amber-700">{currentVariant?.stock} chiếc</strong></span>
          </div>

          {/* Số lượng & Nút Thêm giỏ hàng */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              
              {/* Bộ đếm số lượng */}
              <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-neutral-900 min-w-8 text-center">
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
                className="flex-1 py-3 px-6 rounded-xl border-2 border-neutral-900 text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" /> Thêm Vào Giỏ
              </button>
            </div>

            {/* Nút Mua Ngay */}
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-lg hover:shadow-neutral-900/20 transition-all"
            >
              Mua Ngay - Thanh Toán
            </button>
          </div>

          {/* Quyền lợi mua sắm */}
          <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Miễn phí giao hàng cho đơn từ 500.000₫ toàn quốc.</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chính sách đổi trả trong vòng 7 ngày kể từ khi đơn hoàn thành.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Thông tin chi tiết lấy từ file pro_detail/sanpham1.txt */}
      <div className="border-t border-neutral-200 pt-12">
        <div className="flex border-b border-neutral-200 gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 transition-all relative ${activeTab === 'details' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Chi Tiết Sản Phẩm & Chức Năng
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={`pb-4 transition-all relative ${activeTab === 'material' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Chất Liệu & Cách Chăm Sóc
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`pb-4 transition-all relative ${activeTab === 'policy' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Vận Chuyển & Đổi Trả (Quy Định CSDL)
          </button>
        </div>

        <div className="py-8 max-w-4xl">
          {activeTab === 'details' && (
            <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
              <h4 className="font-bold text-neutral-900 text-base">Đặc điểm thiết kế</h4>
              <ul className="list-disc pl-5 space-y-2">
                {product.details?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/50 mt-4">
                <p className="text-xs text-amber-900">
                  <strong>Cam kết bảo vệ môi trường:</strong> Quần áo sử dụng vật liệu tái chế là một phần trong nỗ lực của chúng tôi nhằm hỗ trợ giảm thiểu chất thải và bảo vệ tài nguyên thiên nhiên.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-4 text-sm text-neutral-700">
              <div>
                <h4 className="font-bold text-neutral-900 text-base mb-1">Thành phần chất liệu:</h4>
                <p>{product.material}</p>
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-neutral-900 text-base mb-1">Hướng dẫn bảo quản & giặt:</h4>
                <p>{product.care_instructions}</p>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
              <div className="border-b border-neutral-100 pb-3">
                <h4 className="font-bold text-neutral-900 text-base mb-1">Quy định giao hàng:</h4>
                <p>{product.shipping_info}</p>
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-neutral-900 text-base mb-1">Quy định đổi trả hàng (Theo Trigger DB):</h4>
                <p>Khách hàng thành viên có quyền gửi yêu cầu đổi/trả trực tiếp trên giao diện website trong vòng 7 ngày kể từ khi đơn hàng đạt trạng thái <strong>Hoàn thành (completed)</strong>.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

