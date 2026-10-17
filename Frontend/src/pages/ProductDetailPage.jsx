import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Truck,
  RefreshCw,
  Heart,
  ShoppingBag,
  Zap,
  Shield,
  Layers,
  Wind,
  Droplets,
  Check,
  ChevronRight,
  Maximize2,
  AlertTriangle,
  Play,
  Share2,
  Grid,
} from 'lucide-react';
import AetherNavbar from '../components/AetherNavbar';
import AetherCartDrawer from '../components/AetherCartDrawer';
import { useCartStore } from '../store/cartStore';
import {
  MOCK_PRODUCTS_WITH_DETAILS,
  MOCK_INVENTORY_AVAILABLE,
  MOCK_PRODUCT_RATINGS,
  MOCK_CATEGORIES,
  MOCK_SIZES,
  MOCK_COLORS,
  MOCK_MATERIALS,
  formatVND,
} from '../data/mockData';
import toast from 'react-hot-toast';

// Chương trình khuyến mãi đang chạy
const ACTIVE_PROMOTIONS = [
  { id: 1, name: 'MÙA ĐÔNG FW/26', discount_percent: 10, product_ids: [1, 2] },
];

// Dữ liệu đánh giá từ khách hàng đã mua
const MOCK_APPROVED_REVIEWS = [
  {
    id: 1,
    product_id: 1,
    customer_name: 'Nguyễn Bích Ngọc',
    rating: 5,
    variant_label: 'Size M / Trắng / Vải Rayon (SKU: AKN-479073-00-M)',
    created_at: '2026-10-14T11:30:00Z',
    content: 'Áo mặc đi làm văn phòng siêu thanh lịch. Vải rayon mềm mại, thoáng mát và phom áo rủ rất sang trọng.',
    is_verified: true,
    media: [
      { type: 'image', url: '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif' },
    ],
  },
  {
    id: 2,
    product_id: 1,
    customer_name: 'Trần Thị Thu Thảo',
    rating: 5,
    variant_label: 'Size L / Beige / Vải Rayon (SKU: AKN-479073-10-L)',
    created_at: '2026-10-15T09:15:00Z',
    content: 'Màu Beige ở ngoài tôn da cực kỳ, mặc nhẹ tênh như không. Rất ưng ý chất liệu này.',
    is_verified: true,
    media: [],
  },
  {
    id: 3,
    product_id: 2,
    customer_name: 'Đặng Tuấn Kiệt',
    rating: 5,
    variant_label: 'Size L / Navy / Lông Cừu Cản Gió (SKU: AKM-486116-69-L)',
    created_at: '2026-10-15T16:00:00Z',
    content: 'Khả năng cản gió của áo này là số một. Đi xe máy mùa đông Hà Nội gió rít mà người vẫn ấm sực.',
    is_verified: true,
    media: [
      { type: 'image', url: '/images/products/nam_demo/san_pham1/vngoods_486116_sub3_3x4.avif' },
    ],
  },
  {
    id: 4,
    product_id: 2,
    customer_name: 'Lê Hoàng Long',
    rating: 5,
    variant_label: 'Size XL / Đen / Lông Cừu Cản Gió (SKU: AKM-486116-09-XL)',
    created_at: '2026-10-16T10:20:00Z',
    content: 'Áo phom thể thao gọn gàng, lớp lót trong mềm mại và giữ nhiệt rất tốt. Đáng tiền!',
    is_verified: true,
    media: [],
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Cart store
  const rawCartItemsStore = useCartStore((state) => state.items);
  const cartItemsStore = Array.isArray(rawCartItemsStore) ? rawCartItemsStore : [];
  const addToCartStore = useCartStore((state) => state.addToCart);
  const updateQuantityStore = useCartStore((state) => state.updateQuantity);
  const removeFromCartStore = useCartStore((state) => state.removeFromCart);
  const [cartOpen, setCartOpen] = useState(false);

  // Tìm sản phẩm khớp theo id hoặc slug
  const product = useMemo(() => {
    return (
      MOCK_PRODUCTS_WITH_DETAILS.find(
        (p) => String(p.id) === String(id) || p.slug === id
      ) || MOCK_PRODUCTS_WITH_DETAILS[0]
    );
  }, [id]);

  // Chương trình khuyến mãi áp dụng (nếu có)
  const activePromo = useMemo(() => {
    return ACTIVE_PROMOTIONS.find((p) => p.product_ids.includes(product.id));
  }, [product]);

  // Đánh giá từ view v_product_rating
  const ratingData = useMemo(() => {
    return MOCK_PRODUCT_RATINGS.find((r) => r.product_id === product.id) || {
      avg_rating: 4.9,
      review_count: 24,
    };
  }, [product]);

  // =========================================================================
  // 1. CHỌN TỔ HỢP: MÀU SẮC (colors) -> KÍCH CỠ (sizes) -> CHẤT LIỆU (materials)
  // =========================================================================

  // Danh sách các Màu sắc (colors) có trong biến thể của sản phẩm
  const availableColors = useMemo(() => {
    const map = new Map();
    product.variants.forEach((v) => {
      const colId = v.color_id || v.color?.id;
      const colName = v.color?.name || v.color || 'Mặc định';
      const hexCode = v.color?.hex_code || '#000000';
      if (!map.has(colId)) {
        map.set(colId, { id: colId, name: colName, hex_code: hexCode });
      }
    });
    return Array.from(map.values());
  }, [product]);

  // Danh sách các Size (sizes)
  const availableSizes = useMemo(() => {
    const map = new Map();
    product.variants.forEach((v) => {
      const sId = v.size_id || v.size?.id;
      const sName = v.size?.name || v.size || 'M';
      if (!map.has(sName)) {
        map.set(sName, { id: sId, name: sName });
      }
    });
    return Array.from(map.values());
  }, [product]);

  // Danh sách Chất liệu (materials)
  const availableMaterials = useMemo(() => {
    const map = new Map();
    product.variants.forEach((v) => {
      const mId = v.material_id || v.material?.id;
      const mName = v.material?.name || v.material || 'Cotton';
      if (!map.has(mName)) {
        map.set(mName, { id: mId, name: mName });
      }
    });
    return Array.from(map.values());
  }, [product]);

  // State các lựa chọn của khách
  const [selectedColorId, setSelectedColorId] = useState(
    availableColors[0]?.id || 1
  );
  const [selectedSizeName, setSelectedSizeName] = useState(
    availableSizes[0]?.name || 'M'
  );
  const [selectedMaterialName, setSelectedMaterialName] = useState(
    availableMaterials[0]?.name || 'Cotton'
  );

  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState('grid'); // 'grid' | 'single' | 'video'

  // Tra cứu product_variants tương ứng với Tổ hợp (Color, Size, Material)
  const currentVariant = useMemo(() => {
    return (
      product.variants.find((v) => {
        const cId = v.color_id || v.color?.id;
        const sName = v.size?.name || v.size;
        const mName = v.material?.name || v.material;
        return (
          cId === selectedColorId &&
          sName === selectedSizeName &&
          (!selectedMaterialName || mName === selectedMaterialName)
        );
      }) ||
      product.variants.find((v) => {
        const cId = v.color_id || v.color?.id;
        const sName = v.size?.name || v.size;
        return cId === selectedColorId && sName === selectedSizeName;
      }) ||
      product.variants.find((v) => {
        const cId = v.color_id || v.color?.id;
        return cId === selectedColorId;
      }) ||
      product.variants[0]
    );
  }, [product, selectedColorId, selectedSizeName, selectedMaterialName]);

  // Tra cứu view v_inventory_available (quantity_available = quantity_on_hand - quantity_reserved)
  const inventoryInfo = useMemo(() => {
    if (!currentVariant) return null;
    return (
      MOCK_INVENTORY_AVAILABLE.find((inv) => inv.variant_id === currentVariant.id) ||
      currentVariant.inventory || {
        quantity_on_hand: 50,
        quantity_reserved: 0,
        quantity_available: 50,
      }
    );
  }, [currentVariant]);

  const quantityAvailable = inventoryInfo?.quantity_available ?? 0;
  const isOutOfStock = quantityAvailable <= 0 || currentVariant?.is_active === false;

  // Tính giá bán thật và giá khuyến mãi (nếu có)
  const truePrice = currentVariant?.price || product.base_price;
  const finalPrice = activePromo
    ? Math.round(truePrice * (1 - activePromo.discount_percent / 100))
    : truePrice;

  // Ảnh hiển thị ưu tiên theo color_id hoặc variant_id của màu đang chọn
  const displayImages = useMemo(() => {
    const list = [...product.images];
    // 1. Ưu tiên ảnh khớp color_id
    const colorMatchedImg = product.images.find((img) => img.color_id === selectedColorId);
    if (colorMatchedImg) {
      return [colorMatchedImg, ...list.filter((img) => img.id !== colorMatchedImg.id)];
    }
    // 2. Ưu tiên ảnh khớp variant_id
    if (currentVariant?.id) {
      const variantImg = product.images.find((img) => img.variant_id === currentVariant.id);
      if (variantImg) {
        return [variantImg, ...list.filter((img) => img.id !== variantImg.id)];
      }
    }
    return list;
  }, [product, currentVariant, selectedColorId]);

  const currentMediaUrl = displayImages[activeMediaIndex]?.url || displayImages[0]?.url || '/placeholder.jpg';

  // Lọc đánh giá đã duyệt của sản phẩm này (status = 'approved')
  const approvedReviews = useMemo(() => {
    return MOCK_APPROVED_REVIEWS.filter((r) => r.product_id === product.id);
  }, [product]);

  // Hành động 1: ADD TO CART
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm hiện đang hết hàng!');
      return;
    }

    addToCartStore({
      variant_id: currentVariant.id,
      product_id: product.id,
      name: product.name,
      sku: currentVariant.sku,
      size: selectedSizeName,
      color: availableColors.find((c) => c.id === selectedColorId)?.name || 'Mặc định',
      material: selectedMaterialName,
      price: finalPrice,
      image: currentMediaUrl,
      stock: quantityAvailable,
      quantity,
    });

    toast.success(`[ĐÃ THÊM] ${quantity}x ${product.name} vào giỏ hàng!`, {
      style: {
        background: '#080808',
        color: '#fafafa',
        border: '1px solid #27272a',
        fontFamily: 'JetBrains Mono',
        fontSize: '11px',
      },
    });
  };

  // Hành động 2: BUY NOW (Chuyển thẳng sang Checkout với cờ is_buy_now = true)
  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm hiện đang hết hàng!');
      return;
    }

    const buyNowItem = {
      variant_id: currentVariant.id,
      product_id: product.id,
      name: product.name,
      sku: currentVariant.sku,
      size: selectedSizeName,
      color: availableColors.find((c) => c.id === selectedColorId)?.name || 'Mặc định',
      material: selectedMaterialName,
      price: finalPrice,
      image: currentMediaUrl,
      quantity,
      stock: quantityAvailable,
    };

    // Lưu vào sessionStorage để Checkout nhận diện luồng Mua Ngay
    sessionStorage.setItem('aether_buy_now_item', JSON.stringify(buyNowItem));
    navigate('/checkout?buy_now=true');
  };

  const totalCartCount = cartItemsStore.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-[#080808] text-[#fafafa] font-inter selection:bg-[#fafafa] selection:text-[#080808] pb-24">
      
      {/* Top Navbar */}
      <AetherNavbar
        categories={MOCK_CATEGORIES}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => {}}
        onScrollToSection={(sec) => {
          if (sec === 'hero' || sec === 'catalog') navigate('/#' + sec);
        }}
      />

      {/* Breadcrumbs (1px Swiss Grid Border) */}
      <div className="pt-14 border-b border-zinc-800 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-zinc-500 tracking-widest uppercase overflow-x-auto">
          <Link to="/" className="hover:text-white transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
          <Link to="/#catalog" className="hover:text-white transition-colors">CATALOG</Link>
          <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
          <span className="text-zinc-400">{product.category?.name || 'THỜI TRANG'}</span>
          <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
          <span className="text-white font-bold truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Container: 2 Cột Swiss Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-zinc-800 bg-[#080808]">
          
          {/* ===================================================================
              CỘT TRÁI (7 COLS): BỐ CỤC 4 ẢNH NHƯ ẢNH CHỤP HOẶC VIDEO MÔ TẢ
          ==================================================================== */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between bg-zinc-950/40">
            
            {/* Header Tabs Media */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-950/90 font-mono text-[10px] tracking-widest text-zinc-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMediaTab('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-all cursor-pointer ${
                    mediaTab === 'grid'
                      ? 'bg-white text-black font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>BỐ CỤC 4 ẢNH</span>
                </button>

                <button
                  onClick={() => setMediaTab('single')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-all cursor-pointer ${
                    mediaTab === 'single'
                      ? 'bg-white text-black font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>PHÓNG TO</span>
                </button>

                <button
                  onClick={() => setMediaTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-all cursor-pointer ${
                    mediaTab === 'video'
                      ? 'bg-amber-400 text-black font-bold shadow-xs'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-900'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>VIDEO MÔ TẢ</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
                <span>SKU: {currentVariant?.sku || '---'}</span>
              </div>
            </div>

            {/* Vùng Media hiển thị */}
            <div className="relative flex-1 min-h-[460px] lg:min-h-[580px] bg-[#080808] p-3 sm:p-4 flex items-center justify-center overflow-hidden">
              
              {/* 1. BỐ CỤC 4 ẢNH (2x2 GRID GIỐNG HỆT ẢNH CHỤP CỦA KHÁCH) */}
              {mediaTab === 'grid' && (
                <div className="grid grid-cols-2 gap-2 w-full h-full max-w-3xl mx-auto">
                  {displayImages.slice(0, 4).map((img, idx) => {
                    const isSelectedColor =
                      img.color_id && img.color_id === selectedColorId;

                    return (
                      <div
                        key={img.id || idx}
                        onClick={() => {
                          setActiveMediaIndex(idx);
                          setMediaTab('single');
                        }}
                        className={`relative aspect-[3/4] overflow-hidden bg-zinc-900 border transition-all cursor-pointer group ${
                          isSelectedColor
                            ? 'border-white ring-1 ring-white/60 shadow-lg'
                            : 'border-zinc-800 hover:border-zinc-500'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} - ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Icon móc treo quần áo góc dưới bên trái (như ảnh chụp) */}
                        {idx < 2 && (
                          <div className="absolute bottom-2.5 left-2.5 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-xs text-white shadow-md">
                            <span>👔</span>
                          </div>
                        )}

                        {/* Tag thông số chiều cao người mẫu góc dưới bên phải */}
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-xs font-mono text-[9px] text-zinc-200 tracking-wide border border-white/10">
                          {img.label || (idx < 2 ? (product.id === 1 ? 'Người mẫu: 168cm / Size quần áo: S' : 'Người mẫu: 176cm / Size quần áo: L') : 'Chi tiết sản phẩm')}
                        </div>

                        {/* Chỉ báo màu đang chọn */}
                        {isSelectedColor && (
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white text-black font-mono text-[9px] font-bold tracking-widest shadow-xs">
                            MÀU ĐANG CHỌN
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. TAB PHÓNG TO ẢNH ĐƠN */}
              {mediaTab === 'single' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  
                  {/* Badge Khuyến mãi nếu có */}
                  {activePromo && (
                    <div className="absolute top-4 right-4 z-10 px-2.5 py-1 border border-rose-500/80 bg-rose-950/40 product-sale-badge font-mono text-[10px] tracking-widest text-rose-300 uppercase shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                      <span>SALE -{activePromo.discount_percent}% // {activePromo.name}</span>
                    </div>
                  )}

                  <div className="relative w-full aspect-[4/3] sm:aspect-[1/1] max-h-[500px] flex items-center justify-center bg-zinc-950 bg-dot-matrix p-8 overflow-hidden border border-zinc-800">
                    <img
                      src={currentMediaUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)] transition-all duration-500"
                    />

                    {/* Tình trạng tồn kho khả dụng v_inventory_available */}
                    <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 border border-zinc-800 bg-black/85 product-stock-badge font-mono text-[10px] tracking-widest flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                      <span className={isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}>
                        {isOutOfStock ? 'HẾT HÀNG TRONG KHO' : `CÒN LẠI: ${quantityAvailable} SẢN PHẨM`}
                      </span>
                    </div>
                  </div>

                  {/* Dải ảnh Thumbnail (1px grid border) */}
                  <div className="w-full border-t border-zinc-800 p-3 bg-zinc-950/60 flex items-center gap-3 overflow-x-auto mt-2">
                    {displayImages.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`relative w-16 h-16 border shrink-0 bg-black p-1 transition-all cursor-pointer ${
                          activeMediaIndex === idx
                            ? 'border-white ring-1 ring-white/50'
                            : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. TAB VIDEO MÔ TẢ SẢN PHẨM */}
              {mediaTab === 'video' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-black">
                  <div className="relative w-full aspect-video max-h-[480px] border border-zinc-800 overflow-hidden shadow-2xl bg-black flex items-center justify-center">
                    <video
                      src={product.video_url || (product.id === 1 ? '/images/products/nu_demo/san_pham1/video_intro.mp4' : '/images/products/nam_demo/san_pham1/video_intro_nam.mp4')}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />

                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/85 border border-zinc-700 font-mono text-[9px] text-amber-400 tracking-widest flex items-center gap-1.5 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>REC // FULL HD 1080P // AETHER CINEMATIC</span>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-zinc-400 mt-3 text-center">
                    Video quay cận cảnh phom dáng thực tế và chi tiết chất liệu khi chuyển động
                  </p>
                </div>
              )}

            </div>

            {/* Dải thông tin dưới cột trái */}
            <div className="border-t border-zinc-800 px-4 py-2.5 bg-zinc-950/80 flex items-center justify-between font-mono text-[10px] text-zinc-400">
              <span>● GIAO HỎA TỐC 2H TRONG NỘI THÀNH</span>
              <span>MIỄN PHÍ ĐỔI TRẢ TRONG 7 NGÀY</span>
            </div>

          </div>

          {/* ===================================================================
              CỘT PHẢI (5 COLS): THÔNG TIN, GIÁ BÁN & BỘ CHỌN TỔ HỢP 3 BƯỚC
          ==================================================================== */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              
              {/* Header: Danh mục & Đánh giá sao v_product_rating */}
              <div className="flex items-center justify-between font-mono text-[11px] border-b border-zinc-800 pb-3">
                <span className="text-zinc-400 uppercase tracking-widest">
                  {product.category?.name || 'TECHWEAR'} // SPEC.v26
                </span>
                
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-white">{ratingData.avg_rating}</span>
                  <span className="text-zinc-500 text-[10px]">({ratingData.review_count} ĐÁNH GIÁ)</span>
                </div>
              </div>

              {/* Tên sản phẩm */}
              <div>
                <h1 className="font-inter font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white leading-tight">
                  {product.name}
                </h1>
                <p className="font-mono text-xs text-zinc-400 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Giá Bán Thật: product_variants.price & Khuyến mãi */}
              <div className="border border-zinc-800 bg-zinc-950/80 p-4 font-mono space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                  GIÁ BÁN CHÍNH THỨC
                </span>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                    {formatVND(finalPrice)}
                  </span>

                  {activePromo && (
                    <span className="text-sm text-zinc-500 line-through">
                      {formatVND(truePrice)}
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 pt-1 flex items-center justify-between">
                  <span>* Cam kết chính hãng 100% từ Aether Labs</span>
                  <span className="text-emerald-400">MIỄN PHÍ VẬN CHUYỂN TỪ 500.000₫</span>
                </div>
              </div>

              {/* =================================================================
                  BỘ CHỌN TỔ HỢP 3 BƯỚC: MÀU SẮC -> KÍCH CỠ -> CHẤT LIỆU
              ================================================================== */}
              <div className="space-y-4 border-t border-zinc-800 pt-5">
                
                {/* 1. MÀU SẮC: Hiển thị ô màu và tên màu */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-400 uppercase tracking-widest">
                      1. MÀU SẮC:
                    </span>
                    <span className="text-white font-bold">
                      {availableColors.find((c) => c.id === selectedColorId)?.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((col) => {
                      const isSelected = selectedColorId === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => {
                            setSelectedColorId(col.id);
                            setActiveMediaIndex(0);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? 'border-white bg-white text-black dark:border-white dark:bg-white dark:text-black shadow-md'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:text-white'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: col.hex_code }}
                            className="w-3.5 h-3.5 border border-zinc-400 inline-block shrink-0 shadow-2xs"
                          />
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. KÍCH CỠ: Ô vuông kích cỡ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-400 uppercase tracking-widest">
                      2. KÍCH CỠ:
                    </span>
                    <span className="text-white font-bold">{selectedSizeName}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => {
                      const isSelected = selectedSizeName === sz.name;
                      return (
                        <button
                          key={sz.name}
                          onClick={() => setSelectedSizeName(sz.name)}
                          className={`min-w-[44px] py-2 px-3 border font-mono text-xs font-bold tracking-wider transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-black shadow-md'
                              : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                          }`}
                        >
                          {sz.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CHẤT LIỆU: Ô chất liệu */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-400 uppercase tracking-widest">
                      3. CHẤT LIỆU:
                    </span>
                    <span className="text-white font-bold">{selectedMaterialName}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableMaterials.map((mat) => {
                      const isSelected = selectedMaterialName === mat.name;
                      return (
                        <button
                          key={mat.name}
                          onClick={() => setSelectedMaterialName(mat.name)}
                          className={`px-3 py-1.5 border font-mono text-[11px] tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? 'border-white bg-white text-black font-bold shadow-md'
                              : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                          }`}
                        >
                          {mat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Hiển thị SKU & Chi tiết Tình trạng tồn kho */}
              <div className="p-3 border border-zinc-800 bg-zinc-950 font-mono text-[10px] space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>MÃ SẢN PHẨM (SKU):</span>
                  <span className="text-white font-bold">{currentVariant.sku}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>TÌNH TRẠNG:</span>
                  <span className="text-zinc-300">{isOutOfStock ? 'TẠM HẾT HÀNG' : 'CÒN HÀNG TRONG KHO'}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-900 pt-1">
                  <span>SẴN SÀNG GIAO:</span>
                  <span>{quantityAvailable} SẢN PHẨM</span>
                </div>
              </div>

              {/* Bộ chọn số lượng */}
              <div className="flex items-center gap-4 pt-2">
                <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
                  SỐ LƯỢNG:
                </span>
                <div className="flex items-center border border-zinc-800 font-mono text-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-white font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(quantityAvailable, q + 1))}
                    disabled={isOutOfStock || quantity >= quantityAvailable}
                    className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* ===================================================================
                2 NÚT HÀNH ĐỘNG: ADD TO CART & BUY NOW
            ==================================================================== */}
            <div className="space-y-3 pt-6 border-t border-zinc-800">
              
              {isOutOfStock ? (
                <div className="w-full py-4 border border-rose-500/50 bg-rose-950/20 text-rose-400 font-mono text-center text-xs font-bold tracking-widest uppercase">
                  [ HẾT HÀNG TRONG KHO ]
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Nút 1: ADD TO CART */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 border border-zinc-700 bg-black hover:border-white hover:bg-zinc-900 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:translate-y-0.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>THÊM VÀO GIỎ HÀNG</span>
                  </button>

                  {/* Nút 2: BUY NOW (chuyển thẳng sang Checkout với orders.is_buy_now = true) */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl active:translate-y-0.5"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>MUA NGAY</span>
                  </button>

                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  MIỄN PHÍ TỪ 500.000₫
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                  ĐỔI TRẢ TRONG 7 NGÀY
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  BẢO HÀNH TRỌN ĐỜI
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================================
            KHU VỰC REVIEWS (reviews & review_media: status = 'approved')
        ====================================================================== */}
        <div className="mt-12 border border-zinc-800 bg-[#080808]">
          
          {/* Header Reviews */}
          <div className="p-6 sm:p-8 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase block">
                ĐÁNH GIÁ KHÁCH HÀNG // CUSTOMER REVIEWS
              </span>
              <h3 className="font-inter font-black text-2xl text-white tracking-tight mt-1">
                Đánh giá từ khách hàng đã mua
              </h3>
            </div>

            <div className="flex items-center gap-4 border border-zinc-800 p-3 bg-zinc-950 font-mono text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-5 h-5 fill-amber-400" />
                <span className="text-xl font-black text-white">{ratingData.avg_rating}</span>
                <span className="text-zinc-500">/ 5.0</span>
              </div>
              <div className="h-6 w-[1px] bg-zinc-800" />
              <div className="text-zinc-400">
                TỔNG CỘNG <strong className="text-white">{ratingData.review_count}</strong> LƯỢT ĐÁNH GIÁ ĐÃ DUYỆT
              </div>
            </div>
          </div>

          {/* Danh sách Đánh giá */}
          <div className="divide-y divide-zinc-800">
            {approvedReviews.length === 0 ? (
              <div className="p-12 text-center font-mono text-xs text-zinc-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            ) : (
              approvedReviews.map((rev) => (
                <div key={rev.id} className="p-6 sm:p-8 space-y-3">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white uppercase">{rev.customer_name}</span>
                      {rev.is_verified && (
                        <span className="px-2 py-0.5 border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 text-[10px] tracking-wider">
                          ✓ ĐÃ MUA HÀNG (VERIFIED)
                        </span>
                      )}
                    </div>

                    <span className="text-zinc-500 text-[11px]">
                      {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Sao đánh giá & Biến thể */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">
                      // {rev.variant_label}
                    </span>
                  </div>

                  {/* Nội dung đánh giá */}
                  <p className="font-mono text-xs text-zinc-300 leading-relaxed pt-1">
                    "{rev.content}"
                  </p>

                  {/* Ảnh đính kèm (review_media) */}
                  {rev.media?.length > 0 && (
                    <div className="pt-2 flex gap-3">
                      {rev.media.map((med, mIdx) => (
                        <div
                          key={mIdx}
                          className="w-16 h-16 sm:w-20 sm:h-20 border border-zinc-800 bg-zinc-950 overflow-hidden"
                        >
                          <img
                            src={med.url}
                            alt="Media đính kèm đánh giá"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* Slide-out Cart Drawer */}
      <AetherCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItemsStore}
        onUpdateQuantity={updateQuantityStore}
        onRemoveItem={removeFromCartStore}
      />

    </div>
  );
}
