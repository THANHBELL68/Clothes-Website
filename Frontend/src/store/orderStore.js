import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Danh sách đơn hàng mẫu khởi tạo chuẩn 6 bảng PostgreSQL & 02_seed_required.sql
export const INITIAL_SEEDED_ORDERS = [
  {
    id: 1,
    order_id: 1,
    code: 'ORD-20261016-001',
    order_code: 'ORD-20261016-001',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'new', // Đơn mới chờ CSKH xác nhận (new -> processing)
    customer_name: 'Nguyễn Văn Khách',
    customer_phone: '0912345678',
    customer_email: 'khachhang@gmail.com',
    receiver_name: 'Nguyễn Văn Khách',
    recipient_name: 'Nguyễn Văn Khách',
    receiver_phone: '0912345678',
    recipient_phone: '0912345678',
    shipping_address: 'Số 12 Duy Tân, Tòa nhà FPT, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
    street_address: 'Số 12 Duy Tân, Tòa nhà FPT, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
    payment_method: 'bank_qr',
    payment_status: 'paid',
    subtotal: 599000,
    shipping_fee: 0,
    coupon_discount: 59900,
    voucher_discount: 59900,
    points_discount: 10000,
    points_used: 10,
    total: 529100,
    total_amount: 529100,
    shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
    tracking_code: 'GHN88291039VN',
    items: [
      {
        id: 1001,
        product_id: 1,
        variant_id: 101,
        product_name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
        size: 'S',
        color: 'Trắng',
        unit_price: 599000,
        quantity: 1,
        image: '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
        is_reviewed: false,
      },
    ],
    return_request: null,
  },
  {
    id: 2,
    order_id: 2,
    code: 'ORD-20261016-002',
    order_code: 'ORD-20261016-002',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'new', // Đơn mới đang chờ CSKH xét duyệt
    customer_name: 'Trần Thị Mai',
    customer_phone: '0988776655',
    customer_email: 'maitran@gmail.com',
    receiver_name: 'Trần Thị Mai',
    recipient_name: 'Trần Thị Mai',
    receiver_phone: '0988776655',
    recipient_phone: '0988776655',
    shipping_address: 'Số 88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    street_address: 'Số 88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Bến Nghé',
    payment_method: 'cod',
    payment_status: 'pending',
    subtotal: 899000,
    shipping_fee: 0,
    coupon_discount: 0,
    voucher_discount: 0,
    points_discount: 0,
    points_used: 0,
    total: 899000,
    total_amount: 899000,
    shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
    tracking_code: 'GHN992817362VN',
    items: [
      {
        id: 1002,
        product_id: 2,
        variant_id: 201,
        product_name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió (Kéo Khóa)',
        size: 'M',
        color: 'Navy',
        unit_price: 899000,
        quantity: 1,
        image: '/images/products/nam_demo/san_pham1/vngoods_69_486116_3x4.avif',
        is_reviewed: false,
      },
    ],
    return_request: null,
  },
  {
    id: 3,
    order_id: 3,
    code: 'ORD-20261015-001',
    order_code: 'ORD-20261015-001',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: 'processing', // CSKH đã duyệt -> Kho chuẩn bị soạn hàng (processing -> packing)
    customer_name: 'Hoàng Thị Yến',
    customer_phone: '0977888999',
    customer_email: 'hoangyen@gmail.com',
    receiver_name: 'Hoàng Thị Yến',
    recipient_name: 'Hoàng Thị Yến',
    receiver_phone: '0977888999',
    recipient_phone: '0977888999',
    shipping_address: 'Tòa Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
    street_address: 'Tòa Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
    province: 'Hồ Chí Minh',
    district: 'Bình Thạnh',
    ward: 'Phường 22',
    payment_method: 'bank_qr',
    payment_status: 'paid',
    subtotal: 599000,
    shipping_fee: 0,
    coupon_discount: 0,
    voucher_discount: 0,
    points_discount: 0,
    points_used: 0,
    total: 599000,
    total_amount: 599000,
    shipping_carrier_name: 'Giao Hàng Tiết Kiệm (GHTK)',
    tracking_code: 'GHTK88273619VN',
    items: [
      {
        id: 1003,
        product_id: 1,
        variant_id: 102,
        product_name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
        size: 'M',
        color: 'Trắng',
        unit_price: 599000,
        quantity: 1,
        image: '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
        is_reviewed: false,
      },
    ],
    return_request: null,
  },
  {
    id: 4,
    order_id: 4,
    code: 'ORD-20261014-001',
    order_code: 'ORD-20261014-001',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: 'completed', // Đã hoàn thành trong 7 ngày -> có yêu cầu đổi trả pending
    customer_name: 'Nguyễn Văn Khách',
    customer_phone: '0912345678',
    customer_email: 'khachhang@gmail.com',
    receiver_name: 'Nguyễn Văn Khách',
    recipient_name: 'Nguyễn Văn Khách',
    receiver_phone: '0912345678',
    recipient_phone: '0912345678',
    shipping_address: 'Số 12 ngõ 45 phố Duy Tân, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
    street_address: 'Số 12 ngõ 45 phố Duy Tân, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
    payment_method: 'cod',
    payment_status: 'paid',
    subtotal: 899000,
    shipping_fee: 0,
    coupon_discount: 0,
    voucher_discount: 0,
    points_discount: 0,
    points_used: 0,
    total: 899000,
    total_amount: 899000,
    shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
    tracking_code: 'GHN48291048VN',
    items: [
      {
        id: 1004,
        product_id: 2,
        variant_id: 201,
        product_name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió (Kéo Khóa)',
        size: 'M',
        color: 'Navy',
        unit_price: 899000,
        quantity: 1,
        image: '/images/products/nam_demo/san_pham1/vngoods_69_486116_3x4.avif',
        is_reviewed: false,
      },
    ],
    return_request: {
      id: 501,
      type: 'exchange',
      reason: 'Mặc hơi rộng, muốn đổi sang size S',
      description: 'Tôi muốn đổi sang áo cùng màu nhưng size S cho vừa vặn hơn. Áo vẫn còn nguyên tem mác.',
      exchange_variant_id: 200,
      status: 'pending', // Chờ CSKH duyệt
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
  },
  {
    id: 5,
    order_id: 5,
    code: 'ORD-20261012-003',
    order_code: 'ORD-20261012-003',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    status: 'completed',
    customer_name: 'Nguyễn Văn Khách',
    customer_phone: '0912345678',
    customer_email: 'khachhang@gmail.com',
    receiver_name: 'Nguyễn Văn Khách',
    recipient_name: 'Nguyễn Văn Khách',
    receiver_phone: '0912345678',
    recipient_phone: '0912345678',
    shipping_address: '91 Chùa Láng, P. Láng Thượng, Q. Đống Đa, Hà Nội',
    street_address: '91 Chùa Láng, P. Láng Thượng, Q. Đống Đa, Hà Nội',
    province: 'Hà Nội',
    district: 'Đống Đa',
    ward: 'Láng Thượng',
    payment_method: 'bank_qr',
    payment_status: 'paid',
    subtotal: 1098000,
    shipping_fee: 0,
    coupon_discount: 50000,
    voucher_discount: 50000,
    points_discount: 20000,
    points_used: 20,
    total: 1028000,
    total_amount: 1028000,
    shipping_carrier_name: 'Giao Hàng Tiết Kiệm (GHTK)',
    tracking_code: 'GHTK1122334455',
    items: [
      {
        id: 1005,
        product_id: 1,
        variant_id: 102,
        product_name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
        size: 'M',
        color: 'Trắng',
        unit_price: 599000,
        quantity: 1,
        image: '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
        is_reviewed: true,
      },
    ],
    return_request: null,
  },
];

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: INITIAL_SEEDED_ORDERS,

      // Tạo đơn hàng mới theo flow DB và transaction 6 bảng
      createOrder: ({ items, address, paymentMethod, coupon, pointsUsed, subtotal, shippingFee, couponDiscount, pointsDiscount, total }) => {
        const orderCode = 'ORD-' + Date.now().toString().slice(-6);
        const orderId = Date.now();
        const streetFull = [address.street, address.ward, address.district, address.province].filter(Boolean).join(', ');

        const newOrder = {
          id: orderId,
          order_id: orderId,
          code: orderCode,
          order_code: orderCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'new', // Khởi tạo ở trạng thái 'new' theo trigger CSDL (01 // MỚI TẠO)
          customer_name: address.customer_name || address.receiver_name || 'Khách vãng lai',
          customer_phone: address.customer_phone || address.phone || '',
          customer_email: address.customer_email || '',
          receiver_name: address.receiver_name || address.customer_name || 'Khách vãng lai',
          recipient_name: address.receiver_name || address.customer_name || 'Khách vãng lai',
          receiver_phone: address.phone || address.customer_phone || '',
          recipient_phone: address.phone || address.customer_phone || '',
          shipping_address: streetFull || address.street || 'Địa chỉ nhận hàng',
          street_address: streetFull || address.street || 'Địa chỉ nhận hàng',
          province: address.province || 'Hà Nội',
          district: address.district || 'Cầu Giấy',
          ward: address.ward || 'Dịch Vọng Hậu',
          payment_method: paymentMethod || 'cod',
          payment_status: paymentMethod === 'bank_qr' ? 'paid' : 'pending',
          subtotal: subtotal || 0,
          shipping_fee: shippingFee || 0,
          coupon_discount: couponDiscount || 0,
          voucher_discount: couponDiscount || 0,
          points_discount: pointsDiscount || 0,
          points_used: pointsUsed || 0,
          total: total || 0,
          total_amount: total || 0,
          shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
          tracking_code: 'GHN' + String(orderId).slice(-8) + 'VN',
          items: (items || []).map((it, idx) => ({
            id: Date.now() + idx,
            product_id: it.product_id || it.id,
            variant_id: it.variant_id || (it.selectedVariant ? it.selectedVariant.id : 101),
            product_name: it.name || it.product_name || 'Sản phẩm thời trang',
            size: it.size || (it.selectedVariant ? it.selectedVariant.size : 'M'),
            color: it.color || (it.selectedVariant ? it.selectedVariant.color : 'Màu chuẩn'),
            unit_price: it.price || it.unit_price || 0,
            quantity: it.quantity || 1,
            image: it.image || '',
            is_reviewed: false,
          })),
          return_request: null,
        };

        set((state) => {
          const current = Array.isArray(state.orders) ? state.orders : [];
          return { orders: [newOrder, ...current] };
        });

        // Bắn tín hiệu toàn cục để các tab / components khác đồng bộ tức thì
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('shop_orders_updated', { detail: newOrder }));
          }
        } catch {}

        return newOrder;
      },

      // Hủy đơn hàng: Chỉ cho phép khi trạng thái là 'new' hoặc 'processing' (trigger CSDL quy định)
      cancelOrder: (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId || o.order_id === orderId);
        if (!order) return { success: false, message: 'Đơn hàng không tồn tại!' };
        if (order.status !== 'new' && order.status !== 'processing') {
          return {
            success: false,
            message: 'Đơn hàng đã được xuất kho, không thể tự hủy!',
          };
        }

        set((state) => ({
          orders: (state.orders || []).map((o) =>
            o.id === orderId || o.order_id === orderId
              ? {
                  ...o,
                  status: 'cancelled',
                  cancel_reason: reason || 'Khách hàng hủy đơn',
                  cancelled_at: new Date().toISOString(),
                }
              : o
          ),
        }));

        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('shop_orders_updated'));
          }
        } catch {}

        return { success: true, message: 'Đã hủy đơn hàng thành công!' };
      },

      // Yêu cầu đổi / trả hàng: Chỉ đơn 'completed' trong 7 ngày (trigger return_check)
      submitReturnRequest: (orderId, { type, reason, description, exchangeVariantId }) => {
        const order = get().orders.find((o) => o.id === orderId || o.order_id === orderId);
        if (!order || order.status !== 'completed') {
          return { success: false, message: 'Chỉ đơn hàng đã giao thành công mới được gửi yêu cầu đổi/trả!' };
        }

        const returnReq = {
          id: Date.now(),
          type: type || 'exchange', // 'exchange' (đổi) hoặc 'refund' (trả hoàn tiền)
          reason: reason || 'wrong_size',
          description,
          exchange_variant_id: exchangeVariantId || null,
          status: 'pending', // Chờ CSKH duyệt
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          orders: (state.orders || []).map((o) =>
            o.id === orderId || o.order_id === orderId ? { ...o, return_request: returnReq } : o
          ),
        }));

        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('shop_orders_updated'));
          }
        } catch {}

        return { success: true, message: 'Đã gửi yêu cầu đổi trả thành công! Nhân viên CSKH sẽ xem xét.' };
      },

      // Đánh giá sản phẩm đã mua (bảng reviews)
      submitReview: (orderId, orderItemId, { rating, comment }) => {
        set((state) => ({
          orders: (state.orders || []).map((order) => {
            if (order.id !== orderId && order.order_id !== orderId) return order;
            return {
              ...order,
              items: (order.items || []).map((item) =>
                item.id === orderItemId ? { ...item, is_reviewed: true } : item
              ),
            };
          }),
        }));
        return { success: true, message: 'Cảm ơn bạn đã gửi đánh giá!' };
      },

      // Nạp lại toàn bộ danh sách đơn hàng mẫu (dành cho CSKH / Tester)
      resetOrdersToDemo: () => {
        set({ orders: INITIAL_SEEDED_ORDERS });
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('shop_orders_updated'));
          }
        } catch {}
        return INITIAL_SEEDED_ORDERS;
      },

      // Tạo nhanh 1 đơn hàng mới ở trạng thái 'new' để CSKH kiểm thử ngay lập tức
      createDemoNewOrder: () => {
        const testCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const orderId = Date.now();
        const testOrder = {
          id: orderId,
          order_id: orderId,
          code: testCode,
          order_code: testCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'new', // new
          customer_name: 'Khách Hàng Thử Nghiệm',
          customer_phone: '0901234567',
          customer_email: 'testcustomer@gmail.com',
          receiver_name: 'Khách Hàng Thử Nghiệm',
          recipient_name: 'Khách Hàng Thử Nghiệm',
          receiver_phone: '0901234567',
          recipient_phone: '0901234567',
          shipping_address: 'Số 1 Đại Lộ Thăng Long, P. Mễ Trì, Q. Nam Từ Liêm, Hà Nội',
          street_address: 'Số 1 Đại Lộ Thăng Long, P. Mễ Trì, Q. Nam Từ Liêm, Hà Nội',
          province: 'Hà Nội',
          district: 'Nam Từ Liêm',
          ward: 'Mễ Trì',
          payment_method: 'cod',
          payment_status: 'pending',
          subtotal: 599000,
          shipping_fee: 0,
          coupon_discount: 0,
          voucher_discount: 0,
          points_discount: 0,
          points_used: 0,
          total: 599000,
          total_amount: 599000,
          shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
          tracking_code: 'GHN' + String(orderId).slice(-8) + 'VN',
          items: [
            {
              id: Date.now() + 10,
              product_id: 1,
              variant_id: 101,
              product_name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
              size: 'M',
              color: 'Trắng',
              unit_price: 599000,
              quantity: 1,
              image: '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
              is_reviewed: false,
            },
          ],
          return_request: null,
        };

        set((state) => ({
          orders: [testOrder, ...(state.orders || [])],
        }));

        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('shop_orders_updated', { detail: testOrder }));
          }
        } catch {}

        return testOrder;
      },
    }),
    {
      name: 'shop-order-storage',
      version: 4, // Tự động migrate và merge dữ liệu seed chuẩn
      migrate: (persistedState, version) => {
        if (!persistedState || !Array.isArray(persistedState.orders) || persistedState.orders.length === 0) {
          return { orders: INITIAL_SEEDED_ORDERS };
        }

        // Đảm bảo không mất đơn hàng khách hàng vừa đặt, đồng thời bổ sung các đơn mẫu còn thiếu
        const existingCodes = new Set(
          persistedState.orders.map((o) => (o.code || o.order_code || '').toUpperCase())
        );

        const missingSeeds = INITIAL_SEEDED_ORDERS.filter(
          (seed) => !existingCodes.has((seed.code || seed.order_code || '').toUpperCase())
        );

        return {
          ...persistedState,
          orders: [...persistedState.orders, ...missingSeeds],
        };
      },
    }
  )
);

// Tự động lắng nghe sự kiện storage qua các tab khác nhau để đồng bộ dữ liệu thời gian thực
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'shop-order-storage') {
      try {
        useOrderStore.persist?.rehydrate();
      } catch {}
    }
  });
}
