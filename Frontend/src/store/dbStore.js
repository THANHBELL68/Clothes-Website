import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS, COUPONS, MOCK_VOUCHERS } from '../data/mockData';

export const useDbStore = create(
  persist(
    (set, get) => ({
      // Bảng products & product_variants (Liên kết CSDL động)
      products: PRODUCTS,

      // Bảng stock_documents (Phiếu xuất / nhập kho - Chuẩn PostgreSQL 01_schema.sql)
      stockDocuments: [
        {
          id: 1,
          code: 'PXK-20261012-01',
          type: 'export', // 'import' | 'export' | 'return_import' | 'exchange_export'
          order_id: 1,
          order_code: 'ORD-20261014-001',
          shipping_carrier_id: 1, // GHN
          shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
          tracking_code: 'GHN88291039VN',
          note: 'Xuất kho cho đơn hàng đóng gói ORD-20261014-001',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-12T14:15:00Z',
          items: [
            { id: 1, variant_id: 101, sku: 'AKN-479073-00-S', quantity: 1, unit_cost: 320000 },
          ],
        },
        {
          id: 2,
          code: 'PNK-20261010-01',
          type: 'import',
          order_id: null,
          order_code: null,
          shipping_carrier_id: null,
          shipping_carrier_name: null,
          tracking_code: null,
          note: 'Nhập hàng lô mới từ Xưởng Vải Rayon & Giả Lông Cừu Hà Nội',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-10T08:30:00Z',
          items: [
            { id: 2, variant_id: 101, sku: 'AKN-479073-00-S', quantity: 50, unit_cost: 320000 },
            { id: 3, variant_id: 202, sku: 'AKM-486116-69-M', quantity: 40, unit_cost: 490000 },
          ],
        },
      ],

      // Bảng stocktakes & stocktake_items (Kiểm kê kho & tự tính độ lệch difference = actual - system)
      stocktakes: [
        {
          id: 1,
          code: 'KK-20261015-01',
          note: 'Kiểm kê định kỳ tháng 10/2026 mẫu Áo Rayon Nữ & Áo Khoác Lông Cừu',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-15T09:00:00Z',
          items: [
            {
              id: 1,
              variant_id: 101,
              sku: 'AKN-479073-00-S',
              product_name: 'Nữ Áo Kiểu Vải Rayon (Trắng / S)',
              system_quantity: 22,
              actual_quantity: 22,
              difference: 0,
            },
            {
              id: 2,
              variant_id: 202,
              sku: 'AKM-486116-69-M',
              product_name: 'Nam Áo Khoác Lông Cừu (Navy / M)',
              system_quantity: 32,
              actual_quantity: 30,
              difference: -2, // Thiếu 2 chiếc so với hệ thống
            },
          ],
        },
      ],

      // Bảng refunds (Theo dõi & Cập nhật hoàn tiền - CSKH)
      refunds: [
        {
          id: 1,
          return_request_id: 101,
          order_code: 'ORD-20261014-001',
          customer_name: 'Nguyễn Văn Khách',
          customer_phone: '0987654321',
          amount: 599000,
          status: 'pending', // 'pending' | 'processing' | 'completed' | 'failed'
          bank_name: 'Vietcombank (VCB)',
          bank_account_number: '0123456789',
          bank_account_name: 'NGUYEN VAN KHACH',
          created_at: '2026-10-15T16:00:00Z',
          completed_at: null,
          note: 'Hoàn tiền do giao nhầm size và khách yêu cầu trả hàng',
        },
      ],

      // Bảng stock_movements (Sổ cái kho: ghi nhận mọi biến động tồn kho)
      stockMovements: [
        {
          id: 1,
          variant_id: 101,
          sku: 'AKN-479073-00-S',
          quantity: 50,
          reason: 'IMPORT',
          ref_type: 'stock_document',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-10T08:30:00Z',
        },
        {
          id: 2,
          variant_id: 101,
          sku: 'AKN-479073-00-S',
          quantity: -1,
          reason: 'EXPORT',
          ref_type: 'stock_document',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-12T14:15:00Z',
        },
        {
          id: 3,
          variant_id: 202,
          sku: 'AKM-486116-69-M',
          quantity: 40,
          reason: 'IMPORT',
          ref_type: 'stock_document',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-10T08:30:00Z',
        },
      ],

      // Bảng reviews (Đánh giá sản phẩm - CSKH duyệt status)
      reviews: [
        {
          id: 1,
          product_id: 1,
          user_name: 'Nguyễn Văn Khách',
          rating: 5,
          comment: 'Chất vải rayon rất mát và mềm, phom áo chuẩn công sở!',
          status: 'approved', // 'pending' | 'approved' | 'hidden'
          created_at: '2026-10-13T10:00:00Z',
        },
        {
          id: 2,
          product_id: 1,
          user_name: 'Hoàng Thị Yến',
          rating: 5,
          comment: 'Màu 10 BEIGE mặc rất sáng da, đi làm ai cũng khen.',
          status: 'pending',
          created_at: '2026-10-14T09:20:00Z',
        },
        {
          id: 3,
          product_id: 2,
          user_name: 'Trần Văn Nam',
          rating: 5,
          comment: 'Áo khoác lông cừu ấm cực kỳ, đi xe máy cản gió rất tốt.',
          status: 'approved',
          created_at: '2026-10-15T15:10:00Z',
        },
      ],

      // Bảng vouchers (Quản lý mã giảm giá & Marketing - Super Admin)
      vouchers: [
        {
          id: 1,
          code: 'WELCOME10',
          name: 'Giảm 10% khách hàng mới',
          discount_type: 'percent',
          discount_value: 10,
          max_discount_amount: 100000,
          min_order_value: 300000,
          is_active: true,
          used_count: 12,
          start_at: '2026-10-01T00:00:00Z',
          end_at: '2026-12-31T23:59:59Z',
        },
        {
          id: 2,
          code: 'FREESHIP',
          name: 'Miễn phí vận chuyển toàn quốc',
          discount_type: 'fixed_amount',
          discount_value: 30000,
          max_discount_amount: 30000,
          min_order_value: 500000,
          is_active: true,
          used_count: 45,
          start_at: '2026-10-01T00:00:00Z',
          end_at: '2026-12-31T23:59:59Z',
        },
        {
          id: 3,
          code: 'AETHER50K',
          name: 'Giảm 50k cho đơn từ 1 triệu',
          discount_type: 'fixed_amount',
          discount_value: 50000,
          max_discount_amount: 50000,
          min_order_value: 1000000,
          is_active: true,
          used_count: 8,
          start_at: '2026-10-01T00:00:00Z',
          end_at: '2026-11-30T23:59:59Z',
        },
      ],

      // Quà đổi điểm Loyalty Rewards
      loyaltyRewards: [
        { id: 1, name: 'Voucher Giảm 50.000₫', points_required: 50, reward_type: 'voucher', discount_value: 50000, is_active: true },
        { id: 2, name: 'Voucher Giảm 100.000₫', points_required: 100, reward_type: 'voucher', discount_value: 100000, is_active: true },
        { id: 3, name: 'Túi Tote Techwear AETHER', points_required: 200, reward_type: 'gift', discount_value: 0, is_active: true },
      ],

      // Bảng audit_logs / activity_logs (Nhật ký hoạt động hệ thống - Super Admin)
      auditLogs: [
        {
          id: 1,
          user_name: 'Trần Quản Trị (SUPER_ADMIN)',
          action: 'INIT_SYSTEM',
          target: 'Database shop_db',
          detail: 'Khởi tạo cấu trúc 37 bảng PostgreSQL và phân quyền RBAC',
          created_at: '2026-10-06T19:50:00Z',
        },
        {
          id: 2,
          user_name: 'Lê Thủ Kho (WAREHOUSE_MANAGER)',
          action: 'CREATE_RECEIPT',
          target: 'PNK-20261010-01',
          detail: 'Nhập kho 90 sản phẩm Áo kiểu nữ Rayon & Áo khoác nam lông cừu',
          created_at: '2026-10-10T08:30:00Z',
        },
        {
          id: 3,
          user_name: 'Phạm Chăm Sóc (CS_STAFF)',
          action: 'REVIEW_APPROVE',
          target: 'Review #1',
          detail: 'Duyệt công khai đánh giá của khách hàng Nguyễn Văn Khách',
          created_at: '2026-10-13T10:15:00Z',
        },
      ],

      // Bảng system_settings (Cấu hình hệ thống - Super Admin)
      systemSettings: {
        cod_enabled: true,
        bank_qr_info: 'VCB - 9988776655 - AETHER LABS CORP',
        default_shipping_fee: 30000,
        free_shipping_from: 500000,
        return_window_days: 7,
        guest_ttl_days: 30,
        earn_vnd_per_point: 10000,
        point_value_vnd: 1000,
      },

      // --- CÁC HÀM CẬP NHẬT CSDL ĐỘNG (TRIGGER & ACTIONS) ---

      // Ghi nhật ký audit_logs
      logAudit: (userName, action, target, detail) => {
        set((state) => ({
          auditLogs: [
            {
              id: Date.now(),
              user_name: userName || 'Hệ thống',
              action,
              target,
              detail,
              created_at: new Date().toISOString(),
            },
            ...state.auditLogs,
          ],
        }));
      },

      // Quản lý kho: Tạo Phiếu Kho (stock_documents)
      // * LƯU Ý QUY TẮC CSDL & CHECK CONSTRAINT:
      // - Chỉ cho tạo phiếu xuất 'export' khi đơn hàng đang ở trạng thái 'packing'
      // - type = 'export' bắt buộc có order_id và shipping_carrier_id
      createStockDocument: ({ type, order, carrierId, carrierName, trackingCode, supplierName, items, note, userName }) => {
        // 1. Kiểm tra quy tắc nghiệp vụ đơn hàng đối với phiếu xuất export
        if (type === 'export') {
          if (!order) {
            return { success: false, message: 'Lỗi: Phiếu xuất kho bắt buộc phải gắn với đơn hàng cụ thể (order_id NOT NULL)!' };
          }
          if (order.status !== 'packing') {
            return {
              success: false,
              message: `Quy tắc CSDL nghiêm ngặt: Đơn hàng ${order.code} đang ở trạng thái "${order.status.toUpperCase()}". Đơn hàng PHẢI ở trạng thái "PACKING" mới được phép tạo phiếu xuất kho!`,
            };
          }
          if (!carrierId) {
            return { success: false, message: 'Lỗi CHECK constraint: Phiếu xuất bắt buộc phải chọn đơn vị vận chuyển (shipping_carrier_id NOT NULL)!' };
          }
        }

        const code = (type === 'export' ? 'PXK-' : 'PNK-') + Date.now().toString().slice(-6);

        const newDoc = {
          id: Date.now(),
          code,
          type, // 'import' | 'export' | 'return_import' | 'exchange_export'
          order_id: order ? order.id : null,
          order_code: order ? order.code : null,
          shipping_carrier_id: carrierId || null,
          shipping_carrier_name: carrierName || (carrierId === 1 ? 'Giao Hàng Nhanh (GHN)' : 'Giao Hàng Tiết Kiệm (GHTK)'),
          tracking_code: trackingCode || (type === 'export' ? 'VN' + Date.now().toString().slice(-8) : null),
          note: note || (type === 'export' ? `Xuất kho đơn ${order.code}` : `Nhập hàng từ ${supplierName || 'Nhà cung cấp'}`),
          created_by: userName || 'Lê Thủ Kho',
          created_at: new Date().toISOString(),
          items: items || (order ? order.items : []),
        };

        // 2. Cập nhật tồn kho theo trigger
        set((state) => {
          const deltaMultiplier = type === 'export' ? -1 : 1;

          const updatedProducts = state.products.map((p) => {
            const updatedVariants = p.variants?.map((v) => {
              const matched = (items || (order ? order.items : [])).find(
                (it) => it.variant_id === v.id || it.id === v.id
              );
              if (matched) {
                const qtyChange = Number(matched.quantity) * deltaMultiplier;
                return { ...v, stock: Math.max(0, v.stock + qtyChange) };
              }
              return v;
            });
            return { ...p, variants: updatedVariants };
          });

          // Ghi nhận biến động sổ cái
          const newMovements = (items || (order ? order.items : [])).map((it) => ({
            id: Date.now() + Math.random(),
            variant_id: it.variant_id || it.id,
            sku: it.sku || (it.color + '-' + it.size),
            quantity: Number(it.quantity) * deltaMultiplier,
            reason: type === 'export' ? 'EXPORT' : (type === 'return_import' ? 'RETURN_IN' : 'IMPORT'),
            ref_type: 'stock_document',
            created_by: userName || 'Lê Thủ Kho',
            created_at: new Date().toISOString(),
          }));

          return {
            stockDocuments: [newDoc, ...state.stockDocuments],
            products: updatedProducts,
            stockMovements: [...newMovements, ...state.stockMovements],
          };
        });

        get().logAudit(
          userName || 'Lê Thủ Kho',
          type === 'export' ? 'STOCK_EXPORT' : 'STOCK_IMPORT',
          code,
          `${type === 'export' ? 'Xuất kho cho đơn ' + order?.code : 'Nhập kho thành công'}`
        );

        return { success: true, document: newDoc };
      },

      // Quản lý kho: Tạo đợt kiểm kê kho (stocktakes & stocktake_items)
      // * Trigger tính tự động: difference = actual_quantity - system_quantity
      createStocktake: ({ note, items, userName }) => {
        const code = 'KK-' + Date.now().toString().slice(-6);

        // Tính difference tự động theo quy tắc CSDL
        const computedItems = items.map((it, idx) => ({
          id: Date.now() + idx,
          variant_id: it.variant_id,
          sku: it.sku,
          product_name: it.product_name,
          system_quantity: Number(it.system_quantity),
          actual_quantity: Number(it.actual_quantity),
          difference: Number(it.actual_quantity) - Number(it.system_quantity),
        }));

        const newStocktake = {
          id: Date.now(),
          code,
          note: note || 'Kiểm kê kho định kỳ',
          created_by: userName || 'Lê Thủ Kho',
          created_at: new Date().toISOString(),
          items: computedItems,
        };

        set((state) => ({
          stocktakes: [newStocktake, ...state.stocktakes],
        }));

        get().logAudit(userName || 'Lê Thủ Kho', 'STOCKTAKE_CREATE', code, `Lập phiếu kiểm kê ${computedItems.length} mặt hàng`);
        return newStocktake;
      },

      // Quản lý kho: Cân bằng tồn kho từ phiếu kiểm kê (áp dụng độ lệch difference)
      applyStocktakeBalance: (stocktakeId, userName) => {
        const stocktake = get().stocktakes.find((s) => s.id === stocktakeId);
        if (!stocktake) return { success: false, message: 'Phiếu kiểm kê không tồn tại!' };

        set((state) => {
          const updatedProducts = state.products.map((p) => {
            const updatedVariants = p.variants?.map((v) => {
              const matched = stocktake.items.find((it) => it.variant_id === v.id);
              if (matched) {
                // Đưa tồn kho về chính xác bằng actual_quantity
                return { ...v, stock: matched.actual_quantity };
              }
              return v;
            });
            return { ...p, variants: updatedVariants };
          });

          // Ghi nhận biến động điều chỉnh
          const adjustMovements = stocktake.items
            .filter((it) => it.difference !== 0)
            .map((it) => ({
              id: Date.now() + Math.random(),
              variant_id: it.variant_id,
              sku: it.sku,
              quantity: it.difference,
              reason: 'STOCKTAKE_ADJUST',
              ref_type: 'stocktake',
              created_by: userName || 'Lê Thủ Kho',
              created_at: new Date().toISOString(),
            }));

          return {
            products: updatedProducts,
            stockMovements: [...adjustMovements, ...state.stockMovements],
          };
        });

        get().logAudit(userName || 'Lê Thủ Kho', 'STOCKTAKE_APPLY', stocktake.code, 'Cân bằng tồn kho theo số lượng thực tế kiểm kê');
        return { success: true, message: 'Đã cân bằng số lượng tồn kho theo số liệu thực tế thành công!' };
      },

      // CSKH: Cập nhật tiến độ hoàn tiền (refunds: pending -> processing -> completed)
      updateRefundStatus: (refundId, newStatus, userName) => {
        set((state) => ({
          refunds: state.refunds.map((r) =>
            r.id === refundId
              ? {
                  ...r,
                  status: newStatus,
                  completed_at: newStatus === 'completed' ? new Date().toISOString() : r.completed_at,
                }
              : r
          ),
        }));

        get().logAudit(userName || 'Phạm CSKH', 'REFUND_UPDATE', `Refund #${refundId}`, `Chuyển trạng thái hoàn tiền sang: ${newStatus.toUpperCase()}`);
      },

      // CSKH: Duyệt / Ẩn bài đánh giá review (bảng reviews.status)
      moderateReview: (reviewId, newStatus, userName) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, status: newStatus } : r
          ),
        }));
        get().logAudit(userName || 'Phạm CSKH', 'REVIEW_MODERATE', `Review #${reviewId}`, `Đổi trạng thái sang: ${newStatus}`);
      },

      // Super Admin: Tạo mã Voucher mới
      createVoucher: (voucherData, userName) => {
        const newVoucher = {
          id: Date.now(),
          ...voucherData,
          used_count: 0,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          vouchers: [newVoucher, ...state.vouchers],
        }));

        get().logAudit(userName || 'Super Admin', 'VOUCHER_CREATE', newVoucher.code, `Tạo mã giảm giá ${newVoucher.code}`);
        return newVoucher;
      },

      // Super Admin: Bật / Tắt Voucher
      toggleVoucherStatus: (voucherId, userName) => {
        set((state) => ({
          vouchers: state.vouchers.map((v) =>
            v.id === voucherId ? { ...v, is_active: !v.is_active } : v
          ),
        }));
        get().logAudit(userName || 'Super Admin', 'VOUCHER_TOGGLE', `Voucher #${voucherId}`, 'Thay đổi trạng thái kích hoạt');
      },

      // Super Admin: Cập nhật cài đặt hệ thống (system_settings)
      updateSettings: (newSettings, userName) => {
        set((state) => ({
          systemSettings: { ...state.systemSettings, ...newSettings },
        }));
        get().logAudit(userName || 'Super Admin', 'UPDATE_SETTINGS', 'system_settings', 'Thay đổi cấu hình hệ thống');
      },

      // Tra cứu số lượng tồn khả dụng (v_inventory_available)
      getAvailableStock: (variantId) => {
        const state = get();
        for (const p of state.products) {
          const v = p.variants?.find((item) => item.id === variantId);
          if (v) return v.stock || 0;
        }
        return 0;
      },
    }),
    {
      name: 'aether-db-storage-v3',
    }
  )
);
