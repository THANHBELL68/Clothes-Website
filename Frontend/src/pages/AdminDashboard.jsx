import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Sliders,
  Activity,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  RotateCcw,
  Star,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  ClipboardList,
  ArrowDownLeft,
  ArrowUpRight,
  Headphones,
  Check,
  Send,
  Eye,
  Plus,
  AlertTriangle,
  Gift,
  Ticket,
  ChevronRight,
  Filter,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import {
  useAuthStore,
  normalizeRoleCode,
  getUserPermissions,
  hasPermission,
  ROLE_PERMISSIONS_MAP,
} from '../store/authStore';
import { useDbStore } from '../store/dbStore';
import { useOrderStore } from '../store/orderStore';
import { useChatStore } from '../store/chatStore';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, allUsers, toggleUserActive, changeUserRole, switchRolePersona, logout } = useAuthStore();
  const {
    products,
    stockDocuments,
    stocktakes,
    stockMovements,
    refunds,
    reviews,
    vouchers,
    loyaltyRewards,
    auditLogs,
    systemSettings,
    createStockDocument,
    createStocktake,
    applyStocktakeBalance,
    updateRefundStatus,
    moderateReview,
    createVoucher,
    toggleVoucherStatus,
    updateSettings,
    logAudit,
  } = useDbStore();
  const { orders } = useOrderStore();
  const { conversations, messages, sendMessage, markAsRead } = useChatStore();

  // Chuẩn hóa vai trò và quyền hạn từ view v_user_permissions
  const currentRole = normalizeRoleCode(user?.role);
  const userPermissions = useMemo(() => getUserPermissions(user), [user]);

  // Danh sách các tab được phép hiển thị dựa trên permissions
  const availableTabs = useMemo(() => {
    const tabs = [];

    // 1. Phân quyền CSKH (CS_STAFF)
    if (userPermissions.includes('ORDER_CONFIRM_CANCEL')) {
      tabs.push({ id: 'cskh_orders', label: 'Xác Nhận Đơn Hàng', icon: CheckCircle, module: 'CSKH' });
    }
    if (userPermissions.includes('RETURN_REQUEST_REVIEW')) {
      tabs.push({ id: 'cskh_returns', label: 'Duyệt Đổi Trả', icon: RotateCcw, module: 'CSKH' });
    }
    if (userPermissions.includes('REFUND_TRACK')) {
      tabs.push({ id: 'cskh_refunds', label: 'Cập Nhật Hoàn Tiền', icon: DollarSign, module: 'CSKH' });
    }
    if (userPermissions.includes('REVIEW_MODERATE')) {
      tabs.push({ id: 'cskh_reviews', label: 'Kiểm Duyệt Đánh Giá', icon: Star, module: 'CSKH' });
    }
    if (userPermissions.includes('LIVECHAT_REPLY')) {
      tabs.push({ id: 'cskh_livechat', label: 'Trả Lời Live Chat', icon: MessageSquare, module: 'CSKH' });
    }

    // 2. Phân quyền Quản Lý Kho (WAREHOUSE_MANAGER)
    if (userPermissions.includes('PRODUCT_MANAGE')) {
      tabs.push({ id: 'wh_inventory', label: 'Tồn Kho & Biến Thể', icon: Package, module: 'KHO' });
    }
    if (userPermissions.includes('STOCK_IO_MANAGE')) {
      tabs.push({ id: 'wh_documents', label: 'Phiếu Xuất / Nhập Kho', icon: ClipboardList, module: 'KHO' });
    }
    if (userPermissions.includes('STOCKTAKE_MANAGE')) {
      tabs.push({ id: 'wh_stocktake', label: 'Kiểm Kê Kho', icon: Filter, module: 'KHO' });
    }
    if (userPermissions.includes('ORDER_STATUS_UPDATE')) {
      tabs.push({ id: 'wh_orders', label: 'Tiến Độ Đơn Hàng', icon: Truck, module: 'KHO' });
    }

    // 3. Phân quyền Quản Trị Viên (SUPER_ADMIN)
    if (userPermissions.includes('ACCOUNT_ROLE_MANAGE')) {
      tabs.push({ id: 'admin_users', label: 'Tài Khoản & Vai Trò', icon: Users, module: 'ADMIN' });
    }
    if (userPermissions.includes('SYSTEM_CONFIG')) {
      tabs.push({ id: 'admin_settings', label: 'Cấu Hình Hệ Thống', icon: Sliders, module: 'ADMIN' });
    }
    if (userPermissions.includes('MARKETING_MANAGE')) {
      tabs.push({ id: 'admin_marketing', label: 'Marketing & Vouchers', icon: Ticket, module: 'ADMIN' });
    }
    if (userPermissions.includes('LOG_VIEW')) {
      tabs.push({ id: 'admin_logs', label: 'Nhật Ký Hoạt Động', icon: Activity, module: 'ADMIN' });
    }
    if (userPermissions.includes('REPORT_ALL_VIEW')) {
      tabs.push({ id: 'admin_reports', label: 'Báo Cáo Toàn Sàn', icon: TrendingUp, module: 'ADMIN' });
    }

    return tabs;
  }, [userPermissions]);

  // Tab đang được chọn
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'cskh_orders');

  const validTabIds = useMemo(() => availableTabs.map((t) => t.id).join(','), [availableTabs]);

  // Đảm bảo tab hợp lệ khi đổi vai trò
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [validTabIds, activeTab]);

  // Modal hiển thị danh sách quyền chi tiết từ v_user_permissions
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // States cho các form thao tác
  // Modal từ chối đổi trả (bắt buộc reject_reason theo DB check constraint)
  const [rejectModal, setRejectModal] = useState({ open: false, order: null });
  const [rejectReason, setRejectReason] = useState('Sản phẩm đã qua sử dụng hoặc mất nhãn mác');

  // Modal tạo phiếu xuất kho (export) - Kiểm tra chặt chẽ order.status === 'packing'
  const [exportModal, setExportModal] = useState({ open: false, order: null, carrierId: 1, trackingCode: '' });

  // Modal tạo phiếu nhập kho (import)
  const [importForm, setImportForm] = useState({
    supplierName: 'Xưởng May Vải Rayon Cao Cấp Hà Nội',
    variantId: 101,
    quantity: 20,
    unitCost: 320000,
  });

  // Modal tạo đợt kiểm kê kho (stocktake)
  const [stocktakeForm, setStocktakeForm] = useState({
    note: 'Kiểm kê định kỳ tháng 10/2026',
    items: [
      { variant_id: 101, sku: 'AKN-479073-00-S', product_name: 'Áo Rayon Nữ (Trắng / S)', system_quantity: 22, actual_quantity: 22 },
      { variant_id: 202, sku: 'AKM-486116-69-M', product_name: 'Áo Khoác Nam (Navy / M)', system_quantity: 32, actual_quantity: 32 },
    ],
  });

  // Live Chat: Cuộc trò chuyện đang chọn để trả lời
  const [selectedChatId, setSelectedChatId] = useState(conversations[0]?.id || 1);
  const [chatReplyInput, setChatReplyInput] = useState('');

  // Settings form
  const [settingsForm, setSettingsForm] = useState(systemSettings);

  // Voucher form
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    name: '',
    discount_type: 'percent',
    discount_value: 10,
    max_discount_amount: 100000,
    min_order_value: 300000,
    start_at: '2026-10-16T00:00:00Z',
    end_at: '2026-12-31T23:59:59Z',
    is_active: true,
  });

  // --- HANDLERS: CSKH ---

  // CSKH: Xác nhận đơn hàng (new -> processing)
  const handleConfirmOrder = (order) => {
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id ? { ...o, status: 'processing' } : o
      ),
    }));
    logAudit(user?.full_name || 'Phạm CSKH', 'CONFIRM_ORDER', order.code, 'CSKH xác nhận đơn hàng mới -> Chuyển sang xử lý');
    toast.success(`Đã xác nhận đơn hàng ${order.code} thành công!`);
  };

  // CSKH: Hủy đơn hàng có lý do
  const handleCancelOrder = (orderId, code) => {
    const reason = prompt('Nhập lý do hủy đơn hàng:');
    if (!reason) return;
    const res = useOrderStore.getState().cancelOrder(orderId, reason);
    if (res.success) {
      logAudit(user?.full_name || 'Phạm CSKH', 'CANCEL_ORDER', code, `CSKH hủy đơn: ${reason}`);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // CSKH: Duyệt đổi trả (status -> approved)
  const handleApproveReturn = (order) => {
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              return_request: {
                ...o.return_request,
                status: 'approved',
                reviewed_by: user?.full_name || 'Phạm CSKH',
                reviewed_at: new Date().toISOString(),
              },
            }
          : o
      ),
    }));
    logAudit(user?.full_name || 'Phạm CSKH', 'APPROVE_RETURN', order.code, 'CSKH duyệt yêu cầu đổi trả');
    toast.success(`Đã duyệt yêu cầu đổi trả cho đơn ${order.code}! Yêu cầu được gửi sang bộ phận Kho.`);
  };

  // CSKH: Từ chối đổi trả (bắt buộc reject_reason)
  const handleRejectReturnSubmit = (e) => {
    e.preventDefault();
    if (!rejectModal.order) return;
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === rejectModal.order.id
          ? {
              ...o,
              return_request: {
                ...o.return_request,
                status: 'rejected',
                reject_reason: rejectReason,
                reviewed_by: user?.full_name || 'Phạm CSKH',
                reviewed_at: new Date().toISOString(),
              },
            }
          : o
      ),
    }));
    logAudit(user?.full_name || 'Phạm CSKH', 'REJECT_RETURN', rejectModal.order.code, `Từ chối đổi trả: ${rejectReason}`);
    toast.success(`Đã từ chối yêu cầu đổi trả đơn ${rejectModal.order.code}`);
    setRejectModal({ open: false, order: null });
  };

  // CSKH: Gửi tin nhắn trả lời Live Chat
  const handleSendChatReply = (e) => {
    e.preventDefault();
    if (!chatReplyInput.trim()) return;

    sendMessage({
      conversation_id: selectedChatId,
      sender_type: 'staff',
      sender_id: user?.id || 3,
      content: chatReplyInput.trim(),
    });

    logAudit(user?.full_name || 'Phạm CSKH', 'CHAT_REPLY', `Hội thoại #${selectedChatId}`, chatReplyInput.trim());
    setChatReplyInput('');
    toast.success('Đã gửi phản hồi trực tuyến tới khách hàng!');
  };

  // --- HANDLERS: QUẢN LÝ KHO ---

  // Quản lý kho: Tạo phiếu xuất kho (export)
  // * QUY TẮC CSDL: Chỉ cho tạo phiếu xuất export khi đơn đang ở trạng thái PACKING!
  const handleCreateExportSubmit = (e) => {
    e.preventDefault();
    const order = exportModal.order;
    if (!order) return;

    if (order.status !== 'packing') {
      toast.error(`Đơn hàng ${order.code} đang ở trạng thái "${order.status}". Cần chuyển sang "ĐÓNG GÓI" trước khi xuất kho!`);
      return;
    }

    const carrierName = exportModal.carrierId === 1 ? 'Giao Hàng Nhanh (GHN)' : 'Giao Hàng Tiết Kiệm (GHTK)';
    const tracking = exportModal.trackingCode || (exportModal.carrierId === 1 ? 'GHN' : 'GHTK') + Date.now().toString().slice(-7);

    const res = createStockDocument({
      type: 'export',
      order,
      carrierId: exportModal.carrierId,
      carrierName,
      trackingCode: tracking,
      userName: user?.full_name || 'Lê Thủ Kho',
    });

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    // Chuyển đơn sang shipping trong orderStore
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id ? { ...o, status: 'shipping', tracking_code: tracking } : o
      ),
    }));

    toast.success(`Đã tạo phiếu xuất kho ${res.document.code} và chuyển đơn sang ĐANG GIAO HÀNG (shipping)!`);
    setExportModal({ open: false, order: null, carrierId: 1, trackingCode: '' });
  };

  // Quản lý kho: Tạo phiếu nhập kho (import)
  const handleCreateImportSubmit = (e) => {
    e.preventDefault();
    const product = products.find((p) => p.variants?.some((v) => v.id === Number(importForm.variantId)));
    const variant = product?.variants?.find((v) => v.id === Number(importForm.variantId));

    const res = createStockDocument({
      type: 'import',
      supplierName: importForm.supplierName,
      items: [
        {
          id: Date.now(),
          variant_id: Number(importForm.variantId),
          sku: variant?.sku || 'SKU-IMPORT',
          product_name: product?.name || 'Sản phẩm',
          quantity: Number(importForm.quantity),
          unit_cost: Number(importForm.unitCost),
        },
      ],
      userName: user?.full_name || 'Lê Thủ Kho',
    });

    if (res.success) {
      toast.success(`Đã tạo phiếu nhập kho ${res.document.code} (+${importForm.quantity} chiếc vào tồn kho)!`);
    }
  };

  // Quản lý kho: Tạo đợt kiểm kê (stocktake)
  const handleCreateStocktakeSubmit = (e) => {
    e.preventDefault();
    const newStocktake = createStocktake({
      note: stocktakeForm.note,
      items: stocktakeForm.items,
      userName: user?.full_name || 'Lê Thủ Kho',
    });
    toast.success(`Đã tạo đợt kiểm kê ${newStocktake.code} thành công!`);
  };

  // Quản lý kho: Cân bằng tồn kho từ phiếu kiểm kê
  const handleApplyBalance = (stocktakeId) => {
    const res = applyStocktakeBalance(stocktakeId, user?.full_name || 'Lê Thủ Kho');
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Quản lý kho: Chuyển bước tiến độ đơn hàng
  const handleAdvanceOrderStatus = (orderId, newStatus) => {
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ),
    }));
    logAudit(user?.full_name || 'Lê Thủ Kho', 'ORDER_STATUS_UPDATE', `Đơn #${orderId}`, `Chuyển trạng thái sang: ${newStatus.toUpperCase()}`);
    toast.success(`Đã chuyển đơn hàng sang: ${newStatus.toUpperCase()}`);
  };

  // --- HANDLERS: SUPER ADMIN ---
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(settingsForm, user?.full_name || 'Super Admin');
    toast.success('Đã cập nhật cấu hình hệ thống thành công!');
  };

  const handleCreateVoucherSubmit = (e) => {
    e.preventDefault();
    if (!voucherForm.code.trim()) {
      toast.error('Vui lòng nhập mã Voucher!');
      return;
    }
    createVoucher(voucherForm, user?.full_name || 'Super Admin');
    toast.success(`Đã tạo thành công voucher: ${voucherForm.code.toUpperCase()}`);
    setVoucherForm({
      code: '',
      name: '',
      discount_type: 'percent',
      discount_value: 10,
      max_discount_amount: 100000,
      min_order_value: 300000,
      start_at: '2026-10-16T00:00:00Z',
      end_at: '2026-12-31T23:59:59Z',
      is_active: true,
    });
  };

  // Thống kê toàn sàn
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalUnitsSold = orders.reduce(
    (sum, o) => sum + (o.status !== 'cancelled' ? o.items.reduce((s, it) => s + it.quantity, 0) : 0),
    0
  );
  const totalStockUnits = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4 text-[#fafafa] font-sans selection:bg-white selection:text-black">
      
      {/* 1. TOP COMMAND BAR // DARK TECHNICAL BRUTALISM */}
      <div className="bg-[#0c0c0c] border border-zinc-800 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-emerald-400 uppercase font-bold">
              PORTAL NỘI BỘ // HỆ THỐNG QUẢN TRỊ
            </span>
          </div>
          <h1 className="font-inter font-black text-2xl tracking-tight text-white uppercase flex items-center gap-2">
            AETHER COMMAND CENTER
            <span className="text-xs font-mono font-normal text-zinc-500 lowercase">
              /staff/portal
            </span>
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Hệ thống phân quyền nội bộ dành cho nhân viên vận hành và quản lý Aether Labs.
          </p>
        </div>

        {/* Cụm thông tin User, phân quyền & Nút Đăng xuất nội bộ */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right font-mono text-xs">
            <p className="text-zinc-500 uppercase text-[10px]">Tài khoản đang trực:</p>
            <p className="text-white font-bold">{user?.full_name || 'Trần Quản Trị'}</p>
            <div className="flex items-center gap-2 mt-0.5 justify-end">
              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                currentRole === 'SUPER_ADMIN'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                  : currentRole === 'WAREHOUSE_MANAGER'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              }`}>
                {currentRole}
              </span>
              <button
                onClick={() => setShowPermissionsModal(true)}
                className="text-[9px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                ({userPermissions.length} quyền hợp lệ)
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/staff/login');
              toast.success('Đã đăng xuất khỏi Cổng Nội Bộ!');
            }}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-rose-500 hover:bg-rose-950/40 hover:text-rose-300 text-zinc-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Đăng xuất khỏi hệ thống quản trị"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ĐĂNG XUẤT</span>
          </button>
        </div>
      </div>

      {/* 2. THANH CHUYỂN ĐỔI VAI TRÒ NHANH ĐỂ KIỂM THỬ (ROLE SIMULATION BAR) */}
      <div className="bg-[#121212] border border-zinc-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span className="w-2 h-2 bg-amber-400 rounded-full" />
          <strong className="text-white uppercase tracking-wider">CHUYỂN ĐỔI VAI TRÒ NHANH (TESTING RBAC):</strong>
          <span className="hidden md:inline text-zinc-500">Click để kiểm tra menu thay đổi theo permissions</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              switchRolePersona('CS_STAFF');
              toast.success('Đã chuyển sang vai trò: CS_STAFF (Nhân viên CSKH)!');
            }}
            className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'CS_STAFF'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Headphones className="w-3 h-3" />
            <span>CS_STAFF (CSKH)</span>
          </button>

          <button
            onClick={() => {
              switchRolePersona('WAREHOUSE_MANAGER');
              toast.success('Đã chuyển sang vai trò: WAREHOUSE_MANAGER (Quản lý kho)!');
            }}
            className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'WAREHOUSE_MANAGER'
                ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>WAREHOUSE_MANAGER (KHO)</span>
          </button>

          <button
            onClick={() => {
              switchRolePersona('SUPER_ADMIN');
              toast.success('Đã chuyển sang vai trò: SUPER_ADMIN (Admin tối cao)!');
            }}
            className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'SUPER_ADMIN'
                ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>SUPER_ADMIN (ADMIN)</span>
          </button>
        </div>
      </div>

      {/* 3. MENU TABS ĐỘNG THEO PERMISSIONS TỪ VIEW v_user_permissions */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto no-scrollbar pb-1">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-[#0f0f0f] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[9px] px-1 py-0.2 border font-mono ${
                isActive ? 'bg-zinc-200 text-black border-zinc-300' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}>
                {tab.module}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. CÁC MÀN HÌNH CHỨC NĂNG PHÂN QUYỀN */}
      {/* ========================================================================= */}

      {/* === MODULE CSKH 1: XÁC NHẬN ĐƠN HÀNG (new -> processing) === */}
      {activeTab === 'cskh_orders' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                MÀN HÌNH XÁC NHẬN ĐƠN HÀNG MỚI (new &rarr; processing)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-emerald-400">ORDER_CONFIRM_CANCEL</code>. Đơn ở trạng thái <code>new</code> cần CSKH gọi điện hoặc xác thực thông tin trước khi chuyển sang đóng gói.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Khách Hàng & SĐT</th>
                  <th className="p-3">Địa Chỉ Nhận</th>
                  <th className="p-3">Sản Phẩm</th>
                  <th className="p-3">Tổng Tiền</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác CSKH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders
                  .filter((o) => o.status === 'new' || o.status === 'processing')
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-bold text-white">{order.code}</td>
                      <td className="p-3">
                        <strong className="text-white font-sans">{order.receiver_name}</strong>
                        <p className="text-[11px] text-zinc-500">{order.receiver_phone}</p>
                      </td>
                      <td className="p-3 max-w-xs truncate text-zinc-400">{order.shipping_address}</td>
                      <td className="p-3">
                        {order.items.map((it) => (
                          <div key={it.id} className="text-[11px] text-zinc-300">
                            • {it.product_name} ({it.size}/{it.color}) x{it.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {order.total.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          order.status === 'new'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-blue-950/60 text-blue-300 border-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {order.status === 'new' ? (
                          <button
                            onClick={() => handleConfirmOrder(order)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            XÁC NHẬN ĐƠN
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">Đã xác nhận</span>
                        )}

                        <button
                          onClick={() => handleCancelOrder(order.id, order.code)}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-rose-950 border border-zinc-700 hover:border-rose-800 text-zinc-400 hover:text-rose-400 font-mono text-[11px] cursor-pointer"
                          title="Hủy đơn theo yêu cầu"
                        >
                          Hủy
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === MODULE CSKH 2: DUYỆT YÊU CẦU ĐỔI TRẢ (return_requests) === */}
      {activeTab === 'cskh_returns' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                DUYỆT YÊU CẦU ĐỔI TRẢ HÀNG (return_requests)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-amber-400">RETURN_REQUEST_REVIEW</code>. Chỉ đơn hoàn tất trong 7 ngày được gửi yêu cầu. Nếu từ chối, bắt buộc nhập lý do (NOT NULL).
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {orders
              .filter((o) => o.return_request)
              .map((order) => {
                const req = order.return_request;
                return (
                  <div key={order.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{order.code}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                          req.type === 'exchange'
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800'
                        }`}>
                          {req.type === 'exchange' ? 'YÊU CẦU ĐỔI HÀNG' : 'YÊU CẦU HOÀN TIỀN'}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                          req.status === 'pending'
                            ? 'bg-amber-500 text-black'
                            : req.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-zinc-400">
                        Khách hàng: <strong className="text-white font-sans">{order.receiver_name}</strong> ({order.receiver_phone})
                      </p>
                      <p className="text-zinc-400">
                        Lý do: <strong className="text-zinc-200">{req.reason}</strong>
                      </p>
                      <p className="p-2.5 bg-[#161616] border border-zinc-800 text-zinc-300 italic font-sans">
                        "{req.description}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveReturn(order)}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> DUYỆT CHẤP THUẬN
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, order })}
                            className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> TỪ CHỐI
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* === MODULE CSKH 3: CẬP NHẬT HOÀN TIỀN (refunds) === */}
      {activeTab === 'cskh_refunds' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                THEO DÕI & CẬP NHẬT HOÀN TIỀN (refunds)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-emerald-400">REFUND_TRACK</code>. Xử lý các khoản hoàn tiền ngân hàng cho khách hàng theo yêu cầu đổi/trả.
              </p>
            </div>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3">Mã Hoàn Tiền</th>
                <th className="p-3">Mã Đơn / Khách Hàng</th>
                <th className="p-3">Tài Khoản Thụ Hưởng</th>
                <th className="p-3">Số Tiền Hoàn</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Cập Nhật Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {refunds.map((ref) => (
                <tr key={ref.id} className="hover:bg-zinc-900/40">
                  <td className="p-3 font-bold text-white">REF-{ref.id}</td>
                  <td className="p-3">
                    <strong className="text-white">{ref.order_code}</strong>
                    <p className="text-[11px] text-zinc-500 font-sans">{ref.customer_name} ({ref.customer_phone})</p>
                  </td>
                  <td className="p-3 text-zinc-300">
                    <p className="font-bold">{ref.bank_name}</p>
                    <p className="text-[11px] text-zinc-400">{ref.bank_account_number} • {ref.bank_account_name}</p>
                  </td>
                  <td className="p-3 font-bold text-emerald-400">
                    {ref.amount.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                      ref.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : ref.status === 'processing'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {ref.status === 'pending' && (
                      <button
                        onClick={() => updateRefundStatus(ref.id, 'processing', user?.full_name)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                      >
                        Đang chuyển tiền
                      </button>
                    )}
                    {ref.status !== 'completed' && (
                      <button
                        onClick={() => updateRefundStatus(ref.id, 'completed', user?.full_name)}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase cursor-pointer"
                      >
                        Xác nhận hoàn tất
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === MODULE CSKH 4: KIỂM DUYỆT ĐÁNH GIÁ (reviews) === */}
      {activeTab === 'cskh_reviews' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                KIỂM DUYỆT ĐÁNH GIÁ SẢN PHẨM (reviews)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-amber-400">REVIEW_MODERATE</code>. Chỉ các đánh giá có trạng thái <code>approved</code> mới xuất hiện trên trang sản phẩm Storefront.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 flex items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-sans">{rev.user_name}</strong>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                      rev.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : rev.status === 'pending'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-zinc-300 italic font-sans">"{rev.comment}"</p>
                  <p className="text-[10px] text-zinc-600">
                    Thời gian: {new Date(rev.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => {
                        moderateReview(rev.id, 'approved', user?.full_name);
                        toast.success('Đã duyệt đánh giá công khai!');
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Duyệt công khai
                    </button>
                  )}
                  {rev.status !== 'hidden' && (
                    <button
                      onClick={() => {
                        moderateReview(rev.id, 'hidden', user?.full_name);
                        toast.success('Đã ẩn đánh giá!');
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Ẩn bài
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MODULE CSKH 5: TRẢ LỜI LIVE CHAT (chat_conversations & chat_messages) === */}
      {activeTab === 'cskh_livechat' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 h-[600px]">
          
          {/* Cột trái: Danh sách hội thoại */}
          <div className="p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                HỘI THOẠI KHÁCH HÀNG ({conversations.length})
              </h3>
            </div>

            <div className="space-y-2">
              {conversations.map((conv) => {
                const isSelected = selectedChatId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedChatId(conv.id);
                      markAsRead(conv.id, 'staff');
                    }}
                    className={`w-full text-left p-3 border transition-all cursor-pointer font-mono text-xs ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500'
                        : 'bg-[#141414] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white truncate font-sans">
                        {conv.guest_name}
                      </strong>
                      {conv.unread_staff > 0 && (
                        <span className="px-1.5 py-0.2 bg-emerald-500 text-black text-[9px] font-bold rounded-full">
                          {conv.unread_staff} mới
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-sans">
                      {conv.last_message}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-zinc-600 mt-1">
                      <span>{conv.guest_contact}</span>
                      <span>#{conv.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Khung chat trực tiếp */}
          <div className="col-span-2 flex flex-col h-full bg-[#0a0a0a]">
            {(() => {
              const activeConv = conversations.find((c) => c.id === selectedChatId);
              const chatMsgs = messages.filter((m) => m.conversation_id === selectedChatId);
              return (
                <>
                  <div className="p-3.5 bg-[#121212] border-b border-zinc-800 flex items-center justify-between font-mono text-xs">
                    <div>
                      <p className="text-white font-bold">{activeConv?.guest_name}</p>
                      <p className="text-[10px] text-zinc-400">
                        Liên hệ: {activeConv?.guest_contact} • Trạng thái: {activeConv?.status}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                      SENDER: STAFF ({user?.full_name || 'Phạm CSKH'})
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMsgs.map((m) => {
                      const isStaff = m.sender_type === 'staff';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[9px] font-mono text-zinc-500 mb-0.5">
                            {isStaff ? 'BẠN (CS_STAFF)' : activeConv?.guest_name}
                          </span>
                          <div
                            className={`max-w-[75%] p-3 text-xs leading-relaxed font-sans ${
                              isStaff
                                ? 'bg-emerald-500 text-black'
                                : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                            }`}
                          >
                            {m.content}
                          </div>
                          <span className="text-[9px] font-mono text-zinc-600 mt-0.5">
                            {new Date(m.created_at).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendChatReply} className="p-3 bg-[#121212] border-t border-zinc-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập nội dung trả lời khách hàng..."
                      value={chatReplyInput}
                      onChange={(e) => setChatReplyInput(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-zinc-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-sans"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white text-black font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>GỬI</span>
                    </button>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* === MODULE KHO 1: TỒN KHO & BIẾN THỂ (v_inventory_available) === */}
      {activeTab === 'wh_inventory' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                QUẢN LÝ TỒN KHO & BIẾN THỂ (v_inventory_available)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-amber-400">PRODUCT_MANAGE</code>. Khách tuyệt đối không được mua quá số lượng <code>quantity_available</code> (= on_hand - reserved).
              </p>
            </div>
            <button
              onClick={() => setActiveTab('wh_documents')}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 font-mono text-xs uppercase cursor-pointer"
            >
              + Lập Phiếu Nhập / Xuất
            </button>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3">Mã SKU</th>
                <th className="p-3">Tên Sản Phẩm</th>
                <th className="p-3">Màu Sắc</th>
                <th className="p-3">Kích Cỡ</th>
                <th className="p-3">Tồn Thực (On Hand)</th>
                <th className="p-3">Tồn Khả Dụng</th>
                <th className="p-3">Trạng Thái Tồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.flatMap((p) =>
                p.variants?.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold text-white">{v.sku}</td>
                    <td className="p-3 font-sans text-zinc-200">{p.name}</td>
                    <td className="p-3">{v.color}</td>
                    <td className="p-3">{v.size}</td>
                    <td className="p-3 text-zinc-300 font-bold">{v.stock} chiếc</td>
                    <td className="p-3 font-bold text-emerald-400">{v.stock} chiếc</td>
                    <td className="p-3">
                      {v.stock > 15 ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Đủ hàng
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Sắp hết hàng
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* === MODULE KHO 2: PHIẾU XUẤT / NHẬP KHO (stock_documents) === */}
      {activeTab === 'wh_documents' && (
        <div className="space-y-6">
          <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  PHIẾU XUẤT / NHẬP KHO (stock_documents)
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  <strong className="text-rose-400">LƯU Ý CỰC KỲ QUAN TRỌNG:</strong> Phiếu xuất (<code>export</code>) chỉ được tạo khi đơn hàng đang ở trạng thái <strong className="text-white">"PACKING"</strong>!
                </p>
              </div>

              {/* Form tạo nhanh phiếu nhập */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const packingOrder = orders.find((o) => o.status === 'packing');
                    if (!packingOrder) {
                      toast.error('Hiện không có đơn nào ở trạng thái "packing"! Hãy chuyển trạng thái đơn sang packing trước khi lập phiếu xuất.');
                    } else {
                      setExportModal({ open: true, order: packingOrder, carrierId: 1, trackingCode: '' });
                    }
                  }}
                  className="px-3.5 py-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" /> + LẬP PHIẾU XUẤT (EXPORT)
                </button>
              </div>
            </div>

            {/* Bảng danh sách phiếu xuất nhập đã tạo */}
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Mã Phiếu</th>
                  <th className="p-3">Loại Phiếu</th>
                  <th className="p-3">Đơn Hàng / Đối Tác</th>
                  <th className="p-3">Đơn Vị Vận Chuyển / Mã Vận Đơn</th>
                  <th className="p-3">Người Lập</th>
                  <th className="p-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {stockDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold text-white">{doc.code}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                        doc.type === 'export'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300 font-sans">
                      {doc.order_code ? `Đơn: ${doc.order_code}` : doc.note}
                    </td>
                    <td className="p-3">
                      {doc.shipping_carrier_name ? (
                        <>
                          <p className="text-white font-bold">{doc.shipping_carrier_name}</p>
                          <p className="text-[10px] text-zinc-400">{doc.tracking_code}</p>
                        </>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400">{doc.created_by}</td>
                    <td className="p-3 text-zinc-500">
                      {new Date(doc.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Lập Phiếu Nhập Kho (import) */}
          <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4 max-w-xl">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              LẬP PHIẾU NHẬP HÀNG MỚI (import)
            </h3>
            <form onSubmit={handleCreateImportSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 text-[10px] uppercase mb-1">Nhà cung cấp:</label>
                <input
                  type="text"
                  required
                  value={importForm.supplierName}
                  onChange={(e) => setImportForm({ ...importForm, supplierName: e.target.value })}
                  className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[10px] uppercase mb-1">Chọn biến thể nhập:</label>
                <select
                  value={importForm.variantId}
                  onChange={(e) => setImportForm({ ...importForm, variantId: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-mono"
                >
                  {products.flatMap((p) =>
                    p.variants?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {p.name} — {v.sku} ({v.color} / Size {v.size})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Số lượng nhập:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={importForm.quantity}
                    onChange={(e) => setImportForm({ ...importForm, quantity: e.target.value })}
                    className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Giá vốn đơn vị (VNĐ):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={importForm.unitCost}
                    onChange={(e) => setImportForm({ ...importForm, unitCost: e.target.value })}
                    className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider cursor-pointer"
              >
                LƯU PHIẾU NHẬP & TĂNG TỒN KHO
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === MODULE KHO 3: KIỂM KÊ KHO (stocktakes & stocktake_items) === */}
      {activeTab === 'wh_stocktake' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-400" />
              KIỂM KÊ TỒN KHO & ĐỘ LỆCH (stocktakes & stocktake_items)
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              Quy tắc trigger CSDL: <code className="text-amber-400">difference = actual_quantity - system_quantity</code>. Hệ thống tính tự động và cho phép cân bằng kho.
            </p>
          </div>

          {/* Form tạo đợt kiểm kê mới */}
          <div className="bg-[#121212] border border-zinc-800 p-4 space-y-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              + TẠO ĐỢT KIỂM KÊ MỚI
            </h3>
            <form onSubmit={handleCreateStocktakeSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 text-[10px] uppercase mb-1">Ghi chú đợt kiểm kê:</label>
                <input
                  type="text"
                  required
                  value={stocktakeForm.note}
                  onChange={(e) => setStocktakeForm({ ...stocktakeForm, note: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-zinc-800 p-2.5 text-white"
                />
              </div>

              <div className="space-y-2">
                <p className="text-zinc-400 text-[10px] uppercase">Nhập số lượng thực tế đếm được:</p>
                {stocktakeForm.items.map((item, idx) => {
                  const diff = Number(item.actual_quantity) - Number(item.system_quantity);
                  return (
                    <div key={idx} className="p-3 bg-[#181818] border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong className="text-white font-sans">{item.product_name}</strong>
                        <p className="text-[10px] text-zinc-400">SKU: {item.sku}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Tồn hệ thống:</span>
                          <span className="text-white font-bold">{item.system_quantity}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block">Thực tế đếm:</span>
                          <input
                            type="number"
                            min="0"
                            value={item.actual_quantity}
                            onChange={(e) => {
                              const newItems = [...stocktakeForm.items];
                              newItems[idx].actual_quantity = Number(e.target.value);
                              setStocktakeForm({ ...stocktakeForm, items: newItems });
                            }}
                            className="w-20 bg-[#222] border border-zinc-700 p-1 text-center font-bold text-white"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block">Chênh lệch (difference):</span>
                          <span className={`font-bold ${diff < 0 ? 'text-rose-400' : diff > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider cursor-pointer"
              >
                LƯU PHIẾU KIỂM KÊ KHO
              </button>
            </form>
          </div>

          {/* Lịch sử các phiếu kiểm kê */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              LỊCH SỬ CÁC PHIẾU KIỂM KÊ ĐÃ LẬP
            </h3>
            {stocktakes.map((st) => (
              <div key={st.id} className="p-4 bg-[#141414] border border-zinc-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">{st.code}</span>
                    <span className="text-zinc-400 ml-2">({st.note})</span>
                  </div>
                  <button
                    onClick={() => handleApplyBalance(st.id)}
                    className="px-3 py-1.5 bg-amber-400 text-black font-bold text-[10px] uppercase cursor-pointer hover:bg-amber-300"
                  >
                    CÂN BẰNG TỒN KHO THEO SỐ THỰC TẾ
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {st.items.map((it) => (
                    <div key={it.id} className="p-2 bg-[#1c1c1c] border border-zinc-800 flex justify-between">
                      <span>{it.product_name || it.sku}</span>
                      <span>
                        Hệ thống: {it.system_quantity} | Thực tế: {it.actual_quantity} |{' '}
                        <strong className={it.difference < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          Lệch: {it.difference}
                        </strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MODULE KHO 4: TIẾN ĐỘ ĐƠN HÀNG (processing -> packing -> shipping -> completed) === */}
      {activeTab === 'wh_orders' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              TIẾN ĐỘ ĐƠN HÀNG VẬN HÀNH KHO (ORDER WORKFLOW PIPELINE)
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              Quyền thực thi: <code className="text-amber-400">ORDER_STATUS_UPDATE</code>. Chu trình: <code>processing</code> &rarr; <code>packing</code> &rarr; <code>shipping</code> &rarr; <code>completed</code>.
            </p>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3">Mã Đơn</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Sản Phẩm</th>
                <th className="p-3">Trạng Thái Hiện Tại</th>
                <th className="p-3 text-right">Thao Tác Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders
                .filter((o) => o.status !== 'cancelled')
                .map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold text-white">{order.code}</td>
                    <td className="p-3 font-sans">
                      <strong className="text-white">{order.receiver_name}</strong>
                      <p className="text-[11px] text-zinc-500 font-mono">{order.receiver_phone}</p>
                    </td>
                    <td className="p-3">
                      {order.items.map((it) => (
                        <div key={it.id} className="text-[11px] text-zinc-400">
                          {it.product_name} x{it.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        order.status === 'packing'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : order.status === 'shipping'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : order.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(order.id, 'packing')}
                          className="px-2.5 py-1 bg-amber-400 text-black font-bold uppercase text-[10px] cursor-pointer"
                        >
                          Chuyển Đóng Gói (packing)
                        </button>
                      )}

                      {order.status === 'packing' && (
                        <button
                          onClick={() => setExportModal({ open: true, order, carrierId: 1, trackingCode: '' })}
                          className="px-2.5 py-1 bg-white text-black font-bold uppercase text-[10px] cursor-pointer"
                        >
                          Lập Phiếu Xuất & Giao Hàng
                        </button>
                      )}

                      {order.status === 'shipping' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(order.id, 'completed')}
                          className="px-2.5 py-1 bg-emerald-500 text-black font-bold uppercase text-[10px] cursor-pointer"
                        >
                          Giao Thành Công (completed)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === MODULE ADMIN 1: QUẢN LÝ TÀI KHOẢN & GÁN VAI TRÒ (users & user_roles) === */}
      {activeTab === 'admin_users' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN VAI TRÒ (users & user_roles)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-rose-400">ACCOUNT_ROLE_MANAGE</code>. Khóa/mở khóa tài khoản bằng <code>is_active</code>, gán vai trò trực tiếp.
              </p>
            </div>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3">Họ Tên & Email</th>
                <th className="p-3">Số Điện Thoại</th>
                <th className="p-3">Vai Trò Hệ Thống</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40">
                  <td className="p-3 font-sans">
                    <strong className="text-white">{u.full_name}</strong>
                    <p className="text-[11px] text-zinc-500 font-mono">{u.email}</p>
                  </td>
                  <td className="p-3 text-zinc-300">{u.phone}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => {
                        changeUserRole(u.id, e.target.value);
                        toast.success(`Đã đổi vai trò của ${u.full_name} thành: ${e.target.value}`);
                      }}
                      className="bg-[#1a1a1a] border border-zinc-700 px-2.5 py-1 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                      <option value="CS_STAFF">CS_STAFF (Nhân viên CSKH)</option>
                      <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER (Quản lý kho)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Admin tối cao)</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                        Đang khóa
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        toggleUserActive(u.id);
                        toast.success(`Đã ${u.is_active ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${u.email}!`);
                      }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase border cursor-pointer ${
                        u.is_active
                          ? 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      {u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === MODULE ADMIN 2: CẤU HÌNH HỆ THỐNG (system_settings) === */}
      {activeTab === 'admin_settings' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4 max-w-2xl">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              CẤU HÌNH TOÀN HỆ THỐNG (system_settings)
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              Quyền thực thi: <code className="text-rose-400">SYSTEM_CONFIG</code>. Thiết lập các thông số tài chính, phí ship và chính sách đổi trả.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase mb-1">
                Phí vận chuyển mặc định (VNĐ):
              </label>
              <input
                type="number"
                value={settingsForm.default_shipping_fee}
                onChange={(e) => setSettingsForm({ ...settingsForm, default_shipping_fee: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-zinc-800 p-2.5 font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] uppercase mb-1">
                Miễn phí vận chuyển từ đơn hàng (VNĐ):
              </label>
              <input
                type="number"
                value={settingsForm.free_shipping_from}
                onChange={(e) => setSettingsForm({ ...settingsForm, free_shipping_from: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-zinc-800 p-2.5 font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] uppercase mb-1">
                Thời hạn cho phép gửi yêu cầu đổi/trả (Số ngày):
              </label>
              <input
                type="number"
                value={settingsForm.return_window_days}
                onChange={(e) => setSettingsForm({ ...settingsForm, return_window_days: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-zinc-800 p-2.5 font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] uppercase mb-1">
                Tỷ lệ quy đổi điểm Loyalty (1 điểm = ? VNĐ):
              </label>
              <input
                type="number"
                value={settingsForm.point_value_vnd}
                onChange={(e) => setSettingsForm({ ...settingsForm, point_value_vnd: Number(e.target.value) })}
                className="w-full bg-[#161616] border border-zinc-800 p-2.5 font-bold text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider cursor-pointer"
            >
              LƯU CẤU HÌNH HỆ THỐNG
            </button>
          </form>
        </div>
      )}

      {/* === MODULE ADMIN 3: MARKETING, VOUCHERS & LOYALTY REWARDS === */}
      {activeTab === 'admin_marketing' && (
        <div className="space-y-6">
          <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-rose-400" />
                QUẢN LÝ MÃ GIẢM GIÁ VOUCHERS & KHUYẾN MÃI
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Quyền thực thi: <code className="text-rose-400">MARKETING_MANAGE</code>. Khách áp dụng tại trang Checkout theo trigger kiểm tra min_order_value.
              </p>
            </div>

            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Mã Voucher</th>
                  <th className="p-3">Tên Chương Trình</th>
                  <th className="p-3">Loại Giảm</th>
                  <th className="p-3">Giá Trị Giảm</th>
                  <th className="p-3">Đơn Tối Thiểu</th>
                  <th className="p-3">Đã Dùng</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Bật / Tắt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-bold text-white">{v.code}</td>
                    <td className="p-3 font-sans text-zinc-300">{v.name}</td>
                    <td className="p-3 uppercase text-zinc-400">{v.discount_type}</td>
                    <td className="p-3 font-bold text-emerald-400">
                      {v.discount_type === 'percent' ? `${v.discount_value}%` : `${v.discount_value.toLocaleString('vi-VN')}₫`}
                    </td>
                    <td className="p-3">{v.min_order_value.toLocaleString('vi-VN')}₫</td>
                    <td className="p-3">{v.used_count} lượt</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                        v.is_active ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}>
                        {v.is_active ? 'Kích hoạt' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleVoucherStatus(v.id, user?.full_name)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] uppercase font-bold cursor-pointer"
                      >
                        {v.is_active ? 'Tắt' : 'Bật'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form tạo Voucher mới */}
          <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4 max-w-xl">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              + TẠO MÃ VOUCHER MỚI
            </h3>
            <form onSubmit={handleCreateVoucherSubmit} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Mã Code (viết hoa):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TECHWEAR20"
                    value={voucherForm.code}
                    onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Loại giảm:</label>
                  <select
                    value={voucherForm.discount_type}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discount_type: e.target.value })}
                    className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-[10px] uppercase mb-1">Tên chương trình:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ưu đãi bộ sưu tập Thu Đông"
                  value={voucherForm.name}
                  onChange={(e) => setVoucherForm({ ...voucherForm, name: e.target.value })}
                  className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Giá trị giảm:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={voucherForm.discount_value}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discount_value: Number(e.target.value) })}
                    className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] uppercase mb-1">Đơn tối thiểu (VNĐ):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={voucherForm.min_order_value}
                    onChange={(e) => setVoucherForm({ ...voucherForm, min_order_value: Number(e.target.value) })}
                    className="w-full bg-[#161616] border border-zinc-800 p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-wider cursor-pointer"
              >
                TẠO VOUCHER MỚI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* === MODULE ADMIN 4: NHẬT KÝ HOẠT ĐỘNG (activity_logs / audit_logs) === */}
      {activeTab === 'admin_logs' && (
        <div className="bg-[#0d0d0d] border border-zinc-800 p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (activity_logs / audit_logs)
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              Bảng lưu trữ kiểm toán bất biến (Append-only). Ghi nhận toàn bộ thao tác phân quyền, thay đổi đơn hàng, xuất nhập kho và cấu hình.
            </p>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141414] text-zinc-400 uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3">Thời Gian</th>
                <th className="p-3">Người Thao Tác</th>
                <th className="p-3">Hành Động</th>
                <th className="p-3">Đối Tượng</th>
                <th className="p-3">Chi Tiết Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/40">
                  <td className="p-3 text-zinc-500">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                  <td className="p-3 font-bold text-white font-sans">{log.user_name}</td>
                  <td className="p-3 font-bold text-amber-400">{log.action}</td>
                  <td className="p-3 text-zinc-300">{log.target}</td>
                  <td className="p-3 text-zinc-400 font-sans">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === MODULE ADMIN 5: BÁO CÁO TOÀN SÀN (report.view_all) === */}
      {activeTab === 'admin_reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-[#0d0d0d] border border-zinc-800 p-6 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Doanh Thu Toàn Hệ Thống</span>
              <h3 className="text-3xl font-black text-emerald-400 font-inter tracking-tight">
                {totalRevenue.toLocaleString('vi-VN')}₫
              </h3>
              <p className="text-xs text-zinc-500">Khớp dữ liệu bảng orders</p>
            </div>

            <div className="bg-[#0d0d0d] border border-zinc-800 p-6 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Sản Phẩm Đã Bán</span>
              <h3 className="text-3xl font-black text-white font-inter tracking-tight">
                {totalUnitsSold} chiếc
              </h3>
              <p className="text-xs text-zinc-500">Tổng từ các đơn hoàn tất/đang giao</p>
            </div>

            <div className="bg-[#0d0d0d] border border-zinc-800 p-6 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Tồn Kho Hiện Có</span>
              <h3 className="text-3xl font-black text-amber-400 font-inter tracking-tight">
                {totalStockUnits} chiếc
              </h3>
              <p className="text-xs text-zinc-500">View v_inventory_available</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CÁC MODAL HỖ TRỢ NGHIỆP VỤ (CSKH / KHO / PHÂN QUYỀN) */}
      {/* ========================================================================= */}

      {/* MODAL 1: TỪ CHỐI ĐỔI TRẢ (bắt buộc reject_reason) */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-zinc-700 max-w-md w-full p-6 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-white text-sm uppercase">Từ Chối Yêu Cầu Đổi / Trả</h3>
            <p className="text-zinc-400 text-[11px] font-sans">
              Theo ràng buộc CSDL (bảng <code>return_requests</code>), lý do từ chối (<code>reject_reason</code>) là trường bắt buộc (NOT NULL) khi status = 'rejected'.
            </p>

            <form onSubmit={handleRejectReturnSubmit} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase block mb-1">Lý do từ chối:</label>
                <textarea
                  rows="3"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 p-2.5 text-white font-sans focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, order: null })}
                  className="flex-1 py-2 border border-zinc-700 text-zinc-400 font-bold uppercase cursor-pointer"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase cursor-pointer"
                >
                  XÁC NHẬN TỪ CHỐI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO PHIẾU XUẤT KHO (EXPORT) - KIỂM TRA CHẶT CHẼ TRẠNG THÁI PACKING */}
      {exportModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-zinc-700 max-w-lg w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                LẬP PHIẾU XUẤT KHO (stock_documents: export)
              </h3>
              <button
                onClick={() => setExportModal({ open: false, order: null, carrierId: 1, trackingCode: '' })}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 space-y-1">
              <p className="text-zinc-400">Đơn hàng xuất: <strong className="text-white">{exportModal.order?.code}</strong></p>
              <p className="text-zinc-400">Trạng thái hiện tại: <strong className="text-amber-400">{exportModal.order?.status.toUpperCase()}</strong></p>
              <p className="text-zinc-400 font-sans">Người nhận: {exportModal.order?.receiver_name} ({exportModal.order?.receiver_phone})</p>
              <p className="text-[11px] text-zinc-500 font-sans">Địa chỉ: {exportModal.order?.shipping_address}</p>
            </div>

            <form onSubmit={handleCreateExportSubmit} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase block mb-1">
                  Đơn vị vận chuyển (shipping_carrier_id):
                </label>
                <select
                  value={exportModal.carrierId}
                  onChange={(e) => setExportModal({ ...exportModal, carrierId: Number(e.target.value) })}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 p-2.5 text-white"
                >
                  <option value={1}>1 — Giao Hàng Nhanh (GHN)</option>
                  <option value={2}>2 — Giao Hàng Tiết Kiệm (GHTK)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase block mb-1">
                  Mã vận đơn (tracking_code):
                </label>
                <input
                  type="text"
                  placeholder="Để trống hệ thống sẽ tự sinh mã tự động..."
                  value={exportModal.trackingCode}
                  onChange={(e) => setExportModal({ ...exportModal, trackingCode: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 p-2.5 text-white"
                />
              </div>

              <div className="p-2.5 bg-amber-950/40 border border-amber-900 text-amber-300 text-[11px] font-sans">
                ✓ Thao tác này sẽ tự động trừ tồn kho các biến thể trong đơn, ghi nhận vào sổ cái <code>stock_movements</code> và chuyển đơn sang trạng thái <strong>shipping</strong>.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider cursor-pointer"
              >
                XÁC NHẬN XUẤT KHO & BÀN GIAO VẬN CHUYỂN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT DANH SÁCH QUYỀN TỪ VIEW v_user_permissions */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-zinc-700 max-w-lg w-full p-6 space-y-4 font-mono text-xs max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-sm uppercase">
                DANH SÁCH QUYỀN (v_user_permissions)
              </h3>
              <button onClick={() => setShowPermissionsModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <p className="text-zinc-400 text-[11px]">
              Tài khoản <strong className="text-white">{user?.full_name}</strong> với vai trò <strong className="text-emerald-400">{currentRole}</strong> đang sở hữu <strong>{userPermissions.length} quyền hợp lệ</strong>:
            </p>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-[#181818] border border-zinc-800">
              {userPermissions.map((perm, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#121212] border border-zinc-900">
                  <span className="text-emerald-400 font-bold">{perm}</span>
                  <span className="text-[10px] text-zinc-500">ALLOWED</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPermissionsModal(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase cursor-pointer"
            >
              ĐÓNG CỬA SỔ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
