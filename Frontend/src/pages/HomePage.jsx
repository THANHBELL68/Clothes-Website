import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  Shield,
  Layers,
  Wind,
  Droplets,
  Plus,
  Check,
  Maximize2,
  Sparkles,
  ExternalLink,
  Star,
  RotateCcw,
  ShoppingBag,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';
import AetherNavbar from '../components/AetherNavbar';
import AetherStickySidebar from '../components/AetherStickySidebar';
import AetherCartDrawer from '../components/AetherCartDrawer';
import AetherSearchModal from '../components/AetherSearchModal';
import AetherQuickViewModal from '../components/AetherQuickViewModal';
import { useCartStore } from '../store/cartStore';
import {
  MOCK_CATEGORIES,
  MOCK_SIZES,
  MOCK_COLORS,
  MOCK_MATERIALS,
  MOCK_PRODUCTS_WITH_DETAILS,
  MOCK_INVENTORY_AVAILABLE,
  MOCK_PRODUCT_RATINGS,
  formatVND,
} from '../data/mockData';
import {
  HERO_FLOATING_CARDS,
  CRAFTSMANSHIP_PILLARS,
  COMMUNITY_FIT_CHECKS,
  MARQUEE_ITEMS,
} from '../data/aetherData';
import toast from 'react-hot-toast';

// Chương trình khuyến mãi đang chạy
const ACTIVE_PROMOTIONS = [
  { id: 1, name: 'MÙA ĐÔNG FW/26', discount_percent: 10, product_ids: [1, 2] },
];

