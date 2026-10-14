import React from 'react';
import { ShieldCheck, RefreshCw, Truck, Headphones, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="liquid-glass-dark text-neutral-300 pt-16 pb-12 mt-20 border-t border-white/10">
      {/* 4 Cam kết gắn liền với luồng CSDL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-sm liquid-glass-btn-dark flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Giao Hàng Toàn Quốc</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Miễn phí cho đơn từ 500.000đ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-sm liquid-glass-btn-dark flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Đổi Trả Trong 7 Ngày</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Đơn completed hỗ trợ đổi size/mẫu</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-sm liquid-glass-btn-dark flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Hàng Chính Hãng 100%</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Kiểm định chất liệu Rayon, Cotton</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-sm liquid-glass-btn-dark flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Hỗ Trợ Khách Hàng</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Đội ngũ CSKH xử lý yêu cầu 24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 liquid-glass-btn-accent text-white flex items-center justify-center font-black rounded-xs text-base">
                CS
              </div>
              <span className="font-black text-lg text-white tracking-tight">CLOTHES SHOP</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Thương hiệu thời trang ứng dụng hiện đại. Tinh tế trong từng đường kim mũi chỉ, thân thiện với môi trường.
            </p>
          </div>

          <div>
            <h5 className="text-white text-xs font-black mb-4 tracking-wider uppercase text-amber-400">Chính Sách Cửa Hàng</h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Chính sách vận chuyển & COD</li>
              <li>Quy định đổi trả hàng 7 ngày</li>
              <li>Chính sách bảo mật thông tin</li>
              <li>Chương trình tích điểm Loyalty</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-black mb-4 tracking-wider uppercase text-amber-400">Hỗ Trợ Khách Hàng</h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Hướng dẫn chọn size quần áo</li>
              <li>Tra cứu đơn hàng trực tuyến</li>
              <li>Phương thức thanh toán qua VietQR</li>
              <li>Góp ý & Khiếu nại dịch vụ</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-black mb-4 tracking-wider uppercase text-amber-400">Hệ Thống Database</h5>
            <p className="text-xs text-neutral-400 mb-3">
              Dự án đồ án website bán quần áo tích hợp CSDL PostgreSQL chuẩn 37 bảng.
            </p>
            <div className="liquid-glass-btn-dark p-3 rounded-xs border border-white/10 text-[11px] text-neutral-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-mono font-bold">PostgreSQL 16+</span>
              </div>
              <p className="text-neutral-400 text-[10px]">Trigger quản lý tồn kho, đơn hàng và phân quyền RBAC</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center text-[11px] text-neutral-500">
          © 2026 Clothes Website Project. Thiết kế & phát triển cho đồ án chuyên ngành.
        </div>
      </div>
    </footer>
  );
}
