import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Tag, ShieldCheck, Play } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const featuredProduct = PRODUCTS.find((p) => p.id === 1) || PRODUCTS[0];
  const hotProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-16">
      
      {/* Hero Banner Chính - Làm nổi bật Áo Kiểu Nữ Rayon có Video */}
      <section className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[500px] flex items-center shadow-2xl">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/images/products/nu_demo/san_pham1/vngoods_10_479073_3x4.avif"
            alt="Hero background"
            className="w-full h-full object-cover object-top filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Bộ Sưu Tập Thu Đông 2026
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Thanh Lịch Công Sở <br />
              <span className="text-amber-400">Vải Rayon Tái Chế</span>
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base max-w-lg leading-relaxed">
              Trải nghiệm độ mềm mại, thoáng khí vượt trội với thiết kế cổ mở tay lửng 3/4. Tinh tế, hiện đại và thân thiện với môi trường.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={`/products/${featuredProduct.id}`}
                className="px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                Khám Phá Áo Kiểu Nữ <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/products?category=nu"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current text-rose-400" /> Xem Video Trực Tiếp
              </Link>
            </div>
          </div>

          {/* Cột phải: Card sản phẩm nổi bật */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl max-w-xs mx-auto">
              <div className="aspect-[3/4] rounded-xl overflow-hidden relative">
                <img
                  src="/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif"
                  alt="Nữ Áo Kiểu"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-neutral-950/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                  Mã: 479073
                </span>
              </div>
              <div className="pt-3 text-left">
                <p className="text-xs text-amber-400 font-semibold uppercase">Màu 00 WHITE / 10 BEIGE</p>
                <h4 className="font-bold text-white text-sm truncate mt-0.5">Áo Kiểu Vải Rayon Cổ Mở</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-extrabold text-amber-400 text-base">599.000₫</span>
                  <Link
                    to={`/products/${featuredProduct.id}`}
                    className="text-xs bg-white text-neutral-900 px-3 py-1 rounded-full font-bold hover:bg-amber-400 transition-colors"
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
      <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-200">Ưu đãi thành viên</span>
            <h3 className="text-xl sm:text-2xl font-black">Giảm 10% Cho Đơn Hàng Đầu Tiên</h3>
            <p className="text-xs text-amber-100 mt-1">Đăng ký tài khoản khách hàng để tích lũy điểm thưởng loyalty sau mỗi đơn hàng.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-neutral-950/30 p-2 pl-4 rounded-xl border border-white/20 shrink-0">
          <span className="font-mono font-bold tracking-wider text-sm sm:text-base">MÃ: WELCOME10</span>
          <Link
            to="/products"
            className="px-4 py-2 bg-white text-neutral-950 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
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
            <p className="text-sm text-neutral-500 mt-1">Lựa chọn trang phục phù hợp với phong cách của bạn</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/products?category=nu"
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-100 shadow-md flex items-end p-6"
          >
            <img
              src="/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif"
              alt="Thời trang nữ"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="relative z-10 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">Có video sp</span>
              <h3 className="text-xl font-bold">Thời Trang Nữ</h3>
              <p className="text-xs text-neutral-300 mt-1">Áo kiểu, váy đầm công sở & dự tiệc</p>
            </div>
          </Link>

          <Link
            to="/products?category=nam"
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-100 shadow-md flex items-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1625910513413-7fc2a8d13264?w=600&auto=format&fit=crop&q=80"
              alt="Thời trang nam"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="relative z-10 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Xu hướng</span>
              <h3 className="text-xl font-bold">Thời Trang Nam</h3>
              <p className="text-xs text-neutral-300 mt-1">Polo dry pique, sơ mi & jean slim fit</p>
            </div>
          </Link>

          <Link
            to="/products?category=unisex"
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-100 shadow-md flex items-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80"
              alt="Áo khoác & Phụ kiện"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="relative z-10 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Đa năng</span>
              <h3 className="text-xl font-bold">Áo Khoác & Unisex</h3>
              <p className="text-xs text-neutral-300 mt-1">Chống UV, trượt nước siêu nhẹ</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Sản phẩm bán chạy */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Sản Phẩm Đang Được Yêu Thích</h2>
            <p className="text-sm text-neutral-500 mt-1">Các mẫu trang phục hot nhất tuần này tại Clothes Store</p>
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

