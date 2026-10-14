import React from 'react';
import { ShieldCheck, RefreshCw, Truck, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-12 mt-20 border-t border-neutral-800">
      {/* 4 Cam kết gắn liền với luồng CSDL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-y border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-500 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Giao Hàng Toàn Quốc</h4>
              <p className="text-xs text-neutral-400 mt-1">Miễn phí cho đơn từ 500.000đ</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-500 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Đổi Trả Trong 7 Ngày</h4>
              <p className="text-xs text-neutral-400 mt-1">Đơn completed hỗ trợ đổi size/mẫu</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Hàng Chính Hãng 100%</h4>
              <p className="text-xs text-neutral-400 mt-1">Kiểm định chất liệu sợi Rayon, Cotton</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-500 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Chăm Sóc Khách Hàng</h4>
              <p className="text-xs text-neutral-400 mt-1">Đội ngũ CSKH hỗ trợ 24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white text-neutral-900 flex items-center justify-center font-black rounded-lg text-lg">
                CS
              </div>
              <span className="font-bold text-lg text-white">CLOTHES SHOP</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Thương hiệu thời trang ứng dụng hiện đại. Tinh tế trong từng đường kim mũi chỉ, thân thiện với môi trường.
            </p>
          </div>

          <div>
            <h5 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Chính Sách Cửa Hàng</h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Chính sách vận chuyển & COD</li>
              <li>Quy định đổi trả hàng 7 ngày</li>
              <li>Chính sách bảo mật thông tin</li>
              <li>Chương trình tích điểm Loyalty</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Hỗ Trợ Khách Hàng</h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Hướng dẫn chọn size quần áo</li>
              <li>Tra cứu đơn hàng trực tuyến</li>
              <li>Phương thức thanh toán qua VietQR</li>
              <li>Góp ý & Khiếu nại dịch vụ</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Hệ Thống Database</h5>
            <p className="text-xs text-neutral-400 mb-3">
              Dự án đồ án website bán quần áo tích hợp CSDL PostgreSQL chuẩn 37 bảng.
            </p>
            <div className="bg-neutral-800/80 p-3 rounded-lg border border-neutral-700/50 text-[11px] text-neutral-300">
              <span className="text-emerald-400 font-mono font-bold">● PostgreSQL 16+</span>
              <p className="mt-1 text-neutral-400">Trigger quản lý tồn kho & đơn hàng tự động</p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-6 text-center text-xs text-neutral-500">
          © 2026 Clothes Website Project. Thiết kế & phát triển cho đồ án chuyên ngành.
        </div>
      </div>
    </footer>
  );
}

