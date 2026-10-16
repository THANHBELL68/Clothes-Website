import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const isStaffRoute = allowedRoles && allowedRoles.some((r) => ['warehouse', 'cskh', 'admin'].includes(r));

  if (!user) {
    // Nếu là route của nhân sự -> chuyển hướng về trang /staff/login
    // Nếu là route của khách hàng -> chuyển hướng về /login
    const targetLogin = isStaffRoute ? '/staff/login' : '/login';
    return <Navigate to={`${targetLogin}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Nếu route có yêu cầu vai trò cụ thể mà user không có quyền
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const requiredRoleNames = allowedRoles.map((r) => {
      if (r === 'admin') return 'Quản Trị Viên (Admin)';
      if (r === 'warehouse') return 'Quản Lý Kho (Warehouse)';
      if (r === 'cskh') return 'Chăm Sóc Khách Hàng (CSKH)';
      return r;
    }).join(' hoặc ');

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-neutral-300 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto bg-rose-50 text-[#e60012] border border-rose-200 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-neutral-900 tracking-tight uppercase">
          Truy Cập Bị Giới Hạn
        </h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Khu vực này yêu cầu quyền: <strong className="text-neutral-900">{requiredRoleNames}</strong>.
          <br />
          Tài khoản hiện tại của bạn là <strong className="text-neutral-900 font-mono">({user.role}) - {user.full_name}</strong>.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          {isStaffRoute && (
            <Link
              to="/staff/login"
              className="w-full py-2.5 px-4 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Đăng nhập Cổng Nhân Sự Nội Bộ
            </Link>
          )}

          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-neutral-100 text-neutral-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 border border-neutral-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
