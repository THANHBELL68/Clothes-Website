import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw, Truck, Headphones, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-12 mt-20 border-t border-neutral-800">
      
      {/* 4 Cam kết dịch vụ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 border-y border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-neutral-800 flex items-center justify-center text-white shrink-0 border border-neutral-700">
              <Truck className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider">Giao Hàng Toàn Quốc</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Miễn phí cho đơn từ 500.000₫</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-neutral-800 flex items-center justify-center text-white shrink-0 border border-neutral-700">
              <RefreshCw className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider">Đổi Trả Dễ Dàng</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Trong 30 ngày theo quy định CSDL</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-neutral-800 flex items-center justify-center text-white shrink-0 border border-neutral-700">
              <ShieldCheck className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider">Chính Hãng 100%</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Sợi dệt Rayon & Giả lông cừu</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-neutral-800 flex items-center justify-center text-white shrink-0 border border-neutral-700">
              <Headphones className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider">Hỗ Trợ Khách Hàng</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Đội ngũ CSKH xử lý yêu cầu 24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#e60012] text-white flex items-center justify-center font-black text-xs">
                CS
              </div>
              <span className="font-black text-lg text-white tracking-tight">CLOTHES SHOP</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Trang phục thời trang ứng dụng cao cấp. Thiết kế tối giản, tinh tế từng đường may, tôn vinh phong cách sống hiện đại.
            </p>
          </div>

          <div>
            <h5 className="text-white text-xs font-black mb-4 tracking-wider uppercase">Chính Sách Cửa Hàng</h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Chính sách vận chuyển & COD</li>
              <li>Quy định đổi trả hàng 30 ngày</li>
              <li>Chính sách bảo mật thông tin</li>
              <li>Chương trình tích điểm Loyalty</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-black mb-4 tracking-wider uppercase">Hỗ Trợ Khách Hàng</h5>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Hướng dẫn chọn size quần áo</li>
              <li>Tra cứu đơn hàng trực tuyến</li>
              <li>Phương thức thanh toán qua VietQR</li>
              <li>Góp ý & Khiếu nại dịch vụ</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-black mb-4 tracking-wider uppercase">Cơ Sở Dữ Liệu</h5>
            <p className="text-xs text-neutral-400 mb-3">
              Mô hình CSDL PostgreSQL chuẩn 37 bảng với phân quyền RBAC và trigger tồn kho động.
            </p>
            
            {/* Đường liên kết riêng vào cổng nhân sự nội bộ */}
            <div className="pt-2">
              <Link
                to="/staff/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold border border-neutral-700 transition-colors"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Cổng Nhân Sự & Quản Trị</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <span>© 2026 CLOTHES SHOP. Tất cả các quyền được bảo lưu.</span>
          <span className="text-neutral-400">Mã nguồn đồ án Frontend & Database PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}
