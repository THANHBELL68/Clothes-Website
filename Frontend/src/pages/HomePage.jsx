import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Tag, Play, Pause, Volume2, VolumeX, Video, VideoOff } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const featuredProduct = PRODUCTS.find((p) => p.id === 1) || PRODUCTS[0];
  const hotProducts = PRODUCTS.slice(0, 4);

  // Trạng thái điều khiển video nền của sản phẩm nữ (Áo Kiểu Vải Rayon)
  const [isProductVideoActive, setIsProductVideoActive] = useState(true);
  const [isProductVideoMuted, setIsProductVideoMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const vid = document.getElementById('hero-product-video');
    if (vid) {
      if (isPlaying) {
        vid.pause();
        setIsPlaying(false);
      } else {
        vid.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="space-y-16">
      
      {/* =========================================================================
          HERO BANNER CHÍNH - VIDEO NỀN SẢN PHẨM NỮ TỰ ĐỘNG CHẠY CÓ THỂ TẮT MỞ
          Góc cạnh sắc nét, hiệu ứng Liquid Glass
      ========================================================================== */}
      <section className="relative rounded-sm overflow-hidden bg-neutral-950 text-white min-h-[540px] flex items-center shadow-2xl border border-white/10">
        
        {/* Nền Video hoặc Ảnh tĩnh chuyển đổi linh hoạt */}
        {isProductVideoActive ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              id="hero-product-video"
              src="/images/products/nu_demo/san_pham1/video_intro.mp4"
              autoPlay
              loop
              muted={isProductVideoMuted}
              playsInline
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.1] scale-105"
            />
            {/* Lớp phủ Liquid Glass Frosted chuyển tiếp */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent backdrop-blur-[1px]"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <img
              src="/images/products/nu_demo/san_pham1/vngoods_10_479073_3x4.avif"
              alt="Hero background"
              className="w-full h-full object-cover object-top filter brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>
          </div>
        )}

        {/* Nội dung trên Banner */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm liquid-glass text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bộ Sưu Tập Nữ Thu Đông 2026 • Video Trực Tuyến</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Thanh Lịch Từng Đường Nét <br />
              <span className="text-amber-400">Áo Kiểu Nữ Vải Rayon Tái Chế</span>
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base max-w-lg leading-relaxed">
              Trải nghiệm độ mềm mại, thoáng mát và co giãn nhẹ với công nghệ dệt cao cấp. 
              Video trình diễn thực tế chuyển động sống động của trang phục trên người mẫu.
            </p>

            {/* Cụm nút hành động góc cạnh Liquid Glass */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/products/${featuredProduct.id}`}
                className="liquid-glass-btn-accent px-6 py-3.5 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl"
              >
                <span>Xem & Đặt Mua Áo Kiểu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Nút Bật/Tắt Video Nền Sản Phẩm */}
              <button
                onClick={() => setIsProductVideoActive(!isProductVideoActive)}
                className="liquid-glass-btn px-4 py-3 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                title="Bật hoặc tắt video nền sản phẩm nữ"
              >
                {isProductVideoActive ? (
                  <>
                    <VideoOff className="w-4 h-4 text-rose-400" />
                    <span>Tắt Video Nền SP</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Bật Video Nền SP</span>
                  </>
                )}
              </button>

              {/* Nếu đang bật video, cho phép Mute/Unmute & Play/Pause */}
              {isProductVideoActive && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="liquid-glass-btn p-3 text-white"
                    title={isPlaying ? 'Tạm dừng video' : 'Phát tiếp video'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-400 fill-current" />}
                  </button>

                  <button
                    onClick={() => setIsProductVideoMuted(!isProductVideoMuted)}
                    className="liquid-glass-btn p-3 text-white"
                    title={isProductVideoMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  >
                    {isProductVideoMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2 text-xs text-neutral-400">
              <span>✓ Mã SKU: 479073-COL00</span>
              <span>•</span>
              <span>✓ Đủ size S, M, L, XL</span>
              <span>•</span>
              <span>✓ Giao nhanh 24h</span>
            </div>
          </div>

          {/* Cột phải: Card sản phẩm nổi bật phong cách Liquid Glass */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="liquid-glass p-4 rounded-sm border border-white/20 shadow-2xl max-w-xs mx-auto">
              <div className="aspect-[3/4] rounded-xs overflow-hidden relative border border-white/10">
                <img
                  src="/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif"
                  alt="Nữ Áo Kiểu"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 liquid-glass-btn-dark text-white text-[10px] font-bold px-2 py-0.5">
                  MÃ: 479073
                </span>
                <span className="absolute bottom-2 left-2 liquid-glass-btn text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current text-rose-400" /> 1080p Intro
                </span>
              </div>
              <div className="pt-3 text-left">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Màu 00 WHITE / 10 BEIGE</p>
                <h4 className="font-bold text-white text-sm truncate mt-0.5">Áo Kiểu Vải Rayon Cổ Mở</h4>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-black text-amber-400 text-base">599.000₫</span>
                  <Link
                    to={`/products/${featuredProduct.id}`}
                    className="liquid-glass-btn px-3 py-1.5 text-white text-xs font-bold"
                  >
                    Xem Ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Mã Giảm Giá Khách Hàng (Tương ứng bảng coupons trong DB) */}
      <section className="liquid-glass-btn-accent text-white rounded-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-amber-300/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 liquid-glass rounded-sm flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-amber-200">Ưu đãi thành viên CSDL</span>
            <h3 className="text-xl sm:text-2xl font-black">Giảm 10% Cho Đơn Hàng Đầu Tiên</h3>
            <p className="text-xs text-amber-100 mt-1">Đăng ký tài khoản khách hàng để tích lũy điểm thưởng loyalty sau mỗi đơn hàng thành công.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 liquid-glass-btn-dark p-2 pl-4 rounded-sm border border-white/20 shrink-0">
          <span className="font-mono font-bold tracking-wider text-xs sm:text-sm text-amber-300">MÃ: WELCOME10</span>
          <Link
            to="/products"
            className="px-4 py-2 liquid-glass text-neutral-900 rounded-sm text-xs font-black uppercase tracking-wider"
          >
            Mua Ngay
          </Link>
        </div>
      </section>

      {/* Danh Mục Thời Trang Nhanh */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Danh Mục Nổi Bật</h2>
            <p className="text-xs text-neutral-500 mt-1">Lựa chọn trang phục phù hợp với phong cách và nhu cầu của bạn</p>
          </div>
          <Link to="/products" className="liquid-glass-btn px-3 py-1.5 text-xs font-bold text-neutral-800 flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/products?category=nu"
            className="group relative rounded-sm overflow-hidden aspect-[16/10] bg-neutral-900 shadow-md flex items-end p-6 border border-neutral-200 hover:shadow-2xl transition-all"
          >
            <img
              src="/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif"
              alt="Thời trang nữ"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
            <div className="relative z-10 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <Play className="w-3 h-3 fill-current text-rose-400" /> Có video sản phẩm
              </span>
              <h3 className="text-xl font-black mt-1">Thời Trang Nữ</h3>
              <p className="text-xs text-neutral-300 mt-0.5">Áo kiểu Rayon, sơ mi lụa & chân váy</p>
            </div>
          </Link>

          <Link
            to="/products?category=nam"
            className="group relative rounded-sm overflow-hidden aspect-[16/10] bg-neutral-900 shadow-md flex items-end p-6 border border-neutral-200 hover:shadow-2xl transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1625910513413-7fc2a8d13264?w=600&auto=format&fit=crop&q=80"
              alt="Thời trang nam"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
            <div className="relative z-10 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Xu hướng mới</span>
              <h3 className="text-xl font-black mt-1">Thời Trang Nam</h3>
              <p className="text-xs text-neutral-300 mt-0.5">Polo Dry Pique, sơ mi Oxford & quần âu</p>
            </div>
          </Link>

          <Link
            to="/products?category=unisex"
            className="group relative rounded-sm overflow-hidden aspect-[16/10] bg-neutral-900 shadow-md flex items-end p-6 border border-neutral-200 hover:shadow-2xl transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80"
              alt="Áo khoác & Phụ kiện"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
            <div className="relative z-10 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Đa năng</span>
              <h3 className="text-xl font-black mt-1">Áo Khoác & Unisex</h3>
              <p className="text-xs text-neutral-300 mt-0.5">Chống UV BlockTech, trượt nước siêu nhẹ</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Sản phẩm bán chạy */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Sản Phẩm Đang Được Yêu Thích</h2>
            <p className="text-xs text-neutral-500 mt-1">Được cập nhật tự động từ kho dữ liệu Clothes Store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}