export default function HomePage() {
  const navigate = useNavigate();

  // Store giỏ hàng & sản phẩm yêu thích
  const rawCartItemsStore = useCartStore((state) => state.items);
  const cartItemsStore = Array.isArray(rawCartItemsStore) ? rawCartItemsStore : [];
  const addToCartStore = useCartStore((state) => state.addToCart);
  const updateQuantityStore = useCartStore((state) => state.updateQuantity);
  const removeFromCartStore = useCartStore((state) => state.removeFromCart);

  // Danh sách Wishlist lưu cục bộ
  const [wishlist, setWishlist] = useState([1, 4]);

  // Section theo dõi hiện tại cho Right Sticky Sidebar
  const [activeSection, setActiveSection] = useState('hero');

  // Modals state
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inspectGarment, setInspectGarment] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Bộ lọc Catalog (Section 01 / CATALOG GRID)
  const [selectedCategory, setSelectedCategory] = useState(null); // slug hoặc null
  const [selectedSize, setSelectedSize] = useState(null); // 'S', 'M', 'L', 'XL', '29', '30', '31'
  const [selectedColorId, setSelectedColorId] = useState(null); // number ID
  const [selectedMaterialName, setSelectedMaterialName] = useState(null); // 'Cotton', 'Denim', etc.

  // State màu sắc đang được chọn cho từng ô sản phẩm trên Grid (productId -> colorId)
  const [cardSelectedColor, setCardSelectedColor] = useState({
    1: 1, // Áo Rayon Nữ -> Màu Trắng (color 1)
    2: 3, // Áo Khoác Lông Cừu Nam -> Màu Navy (color 3)
  });

  // Tính tổng số lượng trong giỏ hàng
  const totalCartCount = useMemo(() => {
    return cartItemsStore.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  }, [cartItemsStore]);

  // Cuộn trang mượt
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lắng nghe scroll để cập nhật activeSection cho Right Sidebar (HERO, CATALOG, CRAFTSMANSHIP, REVIEWS, FOOTER)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 3;
      const sections = [
        { id: 'hero' },
        { id: 'catalog' },
        { id: 'craftsmanship' },
        { id: 'reviews' },
        { id: 'footer' },
      ];

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phím tắt ⌘K mở tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lọc sản phẩm theo Category, Size, Color, Material
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS_WITH_DETAILS.filter((prod) => {
      // 1. Lọc theo Danh mục (categories.slug)
      if (selectedCategory && prod.category?.slug !== selectedCategory) {
        return false;
      }

      // 2. Lọc theo Kích thước (sizes.name)
      if (selectedSize) {
        const hasSize = prod.variants.some((v) => {
          const sName = v.size?.name || v.size;
          return sName === selectedSize;
        });
        if (!hasSize) return false;
      }

      // 3. Lọc theo Màu sắc (colors.id)
      if (selectedColorId) {
        const hasColor = prod.variants.some((v) => {
          const cId = v.color_id || v.color?.id;
          return cId === selectedColorId;
        });
        if (!hasColor) return false;
      }

      // 4. Lọc theo Chất liệu (materials.name)
      if (selectedMaterialName) {
        const hasMaterial = prod.variants.some((v) => {
          const mName = v.material?.name || v.material;
          return mName?.toLowerCase().includes(selectedMaterialName.toLowerCase());
        });
        if (!hasMaterial) return false;
      }

      return true;
    });
  }, [selectedCategory, selectedSize, selectedColorId, selectedMaterialName]);

  // Đổi màu sắc hiển thị của một thẻ sản phẩm
  const handleSelectCardColor = (productId, colorId) => {
    setCardSelectedColor((prev) => ({
      ...prev,
      [productId]: colorId,
    }));
  };

  // Lấy ảnh hiển thị theo màu/biến thể đã chọn (product_images.variant_id)
  const getProductDisplayImage = (product) => {
    const activeColorId = cardSelectedColor[product.id];
    if (activeColorId) {
      // 1. Ưu tiên tìm ảnh có color_id khớp trực tiếp
      const imgByColor = product.images?.find((img) => img.color_id === activeColorId);
      if (imgByColor) return typeof imgByColor === 'string' ? imgByColor : imgByColor.url;

      // 2. Tìm qua các biến thể có color_id khớp
      const matchedVariants = product.variants?.filter((v) => (v.color_id || v.color?.id) === activeColorId);
      if (matchedVariants?.length) {
        for (const mv of matchedVariants) {
          const imgByVar = product.images?.find((img) => img.variant_id === mv.id);
          if (imgByVar) return typeof imgByVar === 'string' ? imgByVar : imgByVar.url;
        }
      }
    }
    const firstImg = product.images?.[0];
    return typeof firstImg === 'string' ? firstImg : firstImg?.url || product.image || '/placeholder.jpg';
  };

  // Thêm nhanh vào giỏ hàng
  const handleQuickAdd = (product) => {
    const activeColorId = cardSelectedColor[product.id];
    const targetVariant =
      product.variants.find((v) => (v.color_id || v.color?.id) === activeColorId) ||
      product.variants[0];

    const sizeName = targetVariant?.size?.name || targetVariant?.size || 'M';
    const colorName = targetVariant?.color?.name || targetVariant?.color || 'Đen';
    const displayImg = getProductDisplayImage(product);
    const stockAvailable =
      targetVariant?.inventory?.quantity_available ?? targetVariant?.stock ?? 30;

    addToCartStore({
      variant_id: targetVariant.id,
      product_id: product.id,
      name: product.name,
      sku: targetVariant.sku,
      size: sizeName,
      color: colorName,
      price: targetVariant.price || product.base_price,
      image: displayImg,
      stock: stockAvailable,
      quantity: 1,
    });

    toast.success(`[ĐÃ THÊM] ${product.name} (${sizeName} - ${colorName})`, {
      style: {
        background: '#080808',
        color: '#fafafa',
        border: '1px solid #27272a',
        fontFamily: 'JetBrains Mono',
        fontSize: '11px',
      },
    });
  };

  // Bật/tắt wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      toast(exists ? '[ĐÃ XÓA KHỎI WISHLIST]' : '[ĐÃ LƯU VÀO WISHLIST]', {
        style: {
          background: '#080808',
          color: '#fafafa',
          border: '1px solid #27272a',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
        },
      });
      return updated;
    });
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setSelectedColorId(null);
    setSelectedMaterialName(null);
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedSize) ||
    Boolean(selectedColorId) ||
    Boolean(selectedMaterialName);

  return (
    <div className="relative w-full min-h-screen bg-[#080808] text-[#fafafa] font-inter overflow-x-hidden selection:bg-[#fafafa] selection:text-[#080808] lg:pr-14">
      
      {/* 1. TOP NAVBAR (1PX GRID) */}
      <AetherNavbar
        categories={MOCK_CATEGORIES}
        activeCategory={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* RIGHT STICKY SIDEBAR (5 SECTIONS: HERO, CATALOG, CRAFTSMANSHIP, REVIEWS, FOOTER) */}
      <AetherStickySidebar
        activeSection={activeSection}
        onScrollToSection={scrollToSection}
      />

      {/* =========================================================================
          2. HERO SECTION (FLOATING LOOKBOOK - GETARTCRAFT PARALLAX)
      ========================================================================== */}
      <section
        id="hero"
        className="relative min-h-screen w-full flex items-center justify-center px-4 pt-20 pb-16 overflow-hidden border-b border-zinc-800"
      >
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 bg-grid-tech pointer-events-none opacity-40" />

        {/* 12-14 Thẻ hình ảnh người mẫu trôi nổi ở nền sau (Framer Motion 3D Floating) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {HERO_FLOATING_CARDS.map((card) => (
            <motion.div
              key={card.id}
              style={{
                position: 'absolute',
                ...card.pos,
                zIndex: card.depth,
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: 0.82,
                scale: 1,
                y: [0, -12, 0],
                rotate: [card.rotate, card.rotate + 1.5, card.rotate],
              }}
              transition={{
                y: {
                  duration: card.floatDuration || 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: card.floatDelay || 0,
                },
                rotate: {
                  duration: (card.floatDuration || 6) * 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: card.floatDelay || 0,
                },
                opacity: { duration: 1 },
              }}
              className={`${card.width} ${card.aspect} border border-zinc-800/80 bg-zinc-950/60 rounded-md overflow-hidden shadow-2xl backdrop-blur-xs hero-floating-card`}
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.92]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                <span className="font-mono text-[9px] text-zinc-300 tracking-wider">
                  {card.tag}
                </span>
                <span className="font-mono text-[10px] font-bold text-white tracking-widest truncate">
                  {card.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lớp phủ Radial-Gradient điều chỉnh mượt theo giao diện Sáng / Tối */}
        <div className="absolute inset-0 pointer-events-none hero-radial-mask" />

        {/* Khối chữ trung tâm */}
        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-7 px-4">
          
          {/* Top Micro Monospace Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-3 py-1 border border-zinc-800 bg-zinc-950/80 font-mono text-[10px] sm:text-[11px] tracking-widest text-[#a1a1aa] uppercase"
          >
            <span className="w-1.5 h-1.5 bg-[#fafafa] animate-pulse" />
            <span>BỘ SƯU TẬP FW/26 // PHIÊN BẢN GIỚI HẠN</span>
            <span className="text-zinc-700">//</span>
            <span className="text-white">AETHER LABS</span>
          </motion.div>

          {/* Tên thương hiệu lớn: Inter Bold tracking-tight */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="font-inter font-black text-6xl sm:text-8xl lg:text-9xl tracking-tight text-[#fafafa] uppercase leading-none drop-shadow-2xl select-none"
          >
            AETHER LABS
          </motion.h1>

          {/* Dòng Tagline có nhấn nhá Instrument Serif in nghiêng */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-inter text-base sm:text-xl lg:text-2xl text-[#a1a1aa] font-light max-w-2xl mx-auto leading-relaxed"
          >
            Trang phục kỹ thuật cao cho{' '}
            <span className="font-serif italic font-normal text-zinc-100 text-2xl sm:text-3xl">
              thế hệ dịch chuyển
            </span>
            .
          </motion.p>

          {/* 2 Nút Bấm CTA Chuẩn Phong Cách GetArtCraft */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-4"
          >
            {/* Nút 1: MUA BỘ SƯU TẬP MỚI (Nền trắng chữ đen) */}
            <button
              onClick={() => scrollToSection('catalog')}
              className="px-8 py-4 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>MUA BỘ SƯU TẬP MỚI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Nút 2: KHÁM PHÁ CHẤT LIỆU (Nền đen viền mảnh 1px) */}
            <button
              onClick={() => scrollToSection('craftsmanship')}
              className="px-8 py-4 bg-[#080808] text-[#fafafa] border border-zinc-700 hover:border-[#fafafa] font-mono text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer hover:bg-zinc-900/60 hero-sec-btn"
            >
              <span>KHÁM PHÁ CHẤT LIỆU</span>
            </button>
          </motion.div>

          {/* Dòng chữ monospace nhỏ bên dưới nút bấm */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-3 font-mono text-[10px] sm:text-[11px] tracking-widest text-zinc-500 uppercase"
          >
            GIAO HÀNG MIỄN PHÍ TOÀN QUỐC // VẢI KỸ THUẬT CAO // PHIÊN BẢN GIỚI HẠN
          </motion.div>

        </div>

        {/* Scroll Down Cue */}
        <button
          onClick={() => scrollToSection('catalog')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-colors cursor-pointer group"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase group-hover:text-zinc-300">
            CUỘN ĐỂ XEM CATALOG
          </span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-zinc-400" />
        </button>

      </section>

      {/* =========================================================================
          3. INFINITE MARQUEE TICKER (DÒNG CHỮ CHẠY NGANG LIÊN TỤC)
      ========================================================================== */}
      <div className="relative w-full overflow-hidden bg-[#080808] border-b border-zinc-800 py-3.5 z-20">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-mono text-[11px] font-bold tracking-widest text-[#a1a1aa] uppercase select-none">
          {[1, 2, 3].map((loop) => (
            <React.Fragment key={loop}>
              {MARQUEE_ITEMS.map((item, idx) => (
                <span key={`${loop}-${idx}`} className="flex items-center gap-8">
                  <span className="text-white hover:text-amber-400 transition-colors">{item}</span>
                  <span className="text-zinc-700">—</span>
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. SECTION 01 / CATALOG GRID (LƯỚI SẢN PHẨM & BỘ LỌC 1PX THEO SCHEMA DB)
      ========================================================================== */}
      <section id="catalog" className="w-full border-b border-zinc-800">
        
        {/* Section Header */}
        <div className="px-4 sm:px-8 lg:px-12 py-14 border-b border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase block">
              01 // DANH MỤC SẢN PHẨM (CATALOG)
            </span>
            <h2 className="font-inter font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#fafafa] leading-[1.08]">
              Trang phục kỹ thuật <span className="font-serif italic font-normal text-zinc-300">vượt thời gian</span>.
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right font-mono text-[11px] text-zinc-400 space-y-1">
            <div>BỘ SƯU TẬP // THU ĐÔNG 2026</div>
            <div className="text-zinc-500">CHẤT LIỆU CAO CẤP // CHỐNG GIÓ VÀ GIỮ NHIỆT</div>
            <div className="text-emerald-400">● TỒN KHO THỰC TẾ // GIAO HỎA TỐC</div>
          </div>
        </div>

        {/* =====================================================================
            FILTER BAR (DẠNG VÁCH NGĂN 1PX LIỀN MẠCH THEO PHONG CÁCH SWISS GRID)
        ====================================================================== */}
        <div className="border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex flex-col xl:flex-row items-stretch divide-y xl:divide-y-0 xl:divide-x divide-zinc-800 text-[11px] font-mono">
            
            {/* 1. Lọc Danh Mục */}
            <div className="flex items-center px-4 py-2.5 gap-2 shrink-0 overflow-x-auto">
              <span className="text-zinc-500 font-bold uppercase shrink-0">DANH MỤC:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                  !selectedCategory
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                TẤT CẢ
              </button>
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1 uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.slug
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* 2. Lọc Kích Thước (Chỉ size áo S, M, L, XL - không có size quần) */}
            <div className="flex items-center px-4 py-2.5 gap-2 shrink-0 overflow-x-auto">
              <span className="text-zinc-500 font-bold uppercase shrink-0">SIZE:</span>
              <button
                onClick={() => setSelectedSize(null)}
                className={`px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                  !selectedSize
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                TẤT CẢ
              </button>
              {MOCK_SIZES.map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => setSelectedSize(sz.name)}
                  className={`min-w-[28px] text-center px-2 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                    selectedSize === sz.name
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  {sz.name}
                </button>
              ))}
            </div>

            {/* 3. Lọc Màu Sắc (Viền nổi bật cho màu đen) */}
            <div className="flex items-center px-4 py-2.5 gap-2.5 shrink-0 overflow-x-auto">
              <span className="text-zinc-500 font-bold uppercase shrink-0">MÀU:</span>
              <button
                onClick={() => setSelectedColorId(null)}
                className={`px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                  !selectedColorId
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                TẤT CẢ
              </button>
              <div className="flex items-center gap-2">
                {MOCK_COLORS.map((col) => {
                  const isBlack = col.hex_code.toUpperCase() === '#000000';
                  const isSelected = selectedColorId === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setSelectedColorId(col.id)}
                      style={{ backgroundColor: col.hex_code }}
                      className={`w-5 h-5 transition-all cursor-pointer ${
                        isSelected
                          ? 'scale-110 ring-2 ring-white shadow-md'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      } ${
                        isBlack
                          ? 'border-2 border-zinc-500 ring-1 ring-zinc-700'
                          : 'border border-zinc-600'
                      }`}
                      title={col.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* 4. Lọc Chất Liệu */}
            <div className="flex items-center px-4 py-2.5 gap-2 shrink-0 overflow-x-auto">
              <span className="text-zinc-500 font-bold uppercase shrink-0">VẢI:</span>
              {['TẤT CẢ', 'RAYON', 'LÔNG CỪU'].map((mat) => {
                const val = mat === 'TẤT CẢ' ? null : (mat === 'RAYON' ? 'Rayon' : 'Lông cừu');
                const isActive = (val === null && selectedMaterialName === null) ||
                  (val !== null && selectedMaterialName === val);
                return (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterialName(val)}
                    className={`px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>

            {/* 5. Bộ Đếm Sản Phẩm & Nút Đặt Lại */}
            <div className="flex-1 flex items-center justify-between xl:justify-end px-4 py-2.5 gap-4">
              <span className="text-zinc-400 font-mono">
                HIỂN THỊ <strong className="text-white">{filteredProducts.length}</strong> / 2 SẢN PHẨM
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ĐẶT LẠI</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* =====================================================================
            PRODUCT 2x1 EXPOSED 1PX BORDER GRID (CHỈ 2 SẢN PHẨM NAM & NỮ)
        ====================================================================== */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center font-mono text-xs text-zinc-500 space-y-3">
            <p>KHÔNG CÓ SẢN PHẨM NÀO KHỚP VỚI BỘ LỌC ĐÃ CHỌN.</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-zinc-800 text-white hover:bg-zinc-900 tracking-widest uppercase cursor-pointer"
            >
              [ XÓA TẤT CẢ BỘ LỌC ]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-b border-zinc-800">
            {filteredProducts.map((garment, index) => {
              // Điểm đánh giá từ v_product_rating
              const ratingData =
                MOCK_PRODUCT_RATINGS.find((r) => r.product_id === garment.id) || garment.rating;
              
              // Khuyến mãi còn hiệu lực
              const activePromo = ACTIVE_PROMOTIONS.find((p) => p.product_ids.includes(garment.id));

              // Tồn kho khả dụng của biến thể đang được chọn
              const activeColorId = cardSelectedColor[garment.id];
              const activeVariant =
                garment.variants.find((v) => (v.color_id || v.color?.id) === activeColorId) ||
                garment.variants[0];
              const quantityAvailable =
                activeVariant?.inventory?.quantity_available ?? activeVariant?.stock ?? 30;

              // Ảnh hiển thị theo màu đang chọn
              const displayImage = getProductDisplayImage(garment);

              return (
                <div
                  key={garment.id}
                  className="group relative flex flex-col justify-between bg-[#080808] transition-colors duration-300 hover:bg-zinc-950/40"
                >
                  
                  {/* Header nhỏ trên cùng: Căn đều lề chuẩn xác cho cả 2 cột */}
                  <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between font-mono text-[11px] tracking-widest text-[#a1a1aa] bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white" />
                      <span className="text-white font-bold uppercase">
                        {String(index + 1).padStart(2, '0')} // {garment.id === 1 ? 'ÁO NỮ' : 'ÁO NAM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Điểm đánh giá */}
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-white">
                          {ratingData?.avg_rating || 5.0}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          ({ratingData?.review_count || 12})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phần giữa: Ảnh sản phẩm đặt trên nền lưới chấm bi mờ (dot matrix background) */}
                  <div
                    onClick={() => setInspectGarment(garment)}
                    className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-zinc-950 bg-dot-matrix p-8 sm:p-12 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    {/* Badge Giảm Giá Monospace nếu có khuyến mãi */}
                    {activePromo && (
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 border border-rose-500/80 bg-rose-950/40 product-sale-badge font-mono text-[10px] tracking-widest text-rose-300 uppercase shadow-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                        <span>SALE -{activePromo.discount_percent}% // {activePromo.name}</span>
                      </div>
                    )}

                    {/* Badge Tồn Kho Khả Dụng */}
                    <div className="absolute top-4 right-4 z-10 px-2.5 py-1 border border-zinc-800 bg-black/80 product-stock-badge font-mono text-[9px] tracking-widest text-emerald-400 uppercase flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>CÒN {quantityAvailable} CHIẾC</span>
                    </div>

                    {/* Ảnh Sản Phẩm - Luôn rõ nét, không bị làm mờ */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={displayImage}
                        alt={garment.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Thanh Nút Hành Động Ở Biên Dưới - KHÔNG LÀM MỜ ẢNH NGƯỜI MẪU */}
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-center gap-2.5 z-20 product-card-action-bar">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectGarment(garment);
                        }}
                        className="flex-1 py-2.5 px-3 bg-[#080808]/90 border border-zinc-700 hover:border-white hover:bg-zinc-900 text-white product-card-btn-view font-mono text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>XEM CHI TIẾT</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(garment);
                        }}
                        className="flex-1 py-2.5 px-3 bg-white text-black hover:bg-zinc-200 product-card-btn-add font-mono text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>+ THÊM NHANH</span>
                      </button>
                    </div>

                  </div>

                  {/* Phần dưới: Tên sản phẩm, Giá 'TỪ ...', Chấm màu và Thông số vải */}
                  <div className="p-5 sm:p-6 border-t border-zinc-800 space-y-4 bg-[#080808]">
                    
                    {/* Hàng Tiêu đề & Giá bán */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-zinc-500 tracking-wider block">
                          SKU: {activeVariant?.sku || `ITEM-0${garment.id}`}
                        </span>
                        <h3 className="font-inter font-bold text-base sm:text-lg text-[#fafafa] leading-tight hover:text-zinc-300 transition-colors">
                          {garment.name}
                        </h3>
                      </div>

                      {/* Giá tiền: 'TỪ ' + products.base_price */}
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">GIÁ GỐC</span>
                        <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                          TỪ {formatVND(garment.base_price)}
                        </span>
                      </div>
                    </div>

                    {/* Mô tả thông số vải ngắn gọn */}
                    <p className="font-mono text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {garment.description}
                    </p>

                    {/* Hàng Chọn Màu Sắc (Đổi ảnh theo product_images.variant_id) & Nút Wishlist */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                      
                      {/* Chọn màu sắc tương tác */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500 uppercase">MÀU:</span>
                        <div className="flex items-center gap-2">
                          {Array.from(
                            new Map(garment.variants.map((v) => [v.color_id || v.color?.id, v])).values()
                          ).map((v) => {
                            const colId = v.color_id || v.color?.id;
                            const hexCode = v.color?.hex_code || '#000000';
                            const colName = v.color?.name || v.color;
                            const isSelected = (cardSelectedColor[garment.id] || garment.variants[0]?.color_id) === colId;

                            return (
                              <button
                                key={colId}
                                onClick={() => handleSelectCardColor(garment.id, colId)}
                                style={{ backgroundColor: hexCode }}
                                className={`w-4 h-4 rounded-none color-swatch-dot transition-all cursor-pointer ${
                                  isSelected ? 'is-active' : 'opacity-80 hover:opacity-100 hover:scale-110'
                                }`}
                                title={`${colName} - Bấm để xem ảnh biến thể`}
                              />
                            );
                          })}
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400 font-bold ml-1">
                          {activeVariant?.color?.name || activeVariant?.color || ''}
                        </span>
                      </div>

                      {/* Nút lưu vào Wishlist */}
                      <button
                        onClick={() => toggleWishlist(garment.id)}
                        className={`p-1.5 border border-zinc-800 hover:border-zinc-500 transition-colors cursor-pointer ${
                          wishlist.includes(garment.id) ? 'text-rose-400 border-rose-500/50' : 'text-zinc-500 hover:text-white'
                        }`}
                        title="Thêm vào danh sách yêu thích"
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlist.includes(garment.id) ? 'fill-rose-400' : ''}`} />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* =========================================================================
          5. SECTION 02 / CRAFTSMANSHIP (KỸ THUẬT RẬP 3D & CHẤT LIỆU CAO CẤP)
      ========================================================================== */}
      <section id="craftsmanship" className="w-full border-b border-zinc-800">
        
        {/* Section Header */}
        <div className="px-4 sm:px-8 lg:px-12 py-16 border-b border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase block">
              02 // NGHỆ THUẬT CHẾ TÁC & VẬT LIỆU KỸ THUẬT
            </span>
            <h2 className="font-inter font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#fafafa] leading-[1.08]">
              Nói không với thời trang <span className="font-serif italic font-normal text-zinc-300">dùng một lần</span>.
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right font-mono text-[11px] text-zinc-400 space-y-1">
            <div>TIÊU CHUẨN KỸ THUẬT HÀNG ĐẦU</div>
            <div className="text-zinc-500">ĐỘ BỀN VẬT LIỆU // BẢO HÀNH TRỌN ĐỜI</div>
          </div>
        </div>

        {/* 3 Cột Kỹ thuật ngăn cách bởi đường viền 1px (Swiss Grid 3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {CRAFTSMANSHIP_PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="p-8 sm:p-10 lg:p-12 space-y-6 bg-[#080808] hover:bg-zinc-950/40 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono text-xs font-bold text-white group-hover:border-white transition-colors">
                  {pillar.num}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 tracking-widest">
                  TIÊU CHUẨN v26
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-inter font-black text-xl sm:text-2xl text-white tracking-tight">
                  {pillar.title}
                </h3>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900 font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400" />
                <span>KIỂM ĐỊNH CHUỖI CUNG ỨNG TIÊU CHUẨN QUỐC TẾ</span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          6. SECTION 03 / WORN BY COMMUNITY (STREET STYLE FIT CHECKS & REVIEWS)
      ========================================================================== */}
      <section id="reviews" className="w-full border-b border-zinc-800">
        
        {/* Section Header */}
        <div className="px-4 sm:px-8 lg:px-12 py-16 border-b border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase block">
              03 // PHONG CÁCH TỪ CỘNG ĐỒNG (FIT CHECKS THỰC TẾ)
            </span>
            <h2 className="font-inter font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#fafafa] leading-[1.08]">
              Trải nghiệm thực tế từ <span className="font-serif italic font-normal text-zinc-300">cộng đồng</span> Aether.
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right font-mono text-[11px] text-zinc-400 space-y-1">
            <div>FIT CHECK KHẮP TOÀN CẦU</div>
            <div className="text-zinc-500">TOKYO // SEOUL // HÀ NỘI</div>
          </div>
        </div>

        {/* Lưới 3 Cột Fit Checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {COMMUNITY_FIT_CHECKS.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between bg-[#080808] overflow-hidden"
            >
              {/* Header ô ảnh: Vị trí Fit Check */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono text-[10px] tracking-widest text-[#a1a1aa] bg-zinc-950/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400" />
                  <span className="text-white font-bold">{item.location}</span>
                </div>
                <span>{item.user}</span>
              </div>

              {/* Ảnh người mẫu mặc đồ ngoài đời thực */}
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
                <img
                  src={item.image}
                  alt={item.garment}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-95"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <span className="font-mono text-[10px] text-zinc-400 tracking-wider">
                    TRANG PHỤC:
                  </span>
                  <span className="font-inter font-bold text-base text-white">
                    {item.garment}
                  </span>

                  {/* Nút [ XEM PHONG CÁCH NÀY ] dạng monospace ở góc trái dưới */}
                  <div className="pt-4">
                    <button
                      onClick={() => scrollToSection('catalog')}
                      className="px-4 py-2 border border-zinc-700 bg-black/80 hover:border-white hover:bg-white hover:text-black font-mono text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>[ XEM PHONG CÁCH NÀY ]</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          7. CTA SECTION & FOOTER (SWISS GRID 4 CỘT)
      ========================================================================== */}
      <footer id="footer" className="w-full bg-[#080808]">
        
        {/* Khung CTA ở giữa */}
        <div className="px-4 sm:px-8 lg:px-12 py-20 border-b border-zinc-800 text-center space-y-6">
          <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
            BỘ SƯU TẬP FW/26 // PHIÊN BẢN GIỚI HẠN
          </span>
          <h2 className="font-inter font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-none">
            Kiến tạo phong cách{' '}
            <span className="font-serif italic font-normal text-zinc-300">độc bản</span>.
          </h2>
          <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
            Hệ thống quần áo tối giản, kỹ thuật cao, đáp ứng mọi điều kiện thời tiết khắc nghiệt.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('catalog')}
              className="px-8 py-4 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl active:translate-y-0.5 cursor-pointer"
            >
              XEM TẤT CẢ SẢN PHẨM
            </button>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="px-8 py-4 bg-transparent text-white border border-zinc-700 hover:border-white font-mono text-[11px] tracking-widest uppercase transition-colors cursor-pointer"
            >
              HƯỚNG DẪN CHỌN SIZE
            </button>
          </div>
        </div>

        {/* Footer 4 Cột: CATEGORIES, COLLECTIONS, SUPPORT, SOCIALS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border-b border-zinc-800">
          
          {/* Cột 1: CATEGORIES */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              DANH MỤC SẢN PHẨM
            </h4>
            <ul className="space-y-2 text-zinc-400">
              {MOCK_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      scrollToSection('catalog');
                    }}
                    className="hover:text-white transition-colors uppercase text-left"
                  >
                    // {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    resetFilters();
                    scrollToSection('catalog');
                  }}
                  className="hover:text-white transition-colors uppercase text-left text-zinc-500"
                >
                  // TẤT CẢ SẢN PHẨM
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 2: COLLECTIONS */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              BỘ SƯU TẬP TIÊU BIỂU
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#hero" className="hover:text-white transition-colors">// BST FW/26 KỸ THUẬT CAO</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">// CHẤT VẢI CAO CẤP DÀY DẶN</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">// ÁO KHOÁC CHỐNG THẤM VƯỢT TRỘI</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">// DÒNG SẢN PHẨM KỶ NIỆM</a></li>
            </ul>
          </div>

          {/* Cột 3: SUPPORT */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              HỖ TRỢ KHÁCH HÀNG
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/orders" className="hover:text-white transition-colors">// TRA CỨU ĐƠN HÀNG</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">// TÀI KHOẢN KHÁCH HÀNG</Link></li>
              <li><span className="text-zinc-500">// CSKH HOTLINE: 1900 6868</span></li>
              <li><span className="text-zinc-500">// EMAIL: SUPPORT@AETHERLABS.VN</span></li>
            </ul>
          </div>

          {/* Cột 4: BRAND & STUDIO */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              AETHER LABS // TOKYO - HÀ NỘI
            </h4>
            <p className="text-zinc-500 text-[11px] leading-relaxed font-light">
              Thiết kế trang phục tối giản chịu tải cao cho cuộc sống đô thị hiện đại. Toàn bộ bản quyền và nhãn hiệu thuộc về Aether Labs Studio Corp.
            </p>
            <div className="pt-2 text-[10px] text-zinc-500">
              AETHER LABS APPAREL STUDIO // THU ĐÔNG 2026
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-zinc-600 gap-2">
          <span>© 2026 AETHER LABS CORP. ALL RIGHTS RESERVED.</span>
          <span className="text-zinc-500">ENGINEERED FOR MODERN NOMADS</span>
        </div>

      </footer>

      {/* =========================================================================
          SLIDE-OUT CART DRAWER & MODALS
      ========================================================================== */}
      <AetherCartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItemsStore}
        onUpdateQuantity={updateQuantityStore}
        onRemoveItem={removeFromCartStore}
      />

      <AetherSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectGarment={(garment) => {
          setSearchOpen(false);
          setInspectGarment(garment);
        }}
      />

      <AetherQuickViewModal
        isOpen={Boolean(inspectGarment)}
        garment={inspectGarment}
        onClose={() => setInspectGarment(null)}
        onAddToCart={(item) => {
          addToCartStore(item);
          toast.success(`[ĐÃ THÊM] ${item.name} vào giỏ hàng!`, {
            style: {
              background: '#080808',
              color: '#fafafa',
              border: '1px solid #27272a',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
            },
          });
        }}
      />

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSizeGuideOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-[#080808] border border-zinc-800 p-6 text-white z-10 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="font-mono text-xs font-bold tracking-widest uppercase">
                BẢNG THÔNG SỐ SIZE CHUẨN // AETHER FIT
              </span>
              <button onClick={() => setSizeGuideOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs text-left border border-zinc-800">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-2 border-r border-zinc-800">SIZE</th>
                    <th className="p-2 border-r border-zinc-800">CHIỀU CAO (CM)</th>
                    <th className="p-2 border-r border-zinc-800">CÂN NẶNG (KG)</th>
                    <th className="p-2">VÒNG NGỰC (CM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  <tr><td className="p-2 border-r border-zinc-800 font-bold text-white">S</td><td className="p-2 border-r border-zinc-800">160 - 168</td><td className="p-2 border-r border-zinc-800">50 - 58</td><td className="p-2">84 - 88</td></tr>
                  <tr><td className="p-2 border-r border-zinc-800 font-bold text-white">M</td><td className="p-2 border-r border-zinc-800">168 - 175</td><td className="p-2 border-r border-zinc-800">58 - 68</td><td className="p-2">88 - 94</td></tr>
                  <tr><td className="p-2 border-r border-zinc-800 font-bold text-white">L</td><td className="p-2 border-r border-zinc-800">175 - 182</td><td className="p-2 border-r border-zinc-800">68 - 78</td><td className="p-2">94 - 100</td></tr>
                  <tr><td className="p-2 border-r border-zinc-800 font-bold text-white">XL</td><td className="p-2 border-r border-zinc-800">180 - 190</td><td className="p-2 border-r border-zinc-800">78 - 90</td><td className="p-2">100 - 108</td></tr>
                </tbody>
              </table>
            </div>
            <p className="font-mono text-[10px] text-zinc-500">
              * Rập dáng thoải mái (Relaxed fit). Nếu muốn mặc vừa vặn cơ thể, vui lòng chọn lùi 1 size.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
