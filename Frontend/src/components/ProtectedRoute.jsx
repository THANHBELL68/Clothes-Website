import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore, normalizeRoleCode } from '../store/authStore';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const isStaffRoute =
    allowedRoles &&
    allowedRoles.some((r) =>
      ['warehouse', 'cskh', 'admin', 'WAREHOUSE_MANAGER', 'CS_STAFF', 'SUPER_ADMIN'].includes(r)
    );

  if (!user) {
    // Nếu là route của nhân sự -> chuyển hướng về trang /staff/login
    // Nếu là route của khách hàng -> chuyển hướng về /login
    const targetLogin = isStaffRoute ? '/staff/login' : '/login';
    return <Navigate to={`${targetLogin}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Chuẩn hóa role của user và danh sách allowedRoles
  const userNormalized = normalizeRoleCode(user.role);
  const allowedNormalized = allowedRoles ? allowedRoles.map(normalizeRoleCode) : [];

  // SUPER_ADMIN luôn có quyền truy cập vào các dashboard nội bộ
  const hasAccess =
    allowedNormalized.length === 0 ||
    allowedNormalized.includes(userNormalized) ||
    (isStaffRoute && userNormalized === 'SUPER_ADMIN');

  if (!hasAccess) {
    const requiredRoleNames = allowedRoles
      .map((r) => {
        const norm = normalizeRoleCode(r);
        if (norm === 'SUPER_ADMIN') return 'Quản Trị Viên (SUPER_ADMIN)';
        if (norm === 'WAREHOUSE_MANAGER') return 'Quản Lý Kho (WAREHOUSE_MANAGER)';
        if (norm === 'CS_STAFF') return 'Chăm Sóc Khách Hàng (CS_STAFF)';
        return r;
      })
      .join(' hoặc ');

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#0c0c0c] border border-zinc-800 shadow-2xl text-center space-y-4 font-mono text-xs">
        <div className="w-12 h-12 mx-auto bg-rose-950/60 text-rose-400 border border-rose-800 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white tracking-tight uppercase">
          TRUY CẬP BỊ GIỚI HẠN
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          Khu vực này yêu cầu vai trò: <strong className="text-white">{requiredRoleNames}</strong>.
          <br />
          Tài khoản hiện tại của bạn: <strong className="text-amber-400 font-mono">({user.role}) - {user.full_name}</strong>.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          {isStaffRoute && (
            <Link
              to="/staff/login"
              className="w-full py-2.5 px-4 bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" /> Đăng nhập Cổng Nhân Sự Nội Bộ
            </Link>
          )}

          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-zinc-900 text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-800 border border-zinc-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
