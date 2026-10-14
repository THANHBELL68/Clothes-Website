import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS, COUPONS } from '../data/mockData';

export const useDbStore = create(
  persist(
    (set, get) => ({
      // Bảng products & product_variants
      products: PRODUCTS,

      // Bảng goods_receipts (Phiếu nhập kho)
      goodsReceipts: [
        {
          id: 1,
          code: 'PNK-20261010-01',
          supplier_name: 'Công ty Cổ phần Dệt May Hà Nội',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-10T08:30:00Z',
          items: [
            { variant_id: 101, sku: 'AKN-TRANG-S', quantity: 50, unit_cost: 250000 },
            { variant_id: 102, sku: 'AKN-TRANG-M', quantity: 50, unit_cost: 250000 },
          ],
        },
      ],

      // Bảng goods_issues (Phiếu xuất kho)
      goodsIssues: [
        {
          id: 1,
          code: 'PXK-20261012-01',
          order_code: 'ORD-20261014-001',
          carrier: 'Giao Hàng Nhanh (GHN)',
          tracking_code: 'GHN88291039VN',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-12T14:15:00Z',
          items: [
            { variant_id: 101, sku: 'AKN-TRANG-S', quantity: 1 },
          ],
        },
      ],

      // Bảng stock_movements (Sổ cái kho: ghi nhận mọi biến động tồn kho)
      stockMovements: [
        {
          id: 1,
          variant_id: 101,
          sku: 'AKN-TRANG-S',
          quantity: 50,
          reason: 'IMPORT',
          ref_type: 'goods_receipt',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-10T08:30:00Z',
        },
        {
          id: 2,
          variant_id: 101,
          sku: 'AKN-TRANG-S',
          quantity: -1,
          reason: 'EXPORT',
          ref_type: 'goods_issue',
          created_by: 'Lê Thủ Kho',
          created_at: '2026-10-12T14:15:00Z',
        },
      ],

      // Bảng reviews (Đánh giá sản phẩm - mặc định pending chờ CSKH duyệt)
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
      ],

      // Bảng audit_logs (Nhật ký hoạt động hệ thống - chỉ Admin xem)
      auditLogs: [
        {
          id: 1,
          user_name: 'Trần Quản Trị',
          action: 'INIT_SYSTEM',
          target: 'Database shop_db',
          detail: 'Khởi tạo cấu trúc 37 bảng PostgreSQL và phân quyền RBAC',
          created_at: '2026-10-06T19:50:00Z',
        },
        {
          id: 2,
          user_name: 'Lê Thủ Kho',
          action: 'CREATE_RECEIPT',
          target: 'PNK-20261010-01',
          detail: 'Nhập kho 100 sản phẩm Áo kiểu nữ Rayon',
          created_at: '2026-10-10T08:30:00Z',
        },
      ],

      // Bảng system_settings (Cấu hình hệ thống)
      systemSettings: {
        cod_enabled: true,
        default_shipping_fee: 30000,
        free_shipping_from: 500000,
        return_window_days: 7,
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

      // Warehouse: Tạo phiếu nhập kho (cộng tồn kho variant + ghi sổ cái)
      createGoodsReceipt: ({ supplierName, items, userName }) => {
        const code = 'PNK-' + Date.now().toString().slice(-6);
        const newReceipt = {
          id: Date.now(),
          code,
          supplier_name: supplierName || 'Nhà cung cấp Việt Nam',
          created_by: userName || 'Thủ kho',
          created_at: new Date().toISOString(),
          items,
        };

        // Cập nhật tồn kho động & ghi sổ cái
        set((state) => {
          const updatedProducts = state.products.map((p) => {
            const updatedVariants = p.variants?.map((v) => {
              const matchedItem = items.find((it) => it.variant_id === v.id);
              if (matchedItem) {
                return { ...v, stock: v.stock + Number(matchedItem.quantity) };
              }
              return v;
            });
            return { ...p, variants: updatedVariants };
          });

          const newMovements = items.map((it) => ({
            id: Date.now() + Math.random(),
            variant_id: it.variant_id,
            sku: it.sku,
            quantity: Number(it.quantity),
            reason: 'IMPORT',
            ref_type: 'goods_receipt',
            created_by: userName || 'Thủ kho',
            created_at: new Date().toISOString(),
          }));

          return {
            goodsReceipts: [newReceipt, ...state.goodsReceipts],
            products: updatedProducts,
            stockMovements: [...newMovements, ...state.stockMovements],
          };
        });

        get().logAudit(userName, 'STOCK_RECEIPT', code, `Nhập kho thành công`);
        return newReceipt;
      },

      // Warehouse: Tạo phiếu xuất kho cho đơn hàng (trừ tồn kho variant + ghi sổ cái)
      createGoodsIssue: ({ order, carrier, trackingCode, userName }) => {
        const code = 'PXK-' + Date.now().toString().slice(-6);
        const newIssue = {
          id: Date.now(),
          code,
          order_code: order.code,
          carrier: carrier || 'Giao Hàng Tiết Kiệm (GHTK)',
          tracking_code: trackingCode || 'GHTK' + Date.now().toString().slice(-6),
          created_by: userName || 'Thủ kho',
          created_at: new Date().toISOString(),
          items: order.items,
        };

        // Trừ tồn kho & ghi sổ cái
        set((state) => {
          const updatedProducts = state.products.map((p) => {
            const updatedVariants = p.variants?.map((v) => {
              const matched = order.items.find((it) => it.variant_id === v.id);
              if (matched) {
                return { ...v, stock: Math.max(0, v.stock - matched.quantity) };
              }
              return v;
            });
            return { ...p, variants: updatedVariants };
          });

          const newMovements = order.items.map((it) => ({
            id: Date.now() + Math.random(),
            variant_id: it.variant_id,
            sku: it.color + '-' + it.size,
            quantity: -it.quantity,
            reason: 'EXPORT',
            ref_type: 'goods_issue',
            created_by: userName || 'Thủ kho',
            created_at: new Date().toISOString(),
          }));

          return {
            goodsIssues: [newIssue, ...state.goodsIssues],
            products: updatedProducts,
            stockMovements: [...newMovements, ...state.stockMovements],
          };
        });

        get().logAudit(userName, 'STOCK_ISSUE', code, `Xuất kho cho đơn hàng ${order.code}`);
        return newIssue;
      },

      // Warehouse: Xác nhận nhận hàng đổi trả về kho (cộng lại tồn kho nếu restock=true)
      confirmReturnReceipt: ({ orderCode, variantId, quantity, userName }) => {
        set((state) => {
          const updatedProducts = state.products.map((p) => {
            const updatedVariants = p.variants?.map((v) => {
              if (v.id === variantId) {
                return { ...v, stock: v.stock + quantity };
              }
              return v;
            });
            return { ...p, variants: updatedVariants };
          });

          const newMovement = {
            id: Date.now(),
            variant_id: variantId,
            sku: 'RESTOCK',
            quantity: quantity,
            reason: 'RETURN_IN',
            ref_type: 'return_request',
            created_by: userName,
            created_at: new Date().toISOString(),
          };

          return {
            products: updatedProducts,
            stockMovements: [newMovement, ...state.stockMovements],
          };
        });

        get().logAudit(userName, 'RETURN_CONFIRM', orderCode, `Xác nhận nhận hàng hoàn lại kho (+${quantity} chiếc)`);
      },

      // CSKH: Duyệt / Ẩn bài đánh giá review (bảng reviews.status)
      moderateReview: (reviewId, newStatus, userName) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, status: newStatus } : r
          ),
        }));
        get().logAudit(userName, 'REVIEW_MODERATE', `Review #${reviewId}`, `Đổi trạng thái sang: ${newStatus}`);
      },

      // Admin: Cập nhật cài đặt hệ thống (system_settings)
      updateSettings: (newSettings, userName) => {
        set((state) => ({
          systemSettings: { ...state.systemSettings, ...newSettings },
        }));
        get().logAudit(userName, 'UPDATE_SETTINGS', 'system_settings', 'Thay đổi cấu hình hệ thống');
      },
    }),
    {
      name: 'shop-db-storage',
    }
  )
);

