import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [
        {
          id: 1,
          code: 'ORD-20261016-001',
          created_at: new Date().toISOString(),
          status: 'new', // Đơn mới đang chờ CSKH xét duyệt
          receiver_name: 'Nguyễn Văn Khách',
          receiver_phone: '0912345678',
          customer_phone: '0912345678',
          shipping_address: 'Số 12 Duy Tân, Tòa nhà FPT, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
          payment_method: 'bank_qr',
          payment_status: 'paid',
          subtotal: 599000,
          shipping_fee: 0,
          coupon_discount: 59900,
          points_discount: 10000,
          total: 529100,
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
          code: 'ORD-20261014-001',
          created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          status: 'completed', // completed | shipping | packing | processing | new | cancelled
          receiver_name: 'Nguyễn Văn Khách',
          receiver_phone: '0912345678',
          customer_phone: '0912345678',
          shipping_address: 'Số 12 ngõ 45 phố Duy Tân, P. Dịch Vọng Hậu, Q. Cầu Giấy, Hà Nội',
          payment_method: 'cod',
          payment_status: 'paid',
          subtotal: 899000,
          shipping_fee: 0,
          coupon_discount: 0,
          points_discount: 0,
          total: 899000,
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
      ],

      // Tạo đơn hàng mới theo flow DB
      createOrder: ({ items, address, paymentMethod, coupon, pointsUsed, subtotal, shippingFee, couponDiscount, pointsDiscount, total }) => {
        const orderCode = 'ORD-' + Date.now().toString().slice(-6);
        const newOrder = {
          id: Date.now(),
          code: orderCode,
          created_at: new Date().toISOString(),
          status: 'new', // Khởi tạo ở trạng thái 'new' theo trigger CSDL
          receiver_name: address.receiver_name,
          receiver_phone: address.phone,
          shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
          payment_method: paymentMethod || 'cod',
          payment_status: paymentMethod === 'bank_qr' ? 'paid' : 'pending',
          subtotal,
          shipping_fee: shippingFee,
          coupon_discount: couponDiscount,
          points_discount: pointsDiscount,
          total,
          items: items.map((it, idx) => ({
            id: Date.now() + idx,
            product_id: it.product_id,
            variant_id: it.variant_id,
            product_name: it.name,
            size: it.size,
            color: it.color,
            unit_price: it.price,
            quantity: it.quantity,
            image: it.image,
            is_reviewed: false,
          })),
          return_request: null,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      // Hủy đơn hàng: Chỉ cho phép khi trạng thái là 'new' hoặc 'processing' (trigger CSDL quy định)
      cancelOrder: (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return { success: false, message: 'Đơn hàng không tồn tại!' };
        if (order.status !== 'new' && order.status !== 'processing') {
          return {
            success: false,
            message: 'Đơn hàng đã được xuất kho, không thể tự hủy!',
          };
        }

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'cancelled',
                  cancel_reason: reason || 'Khách hàng thay đổi ý định',
                  cancelled_at: new Date().toISOString(),
                }
              : o
          ),
        }));

        return { success: true, message: 'Đã hủy đơn hàng thành công!' };
      },

      // Yêu cầu đổi / trả hàng: Chỉ đơn 'completed' trong 7 ngày (trigger return_check)
      submitReturnRequest: (orderId, { type, reason, description, exchangeVariantId }) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || order.status !== 'completed') {
          return { success: false, message: 'Chỉ đơn hàng đã giao thành công mới được gửi yêu cầu đổi/trả!' };
        }

        const returnReq = {
          id: Date.now(),
          type: type || 'exchange', // 'exchange' (đổi) hoặc 'return' (trả)
          reason: reason || 'wrong_size',
          description,
          exchange_variant_id: exchangeVariantId || null,
          status: 'pending', // Chờ CSKH duyệt
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, return_request: returnReq } : o
          ),
        }));

        return { success: true, message: 'Đã gửi yêu cầu đổi trả thành công! Nhân viên CSKH sẽ xem xét.' };
      },

      // Đánh giá sản phẩm đã mua (bảng reviews)
      submitReview: (orderId, orderItemId, { rating, comment }) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              items: order.items.map((item) =>
                item.id === orderItemId ? { ...item, is_reviewed: true } : item
              ),
            };
          }),
        }));
        return { success: true, message: 'Cảm ơn bạn đã gửi đánh giá!' };
      },
    }),
    {
      name: 'shop-order-storage',
    }
  )
);

