import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Truck, Headphones, Lock, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080808] text-zinc-400 border-t border-zinc-800 font-sans mt-20">
      
      {/* 4 Cam kết dịch vụ kỹ thuật Swiss Grid */}
      <div className="w-full border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="flex items-center gap-4 p-4 border border-zinc-800/80 bg-zinc-950/40">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white shrink-0">
                <Truck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono text-xs">
                <h4 className="text-white font-bold uppercase tracking-wider">GIAO HÀNG TOÀN QUỐC</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Miễn phí cho đơn từ 500.000₫</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-zinc-800/80 bg-zinc-950/40">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white shrink-0">
                <RotateCcw className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-xs">
                <h4 className="text-white font-bold uppercase tracking-wider">ĐỔI TRẢ TRỰC TUYẾN</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Hỗ trợ đổi trả trong 7 ngày</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-zinc-800/80 bg-zinc-950/40">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="font-mono text-xs">
                <h4 className="text-white font-bold uppercase tracking-wider">CHẤT LIỆU CAO CẤP</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Sợi Rayon & Giả lông cừu cản gió</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-zinc-800/80 bg-zinc-950/40">
              <div className="w-10 h-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white shrink-0">
                <Headphones className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono text-xs">
                <h4 className="text-white font-bold uppercase tracking-wider">CSKH & LIVE SUPPORT</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Tư vấn trực tuyến tận tâm</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className="w-4 h-4 text-white"
                >
                  <path d="M12 3 L3 21 H7 L9.5 15 H14.5 L17 21 H21 L12 3 Z" />
                  <line x1="9.5" y1="15" x2="14.5" y2="15" />
                </svg>
              </div>
              <div>
                <span className="font-inter font-black text-sm text-white tracking-tight block">
                  AETHER LABS
                </span>
                <span className="text-[9px] text-zinc-500 tracking-widest uppercase block -mt-0.5">
                  TECHWEAR STUDIO
                </span>
              </div>
            </div>

            <p className="text-zinc-400 font-sans text-xs leading-relaxed">
              Thương hiệu thời trang Streetwear & Techwear cao cấp. Tối giản cấu trúc, tối ưu công năng, ứng dụng công nghệ rập hiện đại.
            </p>

            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
              HÀ NỘI // VIỆT NAM
            </div>
          </div>

          {/* Cột 1: Danh Mục */}
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-2">
              BỘ SƯU TẬP
            </h5>
            <ul className="space-y-2 text-zinc-400 text-[11px]">
              <li>
                <Link to="/products?category=nu" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>THỜI TRANG NỮ [RAYON]</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </Link>
              </li>
              <li>
                <Link to="/products?category=nam" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>THỜI TRANG NAM [LÔNG CỪU]</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>ALL DROPS // TẤT CẢ</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>WISHLIST ARCHIVE</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2: Khách Hàng & Tra Cứu */}
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-2">
              HỖ TRỢ & TRA CỨU
            </h5>
            <ul className="space-y-2 text-zinc-400 text-[11px]">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  THEO DÕI ĐƠN HÀNG
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition-colors">
                  THANH TOÁN TRỰC TUYẾN (VIETQR)
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  HỒ SƠ THÀNH VIÊN & TÍCH ĐIỂM
                </Link>
              </li>
              <li>
                <span className="text-zinc-500 cursor-default">
                  CHÍNH SÁCH ĐỔI TRẢ 7 NGÀY
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông Tin Liên Hệ */}
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-zinc-800 pb-2">
              THÔNG TIN LIÊN HỆ
            </h5>
            <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2 text-[11px] text-zinc-300">
              <p className="flex items-center justify-between">
                <span className="text-zinc-500">HOTLINE:</span>
                <span className="font-bold text-white">1900 6868</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-zinc-500">EMAIL:</span>
                <span className="text-white">support@aetherlabs.vn</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-zinc-500">GIỜ LÀM VIỆC:</span>
                <span className="text-white">09:00 - 22:00</span>
              </p>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
              Aether Labs Studio — Thiết kế trang phục hiện đại cho nhịp sống đô thị.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800/80 px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-zinc-500 gap-3">
        <span>© 2026 AETHER LABS CORP. ALL RIGHTS RESERVED.</span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">ENGINEERED FOR MODERN NOMADS</span>
          <button
            onClick={scrollToTop}
            className="hover:text-white uppercase transition-colors underline cursor-pointer"
          >
            [ VỀ ĐẦU TRANG &uarr; ]
          </button>
        </div>
      </div>

    </footer>
  );
}
