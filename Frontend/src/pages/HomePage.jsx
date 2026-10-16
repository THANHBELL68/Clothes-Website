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

// Chương trình khuyến mãi đang chạy (now() BETWEEN start_at AND end_at)
const ACTIVE_PROMOTIONS = [
  { id: 1, name: 'MÙA ĐÔNG FW/26', discount_percent: 10, product_ids: [1, 3] },
];

export default function HomePage() {
  const navigate = useNavigate();

  // Store giỏ hàng & sản phẩm yêu thích
  const cartItemsStore = useCartStore((state) => state.items);
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
    1: 1, // Áo thun basic -> Màu Đen (#000000)
    2: 3, // Quần jean slim -> Màu Xanh (#1F3A93)
    3: 2, // Áo kiểu Rayon -> Màu Trắng (#FFFFFF)
    4: 5, // Áo khoác lông cừu -> Màu Navy (#1E293B)
  });

  // Tính tổng số lượng trong giỏ hàng
  const totalCartCount = useMemo(() => {
    return cartItemsStore.reduce((sum, item) => sum + (item.quantity || 1), 0);
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
      const variantWithColor = product.variants.find((v) => (v.color_id || v.color?.id) === activeColorId);
      if (variantWithColor) {
        const imgByVariant = product.images.find((img) => img.variant_id === variantWithColor.id);
        if (imgByVariant) return imgByVariant.url;
      }
    }
    return product.images[0]?.url || product.images[0] || '/placeholder.jpg';
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
    <div className="relative w-full min-h-screen bg-[#080808] text-[#fafafa] font-inter overflow-x-hidden selection:bg-[#fafafa] selection:text-[#080808]">
      
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
              className={`${card.width} ${card.aspect} border border-zinc-800/80 bg-zinc-950/60 rounded-md overflow-hidden shadow-2xl backdrop-blur-xs`}
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.92]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5">
                <span className="font-mono text-[9px] text-zinc-400 tracking-wider">
                  {card.tag}
                </span>
                <span className="font-mono text-[10px] font-bold text-white tracking-widest truncate">
                  {card.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lớp phủ Radial-Gradient đen ở tâm để tên thương hiệu luôn nổi bật 100% */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.75) 45%, rgba(8,8,8,0.2) 80%, transparent 100%)',
          }}
        />

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
            <span>DROP FW/26 // ARCHIVE RELEASE</span>
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
            Engineered garments for{' '}
            <span className="font-serif italic font-normal text-zinc-100 text-2xl sm:text-3xl">
              modern nomads
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
            {/* Nút 1: SHOP NEW DROPS (Nền trắng chữ đen) */}
            <button
              onClick={() => scrollToSection('catalog')}
              className="px-8 py-4 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>SHOP NEW DROPS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Nút 2: EXPLORE ARCHIVE (Nền đen viền mảnh 1px) */}
            <button
              onClick={() => scrollToSection('craftsmanship')}
              className="px-8 py-4 bg-[#080808] text-[#fafafa] border border-zinc-700 hover:border-[#fafafa] font-mono text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer hover:bg-zinc-900/60"
            >
              <span>EXPLORE ARCHIVE</span>
            </button>
          </motion.div>

          {/* Dòng chữ monospace nhỏ bên dưới nút bấm */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-3 font-mono text-[10px] sm:text-[11px] tracking-widest text-zinc-500 uppercase"
          >
            FREE GLOBAL SHIPPING // GORE-TEX PRO // LIMITED ARCHIVE RELEASE
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
              01 // FEATURED GARMENTS (CATALOG GRID)
            </span>
            <h2 className="font-inter font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#fafafa] leading-[1.08]">
              The armor that mere <span className="font-serif italic font-normal text-zinc-300">trends</span> cannot outlast.
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right font-mono text-[11px] text-zinc-400 space-y-1">
            <div>HỆ THỐNG CƠ SỞ DỮ LIỆU: POSTGRESQL 13+</div>
            <div className="text-zinc-500">VIEWS: v_inventory_available & v_product_rating</div>
            <div className="text-emerald-400">● TỒN KHO THỰC TẾ & ĐÁNH GIÁ CHUẨN XÁC</div>
          </div>
        </div>

        {/* =====================================================================
            FILTER BAR (DẠNG Ô VUÔNG 1PX: CATEGORIES, SIZES, COLORS, MATERIALS)
        ====================================================================== */}
        <div className="border-b border-zinc-800 bg-zinc-950/60 p-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Hàng lọc: Categories + Sizes + Colors + Materials */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
              
              {/* Lọc Categories */}
              <div className="flex items-center border border-zinc-800 bg-[#080808] p-1">
                <span className="px-2 text-zinc-500 uppercase hidden sm:inline">DANH MỤC:</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2.5 py-1 tracking-wider uppercase transition-colors cursor-pointer ${
                    !selectedCategory ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  TẤT CẢ
                </button>
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-2.5 py-1 tracking-wider uppercase transition-colors cursor-pointer ${
                      selectedCategory === cat.slug ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Lọc Sizes */}
              <div className="flex items-center border border-zinc-800 bg-[#080808] p-1">
                <span className="px-2 text-zinc-500 uppercase hidden sm:inline">SIZE:</span>
                <button
                  onClick={() => setSelectedSize(null)}
                  className={`px-2 py-1 tracking-wider uppercase transition-colors cursor-pointer ${
                    !selectedSize ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ALL
                </button>
                {MOCK_SIZES.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedSize(sz.name)}
                    className={`min-w-[28px] text-center px-1.5 py-1 tracking-wider uppercase transition-colors cursor-pointer ${
                      selectedSize === sz.name ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sz.name}
                  </button>
                ))}
              </div>

              {/* Lọc Colors (Hiển thị ô màu từ colors.hex_code) */}
              <div className="flex items-center border border-zinc-800 bg-[#080808] p-1 gap-1.5 px-2">
                <span className="text-zinc-500 uppercase hidden sm:inline">MÀU:</span>
                <button
                  onClick={() => setSelectedColorId(null)}
                  className={`px-2 py-0.5 tracking-wider uppercase transition-colors cursor-pointer text-[10px] ${
                    !selectedColorId ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ALL
                </button>
                {MOCK_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColorId(col.id)}
                    style={{ backgroundColor: col.hex_code }}
                    className={`w-5 h-5 rounded-none border transition-transform cursor-pointer ${
                      selectedColorId === col.id
                        ? 'border-amber-400 scale-110 shadow-sm'
                        : 'border-zinc-700 hover:scale-105'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>

              {/* Lọc Materials */}
              <div className="flex items-center border border-zinc-800 bg-[#080808] p-1">
                <span className="px-2 text-zinc-500 uppercase hidden sm:inline">VẢI:</span>
                {['Tất cả', 'Cotton', 'Denim', 'Rayon', 'Lông cừu'].map((mat) => {
                  const val = mat === 'Tất cả' ? null : mat;
                  const isActive = selectedMaterialName === val;
                  return (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterialName(val)}
                      className={`px-2.5 py-1 tracking-wider uppercase transition-colors cursor-pointer ${
                        isActive ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Trạng thái bộ lọc & Nút Đặt Lại */}
            <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[11px]">
              <span className="text-zinc-500">
                HIỂN THỊ <strong className="text-white">{filteredProducts.length}</strong> / 4 SẢN PHẨM
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ĐẶT LẠI</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* =====================================================================
            PRODUCT 2x2 EXPOSED 1PX BORDER GRID
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
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-zinc-800 border-b border-zinc-800">
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
                  className={`group relative flex flex-col justify-between bg-[#080808] transition-colors duration-300 hover:bg-zinc-950/40 ${
                    index % 2 === 0 ? 'md:border-r border-zinc-800' : ''
                  } ${index >= 2 ? 'md:border-t border-zinc-800' : ''}`}
                >
                  
                  {/* Header nhỏ trên cùng: Danh mục + Điểm đánh giá từ v_product_rating */}
                  <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between font-mono text-[11px] tracking-widest text-[#a1a1aa] bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white" />
                      <span className="text-white font-bold uppercase">
                        {String(garment.id).padStart(2, '0')} // {garment.category?.name || 'SẢN PHẨM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Điểm đánh giá v_product_rating */}
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
                    {/* Badge Giảm Giá Monospace nếu nằm trong promotion_products còn hiệu lực */}
                    {activePromo && (
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 border border-rose-500/80 bg-rose-950/40 font-mono text-[10px] tracking-widest text-rose-300 uppercase shadow-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-400 animate-pulse" />
                        <span>SALE -{activePromo.discount_percent}% // {activePromo.name}</span>
                      </div>
                    )}

                    {/* Badge Tồn Kho Khả Dụng v_inventory_available */}
                    <div className="absolute top-4 right-4 z-10 px-2 py-0.5 border border-zinc-800 bg-black/80 font-mono text-[9px] tracking-widest text-emerald-400 uppercase">
                      ● CÒN {quantityAvailable} CHIẾC
                    </div>

                    {/* Ảnh Sản Phẩm */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={displayImage}
                        alt={garment.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Overlay Nút Quick View & Quick Add khi di chuột */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectGarment(garment);
                        }}
                        className="px-4 py-2.5 bg-black/80 border border-zinc-600 hover:border-white text-white font-mono text-[11px] tracking-widest uppercase transition-colors flex items-center gap-1.5"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>XEM CHI TIẾT</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(garment);
                        }}
                        className="px-4 py-2.5 bg-white text-black hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center gap-1.5"
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
                        <div className="flex items-center gap-1.5">
                          {garment.variants.map((v) => {
                            const colId = v.color_id || v.color?.id;
                            const hexCode = v.color?.hex_code || '#000000';
                            const colName = v.color?.name || v.color;
                            const isSelected = (cardSelectedColor[garment.id] || garment.variants[0]?.color_id) === colId;

                            return (
                              <button
                                key={v.sku}
                                onClick={() => handleSelectCardColor(garment.id, colId)}
                                style={{ backgroundColor: hexCode }}
                                className={`w-4 h-4 rounded-none border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-white scale-125 shadow-md ring-1 ring-white/50'
                                    : 'border-zinc-700 opacity-60 hover:opacity-100 hover:scale-110'
                                }`}
                                title={`${colName} (${hexCode}) - Bấm để xem ảnh biến thể`}
                              />
                            );
                          })}
                        </div>
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
              02 // CRAFTSMANSHIP & ENGINEERING
            </span>
            <h2 className="font-inter font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#fafafa] leading-[1.08]">
              Stop buying <span className="font-serif italic font-normal text-zinc-300">disposable</span> fashion.
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
                  SPECS.v26
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
              03 // WORN BY COMMUNITY (STREET STYLE FIT CHECKS)
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

                  {/* Nút [ SHOP THIS LOOK ] dạng monospace ở góc trái dưới */}
                  <div className="pt-4">
                    <button
                      onClick={() => scrollToSection('catalog')}
                      className="px-4 py-2 border border-zinc-700 bg-black/80 hover:border-white hover:bg-white hover:text-black font-mono text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>[ SHOP THIS LOOK ]</span>
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
            END OF TRANSMISSION // DROP FW/26
          </span>
          <h2 className="font-inter font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-none">
            Start building your{' '}
            <span className="font-serif italic font-normal text-zinc-300">uniform</span>.
          </h2>
          <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
            Hệ thống quần áo tối giản, kỹ thuật cao, đáp ứng mọi điều kiện thời tiết khắc nghiệt.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('catalog')}
              className="px-8 py-4 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl active:translate-y-0.5 cursor-pointer"
            >
              SHOP ALL ITEMS
            </button>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="px-8 py-4 bg-transparent text-white border border-zinc-700 hover:border-white font-mono text-[11px] tracking-widest uppercase transition-colors cursor-pointer"
            >
              SIZE GUIDE (BẢNG SIZE)
            </button>
          </div>
        </div>

        {/* Footer 4 Cột: CATEGORIES, COLLECTIONS, SUPPORT, SOCIALS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border-b border-zinc-800">
          
          {/* Cột 1: CATEGORIES */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              CATEGORIES (DANH MỤC)
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
                  // TẤT CẢ DROPS
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 2: COLLECTIONS */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              COLLECTIONS (BỘ SƯU TẬP)
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#hero" className="hover:text-white transition-colors">// FW/26 NOMAD TECHWEAR</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">// HEAVYWEIGHT COTTON 500GSM</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">// MODULAR GORE-TEX SHELLS</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">// ARCHIVE REISSUES</a></li>
            </ul>
          </div>

          {/* Cột 3: SUPPORT & SYSTEM */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              SUPPORT (HỖ TRỢ)
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/orders" className="hover:text-white transition-colors">// TRA CỨU ĐƠN HÀNG</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">// CỔNG KHÁCH HÀNG (CUSTOMER)</Link></li>
              <li><Link to="/staff/login" className="hover:text-amber-400 transition-colors">// CỔNG NHÂN VIÊN (STAFF)</Link></li>
              <li><span className="text-zinc-600">// CSKH HOTLINE: 1900 6868</span></li>
            </ul>
          </div>

          {/* Cột 4: SOCIALS & COPYRIGHT */}
          <div className="p-8 sm:p-10 space-y-4 font-mono text-xs">
            <h4 className="text-white font-bold tracking-widest uppercase border-b border-zinc-800 pb-2">
              AETHER LABS // TOKYO - HÀ NỘI
            </h4>
            <p className="text-zinc-500 text-[11px] leading-relaxed font-light">
              Thiết kế trang phục tối giản chịu tải cao cho cuộc sống đô thị hiện đại. Toàn bộ bản quyền và nhãn hiệu thuộc về Aether Labs Studio Corp.
            </p>
            <div className="pt-2 text-[10px] text-zinc-600">
              POSTGRESQL 13+ // REACT 19 // TAILWIND CSS // FRAMER MOTION
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
