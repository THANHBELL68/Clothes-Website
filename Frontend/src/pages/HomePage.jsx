import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowDown,
  ShoppingBag,
  Heart,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
  CheckCircle2,
  Video,
  VideoOff,
} from 'lucide-react';
import { useDbStore } from '../store/dbStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

export default function HomePage() {
  const navigate = useNavigate();

  // Đọc sản phẩm và đánh giá trực tiếp từ CSDL động (dbStore)
  const products = useDbStore((state) => state.products);
  const allReviews = useDbStore((state) => state.reviews);
  const addToCart = useCartStore((state) => state.addToCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  // Chỉ lấy các đánh giá đã được CSKH phê duyệt
  const approvedReviews = useMemo(
    () => allReviews.filter((r) => r.status === 'approved'),
    [allReviews]
  );

  // Bộ lọc danh mục: 'all' | 'nu' | 'nam'
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Điều khiển Video Nền Đầu Trang (site_bg.mp4)
  const bgVideoRef = useRef(null);
  const [isBgVideoPlaying, setIsBgVideoPlaying] = useState(true);
  const [isBgVideoMuted, setIsBgVideoMuted] = useState(true);
  const [showBgVideo, setShowBgVideo] = useState(true);

  // Section Tracking cho thanh điều hướng dọc (ArtCraft Style)
  const [activeSection, setActiveSection] = useState('hero');

  // Quản lý biến thể đang chọn cho từng sản phẩm trên trang chủ
  // Sản phẩm 1 (Nữ): Rayon 479073
  const productNu = products.find((p) => p.category_id === 'nu') || products[0];
  const [nuColor, setNuColor] = useState(productNu?.variants?.[0]?.color || '00 WHITE');
  const [nuSize, setNuSize] = useState(productNu?.variants?.[0]?.size || 'M');
  const [nuQty, setNuQty] = useState(1);
  const [nuVideoActive, setNuVideoActive] = useState(true);
  const [nuVideoMuted, setNuVideoMuted] = useState(true);
  const [nuVideoPlaying, setNuVideoPlaying] = useState(true);

  // Sản phẩm 2 (Nam): Lông cừu 486116
  const productNam = products.find((p) => p.category_id === 'nam') || products[1] || products[0];
  const [namColor, setNamColor] = useState(productNam?.variants?.[0]?.color || '69 NAVY');
  const [namSize, setNamSize] = useState(productNam?.variants?.[0]?.size || 'L');
  const [namQty, setNamQty] = useState(1);
  const [namVideoActive, setNamVideoActive] = useState(true);
  const [namVideoMuted, setNamVideoMuted] = useState(true);
  const [namVideoPlaying, setNamVideoPlaying] = useState(true);

  // Lấy biến thể hiện tại tương ứng với Color + Size
  const currentVariantNu = useMemo(() => {
    return productNu?.variants?.find((v) => v.color === nuColor && v.size === nuSize) || productNu?.variants?.[0];
  }, [productNu, nuColor, nuSize]);

  const currentVariantNam = useMemo(() => {
    return productNam?.variants?.find((v) => v.color === namColor && v.size === namSize) || productNam?.variants?.[0];
  }, [productNam, namColor, namSize]);

  // Điều khiển video nền site_bg
  const toggleBgVideoPlayback = () => {
    if (bgVideoRef.current) {
      if (isBgVideoPlaying) {
        bgVideoRef.current.pause();
        setIsBgVideoPlaying(false);
      } else {
        bgVideoRef.current.play();
        setIsBgVideoPlaying(true);
      }
    }
  };

  const toggleBgVideoMute = () => {
    if (bgVideoRef.current) {
      bgVideoRef.current.muted = !isBgVideoMuted;
      setIsBgVideoMuted(!isBgVideoMuted);
    }
  };

  // Cuộn trang mượt đến từng mục
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Theo dõi vị trí cuộn để đổi activeSection trên thanh tracker bên phải
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'products', 'statement', 'reviews'];
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Xử lý thêm sản phẩm Nữ vào giỏ
  const handleAddToCartNu = () => {
    if (!currentVariantNu || currentVariantNu.stock <= 0) {
      toast.error('Sản phẩm tạm thời hết hàng trong kho!');
      return;
    }
    addToCart({
      variant_id: currentVariantNu.id,
      product_id: productNu.id,
      name: productNu.name,
      size: currentVariantNu.size,
      color: currentVariantNu.color,
      price: productNu.price,
      image: productNu.images[0],
      stock: currentVariantNu.stock,
      quantity: nuQty,
    });
    toast.success(`Đã thêm ${nuQty} áo Rayon Nữ vào giỏ hàng!`);
  };

  // Xử lý thêm sản phẩm Nam vào giỏ
  const handleAddToCartNam = () => {
    if (!currentVariantNam || currentVariantNam.stock <= 0) {
      toast.error('Sản phẩm tạm thời hết hàng trong kho!');
      return;
    }
    addToCart({
      variant_id: currentVariantNam.id,
      product_id: productNam.id,
      name: productNam.name,
      size: currentVariantNam.size,
      color: currentVariantNam.color,
      price: productNam.price,
      image: productNam.images[0],
      stock: currentVariantNam.stock,
      quantity: namQty,
    });
    toast.success(`Đã thêm ${namQty} áo Khoác Lông Cừu Nam vào giỏ hàng!`);
  };

  return (
    <div className="relative w-full bg-[#0a0a0f] text-neutral-100 overflow-hidden select-none">

      {/* =========================================================================
          THANH ĐIỀU HƯỚNG DỌC CỐ ĐỊNH MÉP PHẢI (ARTCRAFT STICKY TRACKER)
      ========================================================================== */}
      <aside className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3 pointer-events-auto">
        <div className="p-2.5 rounded-2xl bg-[#14141e]/85 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-3">
          {[
            { id: 'hero', label: 'TỔNG QUAN', num: '01' },
            { id: 'products', label: 'BỘ SƯU TẬP', num: '02' },
            { id: 'statement', label: 'CHẤT LIỆU', num: '03' },
            { id: 'reviews', label: 'ĐÁNH GIÁ', num: '04' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="group flex items-center justify-end gap-2.5 text-[11px] font-mono tracking-wider transition-all"
            >
              <span
                className={`hidden group-hover:inline-block px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest backdrop-blur-md transition-opacity duration-200 ${
                  activeSection === sec.id ? 'inline-block text-amber-400' : 'text-neutral-400'
                }`}
              >
                {sec.num} // {sec.label}
              </span>
              <div
                className={`transition-all duration-300 rounded-full flex items-center justify-center ${
                  activeSection === sec.id
                    ? 'w-6 h-6 bg-[#e60012] text-white font-bold text-[10px] shadow-lg shadow-rose-900/50 scale-110'
                    : 'w-2 h-2 bg-neutral-600 group-hover:bg-neutral-300 group-hover:scale-125'
                }`}
              >
                {activeSection === sec.id && sec.num}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* =========================================================================
          HERO BANNER: ARTCRAFT AESTHETIC VỚI SITE_BG VÀ 4 CARDS QUỸ ĐẠO BAY LƠ LỬNG
      ========================================================================== */}
      <section
        id="hero"
        className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col items-center justify-center px-4 pt-12 pb-20 overflow-hidden"
      >
        {/* Lớp nền video site_bg có bật/tắt */}
        {showBgVideo ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={bgVideoRef}
              src="/site_bg.mp4"
              autoPlay
              loop
              muted={isBgVideoMuted}
              playsInline
              className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.15]"
            />
            {/* Lưới phủ ma trận nhẹ kiểu ArtCraft */}
            <div
              className="absolute inset-0 bg-radial from-transparent via-[#0a0a0f]/60 to-[#0a0a0f] pointer-events-none"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-radial from-[#181824] via-[#0f0f16] to-[#0a0a0f]">
            <div
              className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
            />
          </div>
        )}

        {/* Nút điều khiển video nền góc trái bên dưới (ArtCraft floating audio & video pill) */}
        <div className="absolute left-4 sm:left-8 bottom-8 z-30 flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-xs text-neutral-300 shadow-2xl">
          <button
            onClick={toggleBgVideoPlayback}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
            title={isBgVideoPlaying ? 'Tạm dừng video nền' : 'Tiếp tục phát'}
          >
            {isBgVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-amber-400" />}
          </button>

          <button
            onClick={toggleBgVideoMute}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
            title={isBgVideoMuted ? 'Bật âm thanh nền' : 'Tắt tiếng video nền'}
          >
            {isBgVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            onClick={() => setShowBgVideo(!showBgVideo)}
            className="px-3 py-1 text-[11px] font-bold rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5"
            title="Bật / tắt lớp video nền"
          >
            {showBgVideo ? <Video className="w-3 h-3 text-[#e60012]" /> : <VideoOff className="w-3 h-3 text-neutral-400" />}
            <span className="hidden sm:inline">{showBgVideo ? 'Video Nền' : 'Nền Tối'}</span>
          </button>
        </div>

        {/* ===================================================================
            4 FLOATING ORBIT CARDS (ARTCRAFT SIGNATURE)
        ==================================================================== */}

        {/* Card 1: Top-Left (Nữ Rayon Preview với Video thumbnail lơ lửng) */}
        <div className="hidden xl:block absolute top-20 left-12 2xl:left-24 z-20 animate-float">
          <div
            onClick={() => scrollTo('products')}
            className="group cursor-pointer neo-card p-2.5 rounded-xl w-60 transition-all hover:scale-105 border border-white/20 hover:border-amber-400/60 shadow-2xl"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-white/10 mb-2">
              <video
                src="/images/products/nu_demo/san_pham1/video_intro.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#e60012] text-white">
                01 / NỮ RAYON
              </span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-white truncate max-w-[130px]">Áo Kiểu Vải Rayon</span>
              <span className="font-mono font-bold text-amber-400">599.000₫</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 px-1 font-mono">
              <span>S, M, L, XL</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Còn hàng
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Top-Right (Nam Lông Cừu Preview với Video thumbnail lơ lửng) */}
        <div className="hidden xl:block absolute top-20 right-12 2xl:right-24 z-20 animate-float-reverse">
          <div
            onClick={() => scrollTo('products')}
            className="group cursor-pointer neo-card p-2.5 rounded-xl w-60 transition-all hover:scale-105 border border-white/20 hover:border-sky-400/60 shadow-2xl"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-white/10 mb-2">
              <video
                src="/images/products/nam_demo/san_pham1/video_intro_nam.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-900 text-white border border-white/30">
                02 / NAM LÔNG CỪU
              </span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-white truncate max-w-[130px]">Khoác Lông Cừu</span>
              <span className="font-mono font-bold text-amber-400">899.000₫</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 px-1 font-mono">
              <span>Cản gió cao cấp</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sẵn sàng giao
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Bottom-Left (Thông số chất liệu tái chế 24%) */}
        <div className="hidden xl:block absolute bottom-28 left-16 2xl:left-32 z-20 animate-float-slow">
          <div className="neo-card p-3 rounded-xl border border-white/15 flex items-center gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest">TIÊU CHUẨN XANH</div>
              <div className="text-xs font-bold text-white">24% Sợi Polyeste Tái Chế</div>
              <div className="text-[10px] text-emerald-400">Bảo tồn tài nguyên & giảm rác thải</div>
            </div>
          </div>
        </div>

        {/* Card 4: Bottom-Right (Liên kết SQL động & Tồn kho realtime) */}
        <div className="hidden xl:block absolute bottom-28 right-16 2xl:right-32 z-20 animate-float">
          <div className="neo-card p-3 rounded-xl border border-white/15 flex items-center gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-[#e60012]/10 border border-[#e60012]/30 flex items-center justify-center text-[#e60012] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest">CSDL POSTGRESQL</div>
              <div className="text-xs font-bold text-white">Đồng Bộ Trigger Tồn Kho</div>
              <div className="text-[10px] text-amber-400">Ledger giao dịch minh bạch</div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            CỤM TIÊU ĐỀ TRUNG TÂM (MASSIVE CENTRAL HEADLINE - ARTCRAFT STYLE)
        ==================================================================== */}
        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Tag badge kiểu ArtCraft với đường viền mờ */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md shadow-inner text-xs font-mono tracking-widest text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#e60012] animate-ping" />
            <span className="text-white font-bold">CLOTHES STUDIO</span>
            <span className="text-neutral-500">//</span>
            <span className="text-amber-400">BST THU/ĐÔNG 2026</span>
          </div>

          {/* Tiêu đề chính khổng lồ */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
            CLOTHES
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 font-light max-w-2xl mx-auto leading-relaxed">
            Thiết kế tối giản, tinh hoa dệt may bền vững. Hai biểu tượng phong cách cho Mùa Thu/Đông 2026 với phom dáng chuẩn xác và chất liệu chọn lọc.
          </p>

          {/* Cặp nút hành động phong cách Liquid Glass */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('products')}
              className="liquid-glass-btn-accent px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white shadow-xl group cursor-pointer"
            >
              <span>Khám Phá Sản Phẩm [Nữ & Nam]</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <Link
              to="/products"
              className="liquid-glass-btn-dark px-7 py-4 text-xs font-bold uppercase tracking-widest text-neutral-200 border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-neutral-400" />
              <span>Xem Tất Cả Danh Mục</span>
            </Link>
          </div>

          {/* Chỉ dẫn mã sản phẩm & CSDL */}
          <div className="pt-2 flex items-center justify-center gap-6 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Nữ Rayon (#479073)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Nam Lông Cừu (#486116)
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đổi trả 30 ngày
            </span>
          </div>

        </div>

        {/* ===================================================================
            ANIMATION VUỐT XUỐNG (SMOOTH SCROLL PROMPT)
        ==================================================================== */}
        <button
          onClick={() => scrollTo('products')}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-neutral-400 hover:text-white transition-all cursor-pointer group"
          title="Cuộn xuống xem sản phẩm"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest group-hover:text-amber-400 transition-colors">
            Cuộn xuống khám phá
          </span>
          <div className="w-7 h-10 rounded-full border-2 border-white/25 flex items-start justify-center p-1 group-hover:border-white transition-colors">
            <div className="w-1.5 h-2.5 rounded-full bg-[#e60012] animate-bounce" />
          </div>
        </button>

      </section>

      {/* =========================================================================
          INFINITE MARQUEE TICKER BAR (ARTCRAFT SIGNATURE STRIP)
      ========================================================================== */}
      <div className="relative w-full overflow-hidden bg-[#111118] border-y border-white/10 py-3.5 z-20">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono font-bold tracking-widest text-neutral-300 uppercase">
          {[1, 2, 3].map((loop) => (
            <React.Fragment key={loop}>
              <span className="flex items-center gap-2 text-white">
                <span className="text-[#e60012]">✦</span> BST THU/ĐÔNG 2026
              </span>
              <span className="flex items-center gap-2 text-neutral-400">
                <span>◆</span> NỮ ÁO KIỂU VẢI RAYON CỔ MỞ [MÃ 479073]
              </span>
              <span className="flex items-center gap-2 text-amber-400">
                <span>✦</span> 24% SỢI POLYESTE TÁI CHẾ BẢO VỆ MÔI TRƯỜNG
              </span>
              <span className="flex items-center gap-2 text-neutral-400">
                <span>◆</span> NAM ÁO KHOÁC GIẢ LÔNG CỪU CẢN GIÓ [MÃ 486116]
              </span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span>✦</span> MIỄN PHÍ VẬN CHUYỂN TỪ 500.000₫ TOÀN QUỐC
              </span>
              <span className="flex items-center gap-2 text-neutral-400">
                <span>◆</span> ĐỔI TRẢ TRỰC TIẾP TẠI CỬA HÀNG TRONG 30 NGÀY
              </span>
              <span className="flex items-center gap-2 text-sky-400">
                <span>✦</span> TÍCH ĐIỂM LOYALTY TỰ ĐỘNG THEO CSDL POSTGRESQL
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* =========================================================================
          KHU VỰC SẢN PHẨM RÚT GỌN (2 SẢN PHẨM NAM NỮ PRO_DETAIL & VIDEO NỀN TỰ CHẠY)
      ========================================================================== */}
      <section id="products" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Header Bộ Sưu Tập và Bộ Lọc Danh Mục (Chỉ Nữ và Nam) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#e60012] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SẢN PHẨM TRỌNG TÂM BST 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Thời Trang Ứng Dụng Nổi Bật
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Trích xuất trực tiếp từ danh mục mô tả <span className="font-mono text-neutral-300">pro_detail</span> kết nối kho dữ liệu động.
            </p>
          </div>

          {/* Nút lọc danh mục: TẤT CẢ, NỮ, NAM (Không còn trẻ em / em bé) */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-[#14141e] border border-white/10 self-start md:self-end">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-md transition-all ${
                selectedFilter === 'all'
                  ? 'bg-white text-black shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              TẤT CẢ (2)
            </button>
            <button
              onClick={() => setSelectedFilter('nu')}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-md transition-all ${
                selectedFilter === 'nu'
                  ? 'bg-[#e60012] text-white shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              NỮ (1)
            </button>
            <button
              onClick={() => setSelectedFilter('nam')}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded-md transition-all ${
                selectedFilter === 'nam'
                  ? 'bg-sky-600 text-white shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              NAM (1)
            </button>
          </div>
        </div>

        {/* ===================================================================
            SHOWCASE SẢN PHẨM 1: NỮ ÁO KIỂU RAYON (MÃ: 479073)
        ==================================================================== */}
        {(selectedFilter === 'all' || selectedFilter === 'nu') && (
          <div className="neo-card rounded-2xl border border-white/15 overflow-hidden p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-2xl relative">
            
            {/* Cột trái: Media Viewer (Video Nền Tự Động Chạy có Bật/Tắt) */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="relative aspect-[4/5] sm:aspect-square rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner group">
                
                {nuVideoActive ? (
                  <video
                    id="video-product-nu"
                    src="/images/products/nu_demo/san_pham1/video_intro.mp4"
                    autoPlay
                    loop
                    muted={nuVideoMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={productNu?.images?.[0] || '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif'}
                    alt={productNu?.name}
                    className="w-full h-full object-cover object-top"
                  />
                )}

                {/* Badge thông tin góc trên */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#e60012] text-white uppercase tracking-wider rounded">
                    NỮ // MÃ {productNu?.code || '479073'}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-black/70 text-amber-300 backdrop-blur-md rounded border border-white/10">
                    24% TÁI CHẾ
                  </span>
                </div>

                {/* Điều khiển Video Nền Sản Phẩm */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                  {nuVideoActive && (
                    <>
                      <button
                        onClick={() => {
                          const v = document.getElementById('video-product-nu');
                          if (v) {
                            if (nuVideoPlaying) v.pause();
                            else v.play();
                            setNuVideoPlaying(!nuVideoPlaying);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20"
                        title={nuVideoPlaying ? 'Tạm dừng video' : 'Phát tiếp video'}
                      >
                        {nuVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                      </button>

                      <button
                        onClick={() => setNuVideoMuted(!nuVideoMuted)}
                        className="w-8 h-8 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20"
                        title={nuVideoMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                      >
                        {nuVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setNuVideoActive(!nuVideoActive)}
                    className="px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-mono font-bold border border-white/20 flex items-center gap-1.5"
                    title="Chuyển đổi giữa Video và Ảnh tĩnh"
                  >
                    {nuVideoActive ? <Video className="w-3.5 h-3.5 text-rose-400" /> : <VideoOff className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{nuVideoActive ? 'Tắt Video' : 'Bật Video'}</span>
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(productNu.id)}
                  className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all z-20"
                  title="Thêm vào danh sách yêu thích"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(productNu.id) ? 'fill-[#e60012] text-[#e60012]' : ''}`} />
                </button>
              </div>

              {/* Thumbnails ảnh từ pro_detail */}
              <div className="grid grid-cols-4 gap-2">
                {productNu?.images?.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setNuVideoActive(false)}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 hover:border-white/50 transition-all"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Cột phải: Thông số chi tiết & Form Mua Hàng */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    BỘ SƯU TẬP THU/ĐÔNG 2026
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">4.9</span>
                    <span className="text-neutral-500 font-mono">(56 đánh giá)</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {productNu?.name}
                </h3>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black font-mono text-white">
                    {productNu?.price?.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">Đã gồm thuế VAT</span>
                </div>

                {/* Mô tả từ file pro_detail/sanphamnu.txt */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/10 pt-4">
                  {productNu?.short_desc}
                </p>

                {/* Thông số kỹ thuật nhanh */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white/5 p-3 rounded-lg border border-white/10">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">CHẤT LIỆU:</span>
                    <span className="text-white font-medium">{productNu?.material?.split('(')[0]}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">TÁI CHẾ:</span>
                    <span className="text-amber-400 font-bold">24% Polyeste tái chế</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">ĐỘ XUYÊN THẤU:</span>
                    <span className="text-white font-medium">Không xuyên thấu</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">DÁNG ÁO:</span>
                    <span className="text-white font-medium">Thoải mái, tôn dáng</span>
                  </div>
                </div>

                {/* Chọn Màu Sắc */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                    <span>MÀU SẮC: <strong className="text-white">{nuColor}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    {['00 WHITE', '10 BEIGE'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setNuColor(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
                          nuColor === c
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'bg-white/5 text-neutral-300 border-white/20 hover:border-white/50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/30"
                          style={{ backgroundColor: c.includes('WHITE') ? '#ffffff' : '#E8D8C8' }}
                        />
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn Size với tồn kho CSDL động */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                    <span>KÍCH THƯỚC:</span>
                    <span className="text-neutral-400 text-[11px]">Tồn kho: <strong className="text-emerald-400">{currentVariantNu?.stock || 0} chiếc</strong></span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setNuSize(s)}
                        className={`py-2 rounded-lg text-xs font-mono font-black border transition-all ${
                          nuSize === s
                            ? 'bg-amber-400 text-black border-amber-400 shadow-md scale-[1.02]'
                            : 'bg-white/5 text-neutral-300 border-white/15 hover:border-white/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SKU Code & Trigger */}
                <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between px-1">
                  <span>SKU: <strong className="text-neutral-200">{currentVariantNu?.sku}</strong></span>
                  <span className="text-emerald-400">● CSDL Trigger Ledger</span>
                </div>

              </div>

              {/* Bộ đếm số lượng & Nút thêm giỏ hàng Liquid Glass */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setNuQty(Math.max(1, nuQty - 1))}
                      className="px-3 py-2 text-white hover:bg-white/20 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-mono font-bold text-white text-sm min-w-8 text-center">
                      {nuQty}
                    </span>
                    <button
                      onClick={() => setNuQty(Math.min(currentVariantNu?.stock || 99, nuQty + 1))}
                      className="px-3 py-2 text-white hover:bg-white/20 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCartNu}
                    disabled={!currentVariantNu || currentVariantNu.stock <= 0}
                    className="flex-1 liquid-glass-btn-accent py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Vào Giỏ [{currentVariantNu?.size}]</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleAddToCartNu();
                      navigate('/cart');
                    }}
                    className="flex-1 liquid-glass-btn-dark py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider text-neutral-200 border border-white/20 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Mua Ngay</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/products/${productNu.id}`}
                    className="px-4 py-2.5 text-xs font-mono text-neutral-400 hover:text-white underline underline-offset-4"
                  >
                    Chi tiết kỹ thuật →
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            SHOWCASE SẢN PHẨM 2: NAM ÁO KHOÁC LÔNG CỪU CẢN GIÓ (MÃ: 486116)
        ==================================================================== */}
        {(selectedFilter === 'all' || selectedFilter === 'nam') && (
          <div className="neo-card rounded-2xl border border-white/15 overflow-hidden p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-2xl relative">
            
            {/* Cột trái: Media Viewer Nam (Video Nền Tự Động Chạy có Bật/Tắt) */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="relative aspect-[4/5] sm:aspect-square rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner group">
                
                {namVideoActive ? (
                  <video
                    id="video-product-nam"
                    src="/images/products/nam_demo/san_pham1/video_intro_nam.mp4"
                    autoPlay
                    loop
                    muted={namVideoMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={productNam?.images?.[0] || '/images/products/nam_demo/san_pham1/vngoods_69_486116_3x4.avif'}
                    alt={productNam?.name}
                    className="w-full h-full object-cover object-top"
                  />
                )}

                {/* Badge thông tin góc trên */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-neutral-900 text-white uppercase tracking-wider rounded border border-white/30">
                    NAM // MÃ {productNam?.code || '486116'}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-sky-950/80 text-sky-300 backdrop-blur-md rounded border border-sky-400/30">
                    CẢN GIÓ GIỮ NHIỆT
                  </span>
                </div>

                {/* Điều khiển Video Nền Sản Phẩm Nam */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                  {namVideoActive && (
                    <>
                      <button
                        onClick={() => {
                          const v = document.getElementById('video-product-nam');
                          if (v) {
                            if (namVideoPlaying) v.pause();
                            else v.play();
                            setNamVideoPlaying(!namVideoPlaying);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20"
                        title={namVideoPlaying ? 'Tạm dừng video' : 'Phát tiếp video'}
                      >
                        {namVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                      </button>

                      <button
                        onClick={() => setNamVideoMuted(!namVideoMuted)}
                        className="w-8 h-8 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20"
                        title={namVideoMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                      >
                        {namVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setNamVideoActive(!namVideoActive)}
                    className="px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-mono font-bold border border-white/20 flex items-center gap-1.5"
                    title="Chuyển đổi giữa Video và Ảnh tĩnh"
                  >
                    {namVideoActive ? <Video className="w-3.5 h-3.5 text-sky-400" /> : <VideoOff className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{namVideoActive ? 'Tắt Video' : 'Bật Video'}</span>
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(productNam.id)}
                  className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all z-20"
                  title="Thêm vào danh sách yêu thích"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(productNam.id) ? 'fill-[#e60012] text-[#e60012]' : ''}`} />
                </button>
              </div>

              {/* Thumbnails ảnh Nam */}
              <div className="grid grid-cols-4 gap-2">
                {productNam?.images?.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setNamVideoActive(false)}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 hover:border-white/50 transition-all"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Cột phải: Thông số chi tiết Nam & Form Mua Hàng */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    BỘ SƯU TẬP THU/ĐÔNG 2026
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">4.9</span>
                    <span className="text-neutral-500 font-mono">(73 đánh giá)</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {productNam?.name}
                </h3>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black font-mono text-white">
                    {productNam?.price?.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">Đã gồm thuế VAT</span>
                </div>

                {/* Mô tả từ file pro_detail/sanphamnam.txt */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/10 pt-4">
                  {productNam?.short_desc}
                </p>

                {/* Thông số kỹ thuật nhanh từ pro_detail */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-white/5 p-3 rounded-lg border border-white/10">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">CHẤT LIỆU NGOÀI:</span>
                    <span className="text-white font-medium">100% Polyeste Giả Lông Cừu</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">LỚP LÓT CẢN GIÓ:</span>
                    <span className="text-sky-300 font-bold">100% Polyeste Cản Gió</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">GẤU ÁO:</span>
                    <span className="text-white font-medium">Dây rút điều chỉnh phom</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">XUẤT XỨ:</span>
                    <span className="text-white font-medium">Vietnam (Chuẩn quốc tế)</span>
                  </div>
                </div>

                {/* Chọn Màu Sắc Nam */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                    <span>MÀU SẮC: <strong className="text-white">{namColor}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    {['69 NAVY', '30 NATURAL'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setNamColor(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
                          namColor === c
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'bg-white/5 text-neutral-300 border-white/20 hover:border-white/50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/30"
                          style={{ backgroundColor: c.includes('NAVY') ? '#1e293b' : '#f5f5f0' }}
                        />
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn Size Nam với tồn kho CSDL */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                    <span>KÍCH THƯỚC:</span>
                    <span className="text-neutral-400 text-[11px]">Tồn kho: <strong className="text-emerald-400">{currentVariantNam?.stock || 0} chiếc</strong></span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setNamSize(s)}
                        className={`py-2 rounded-lg text-xs font-mono font-black border transition-all ${
                          namSize === s
                            ? 'bg-sky-500 text-white border-sky-400 shadow-md scale-[1.02]'
                            : 'bg-white/5 text-neutral-300 border-white/15 hover:border-white/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SKU Code Nam */}
                <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between px-1">
                  <span>SKU: <strong className="text-neutral-200">{currentVariantNam?.sku}</strong></span>
                  <span className="text-sky-400">● CSDL Trigger Ledger</span>
                </div>

              </div>

              {/* Bộ đếm số lượng Nam & Nút thêm giỏ hàng */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setNamQty(Math.max(1, namQty - 1))}
                      className="px-3 py-2 text-white hover:bg-white/20 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-mono font-bold text-white text-sm min-w-8 text-center">
                      {namQty}
                    </span>
                    <button
                      onClick={() => setNamQty(Math.min(currentVariantNam?.stock || 99, namQty + 1))}
                      className="px-3 py-2 text-white hover:bg-white/20 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCartNam}
                    disabled={!currentVariantNam || currentVariantNam.stock <= 0}
                    className="flex-1 liquid-glass-btn-accent py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Vào Giỏ [{currentVariantNam?.size}]</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleAddToCartNam();
                      navigate('/cart');
                    }}
                    className="flex-1 liquid-glass-btn-dark py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider text-neutral-200 border border-white/20 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Mua Ngay</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/products/${productNam.id}`}
                    className="px-4 py-2.5 text-xs font-mono text-neutral-400 hover:text-white underline underline-offset-4"
                  >
                    Chi tiết kỹ thuật →
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

      </section>

      {/* =========================================================================
          STATEMENT & BENTO GRID SECTION: CHẤT LIỆU BỀN VỮNG (ARTCRAFT 3 COLUMNS)
      ========================================================================== */}
      <section id="statement" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#e60012] uppercase">
            CHẤT LƯỢNG TIÊU CHUẨN QUỐC TẾ
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Chất Liệu Thực Sự Bền Vững. <br />
            Thiết Kế Cho Cuộc Sống Thường Nhật.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Mỗi sợi vải Rayon và Polyeste tái chế đều được kiểm soát nghiêm ngặt theo quy chuẩn chuỗi cung ứng minh bạch.
          </p>
        </div>

        {/* 3 Bento Cards phong cách ArtCraft */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="neo-card p-6 rounded-2xl border border-white/15 space-y-4 hover:border-amber-400/50 transition-all group">
            <div className="text-3xl font-black font-mono text-amber-400 group-hover:scale-110 transition-transform origin-left">
              01
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Sợi Rayon & Polyeste Tái Chế
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              24% Polyeste tái chế trong áo Nữ Rayon 479073 giúp hạn chế rác thải công nghiệp mà vẫn duy trì độ mềm mại, thoáng khí vượt bậc.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Kiểm định Oeko-Tex Standard
            </div>
          </div>

          <div className="neo-card p-6 rounded-2xl border border-white/15 space-y-4 hover:border-sky-400/50 transition-all group">
            <div className="text-3xl font-black font-mono text-sky-400 group-hover:scale-110 transition-transform origin-left">
              02
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Kỹ Thuật Cản Gió Giả Lông Cừu
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Áo Nam 486116 kết hợp lớp vải ngoài lông cừu ấm áp cùng màng lót cản gió chuyên dụng, trang bị dây rút gấu áo điều chỉnh phom dáng linh hoạt.
            </p>
            <div className="pt-2 text-[11px] font-mono text-sky-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Giữ nhiệt & Cản gió tối đa
            </div>
          </div>

          <div className="neo-card p-6 rounded-2xl border border-white/15 space-y-4 hover:border-rose-400/50 transition-all group">
            <div className="text-3xl font-black font-mono text-[#e60012] group-hover:scale-110 transition-transform origin-left">
              03
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Quản Trị CSDL & Đổi Trả 30 Ngày
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Đồng bộ tồn kho thời gian thực qua hệ thống CSDL PostgreSQL. Khách hàng được đổi trả trực tuyến hoặc tại bất kỳ cửa hàng toàn quốc trong 30 ngày.
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tích hợp RBAC & Sổ cái tồn kho
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          DYNAMIC REVIEWS SECTION: ĐÁNH GIÁ THỰC TẾ ĐƯỢC DUYỆT TỪ CSDL ĐỘNG
      ========================================================================== */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>ĐÁNH GIÁ TỪ KHÁCH HÀNG THỰC TẾ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Phản Hồi Đã Được CSKH Phê Duyệt
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Dữ liệu đồng bộ trực tiếp từ bảng <span className="font-mono text-neutral-300">reviews</span> trong CSDL.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            Hiển thị <strong className="text-white">{approvedReviews.length}</strong> đánh giá công khai
          </div>
        </div>

        {approvedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedReviews.map((rev) => {
              const prod = products.find((p) => p.id === rev.product_id);
              return (
                <div
                  key={rev.id}
                  className="neo-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/30 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-sm text-neutral-200 italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-white">{rev.user_name}</div>
                      <div className="text-[10px] text-neutral-400 truncate max-w-[150px]">
                        {prod ? prod.name : 'Sản phẩm chính hãng'}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      Đã Mua Hàng
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 neo-card rounded-2xl border border-white/10">
            <p className="text-xs font-mono text-neutral-400">Chưa có đánh giá nào được duyệt trong CSDL.</p>
          </div>
        )}
      </section>

      {/* =========================================================================
          CAM KẾT DỊCH VỤ TOÀN TRANG (BOTTOM GUARANTEE GRID)
      ========================================================================== */}
      <section className="bg-[#0e0e16] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs font-mono">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e60012] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-1">GIAO HÀNG TOÀN QUỐC 24-48H</h4>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Miễn phí cho mọi đơn từ 500.000₫. Giao tận nơi kiểm tra hàng trước khi thanh toán tiền mặt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-1">ĐỔI TRẢ DỄ DÀNG 30 NGÀY</h4>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Hỗ trợ đổi size, đổi mẫu tại bất kỳ cửa hàng hoặc yêu cầu thu hồi trực tuyến trong 30 ngày.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-1">CHUẨN CSDL POSTGRESQL</h4>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Mô hình CSDL quan hệ chuẩn 37 bảng. Tự động khấu trừ tồn kho và ghi nhận lịch sử minh bạch.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
