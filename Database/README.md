# Database website bán quần áo (PostgreSQL)

Cấu trúc database cho website bán quần áo, theo thiết kế `schema_ban_hang_thoi_trang.dbml` (51 bảng, 17 enum; riêng đơn hàng được tách nhỏ, xem mục [Đơn hàng](#đơn-hàng-tách-thành-6-bảng)), dựa trên bảng phân quyền chức năng của dự án.

File DBML là tài liệu thiết kế gốc. Khi đổi cấu trúc, sửa cả DBML và `01_schema.sql` cho khớp nhau.

## Cấu trúc thư mục

| File | Nội dung | Khi nào chạy |
|---|---|---|
| `01_schema.sql` | 17 enum, 51 bảng, index, trigger, view, hàm kiểm tra quyền | Luôn chạy đầu tiên |
| `02_seed_required.sql` | Vai trò, quyền, phân quyền theo vai trò, cấu hình hệ thống | Luôn chạy, ở **mọi** môi trường |
| `03_seed_demo.sql` | Size/màu/chất liệu, đơn vị vận chuyển, danh mục, sản phẩm, tồn kho, tài khoản admin mẫu | **Chỉ** khi phát triển, **không** chạy trên production |

## Yêu cầu

- PostgreSQL **13 trở lên**
- Encoding database: `UTF8`

## Cách chạy

### 1. Tạo database trống

Lệnh `CREATE DATABASE` không chạy được bên trong giao dịch, nên tạo riêng, không đặt chung với các file trên:

```sql
CREATE DATABASE shop_db ENCODING 'UTF8';
```

(Hoặc trong pgAdmin: chuột phải **Databases → Create → Database**.)

### 2. Chạy các file theo thứ tự

**Bằng psql** (khuyên dùng, dừng ngay khi có lỗi):

```bash
psql -U postgres -d shop_db -v ON_ERROR_STOP=1 -f 01_schema.sql
psql -U postgres -d shop_db -v ON_ERROR_STOP=1 -f 02_seed_required.sql
psql -U postgres -d shop_db -v ON_ERROR_STOP=1 -f 03_seed_demo.sql   # tùy chọn, chỉ môi trường dev
```

Trên Windows nếu tiếng Việt hiển thị lỗi, chạy `set PGCLIENTENCODING=UTF8` trước.

**Bằng pgAdmin:** chuột phải `shop_db` → **Query Tool** (phải mở trên `shop_db`), mở từng file, **bỏ chọn mọi đoạn văn bản** rồi bấm Execute để chạy cả file. Sau khi chạy, pgAdmin chỉ hiện kết quả của lệnh cuối (`COMMIT`), đó là bình thường. Nhớ **Refresh** cây bên trái để thấy bảng.

Mỗi file có `BEGIN` và `COMMIT` riêng. Nếu một file báo lỗi, toàn bộ file đó bị hủy, hãy `ROLLBACK;` (hoặc đóng tab) rồi sửa lỗi và chạy lại.

> **Đang có database theo cấu trúc cũ** (bảng `coupons`, `goods_receipts`, `stock_movements`..., hoặc `orders` còn cột `customer_phone`, `total_amount`...)? Cấu trúc mới khác hoàn toàn, hãy xóa và tạo lại: `DROP DATABASE shop_db;` rồi làm lại từ bước 1.

### 3. Kiểm tra

```sql
-- Phải ra 51 bảng
SELECT count(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Số quyền mỗi vai trò: CS_STAFF 7, WAREHOUSE_MANAGER 8, CUSTOMER 14, SUPER_ADMIN 35
SELECT r.code, count(*) FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id GROUP BY r.code ORDER BY 2;

-- Chỉ có sau khi chạy 03_seed_demo.sql: tồn kho 50, 40, 30, 20
SELECT sku, quantity_on_hand, quantity_available FROM v_inventory_available;
```

## Vai trò và phân quyền

Một tài khoản có thể có nhiều vai trò: `users` → `user_roles` → `roles` → `role_permissions` → `permissions`. Tra quyền của một tài khoản:

```sql
SELECT permission FROM v_user_permissions WHERE phone = '0900000000';
```

| Vai trò | `roles.code` | Quyền |
|---|---|---|
| Khách vãng lai | (không có tài khoản, xử lý ở ứng dụng) | `PRODUCT_VIEW`, `PRODUCT_SEARCH`, `GUEST_CHECKOUT`, `GUEST_RETURN_REQUEST`, `ACCOUNT_REGISTER`, `LIVECHAT_USE` |
| Khách hàng thành viên | `CUSTOMER` | `PRODUCT_VIEW`, `PRODUCT_SEARCH`, `PROFILE_MANAGE`, `ADDRESS_MANAGE`, `CART_ORDER`, `BUY_NOW`, `VOUCHER_LOYALTY_APPLY`, `ORDER_HISTORY_OWN`, `ORDER_CANCEL_OWN`, `RETURN_REQUEST_CREATE`, `LOYALTY_REDEEM`, `WISHLIST_MANAGE`, `REVIEW_CREATE`, `LIVECHAT_USE` |
| Quản lý kho | `WAREHOUSE_MANAGER` | `PRODUCT_MANAGE`, `STOCK_IO_MANAGE`, `STOCKTAKE_MANAGE`, `ORDER_HISTORY_ALL_VIEW`, `ORDER_STATUS_UPDATE`, `RETURN_RECEIVE_CONFIRM`, `WAREHOUSE_REPORT_VIEW`, `PROFILE_MANAGE` |
| Nhân viên CSKH | `CS_STAFF` | `ORDER_HISTORY_ALL_VIEW`, `ORDER_CONFIRM_CANCEL`, `RETURN_REQUEST_REVIEW`, `REFUND_TRACK`, `REVIEW_MODERATE`, `LIVECHAT_REPLY`, `PROFILE_MANAGE` |
| Admin tối cao | `SUPER_ADMIN` | Toàn bộ 35 quyền, thêm `USER_VIEW`, `ACCOUNT_ROLE_MANAGE`, `SYSTEM_CONFIG`, `LOG_VIEW`, `REPORT_ALL_VIEW`, `MARKETING_MANAGE` |

### Admin xem mọi đơn hàng

`SUPER_ADMIN` **luôn có toàn bộ quyền**, trong đó có `ORDER_HISTORY_ALL_VIEW` (xem mọi đơn, kể cả đơn khách vãng lai):

- Thêm quyền mới vào `permissions` thì database tự gán cho `SUPER_ADMIN` (không cần sửa seed).
- Không gỡ được quyền của `SUPER_ADMIN` khỏi `role_permissions`.
- `v_user_permissions` và `has_permission()` coi `SUPER_ADMIN` có mọi quyền.

Backend dùng các hàm sau để lấy / kiểm tra đơn theo người đang đăng nhập, thay vì tự viết điều kiện lọc:

```sql
SELECT has_permission(5, 'ORDER_HISTORY_ALL_VIEW');   -- admin, CSKH, kho: true
SELECT can_view_order(5, 123);                        -- được xem đơn 123 không
SELECT * FROM orders_visible_to(5)                    -- admin/CSKH/kho: mọi đơn; khách: đơn của mình
WHERE status = 'new' ORDER BY created_at DESC;
```

Chia việc xử lý đơn giữa các vai trò:

| Bước | Ai làm | Quyền |
|---|---|---|
| `new → processing` (xác nhận đơn), hủy đơn theo yêu cầu khách | CSKH | `ORDER_CONFIRM_CANCEL` |
| `processing → packing → shipping → completed`, xuất kho | Quản lý kho | `ORDER_STATUS_UPDATE`, `STOCK_IO_MANAGE` |
| Hủy đơn của chính mình (khi còn `new` / `processing`) | Khách hàng | `ORDER_CANCEL_OWN` |

Ứng dụng kiểm tra quyền theo từng bước chuyển trạng thái, database chỉ chặn chuyển sai luồng.

Ràng buộc vai trò do database tự đảm bảo:

- Tài khoản `user_type = 'customer'` **tự được gán** vai trò `CUSTOMER` khi tạo.
- `CUSTOMER` chỉ gán cho tài khoản `customer`; các vai trò nhân viên chỉ gán cho tài khoản `staff`.
- Luôn còn ít nhất 1 `SUPER_ADMIN` đang hoạt động: không gỡ vai trò, khóa hay xóa được admin cuối cùng.
- `user_roles.assigned_by` tự lấy từ `app.user_id` nếu không truyền.

## Những việc ứng dụng phải làm

1. **Tạo admin đầu tiên từ ứng dụng.** File SQL không chứa mật khẩu thật. Tài khoản `0900000000` / `admin@shop.local` trong file demo có mật khẩu bị khóa. Mật khẩu và OTP luôn lưu dạng băm (bcrypt/argon2).
2. **Kiểm tra quyền ở backend**, không chỉ ẩn nút ở giao diện. Khách hàng chỉ được xem dữ liệu của chính mình (lọc theo `user_id`).
3. **Báo cho database biết ai đang thao tác**, để lịch sử ghi đúng người. Trước khi sửa đơn hàng, yêu cầu đổi trả hay hoàn tiền, chạy trong cùng giao dịch:

   ```sql
   SET LOCAL app.user_id = '5';   -- id của tài khoản đang đăng nhập
   ```

4. **Sinh mã** `orders.order_code`, `return_requests.request_code`, `stock_documents.code`, `stocktakes.code` ở phía ứng dụng.
5. **Giá bán thật là `product_variants.price`.** `products.base_price` chỉ là giá hiển thị "từ ...", database tự đặt bằng giá thấp nhất của các biến thể đang bán. `order_items.unit_price` không được cao hơn giá biến thể, chỉ được thấp hơn khi sản phẩm đang có khuyến mãi (`promotions` còn hiệu lực). Giữ chỗ tồn kho khi đặt hàng do database tự làm (xem bảng trigger).
6. **Tạo đơn trong một giao dịch**, theo thứ tự: `orders` → `order_customers` → `order_shipping_addresses` → `order_amounts` → `order_items` → (`voucher_usages` nếu dùng voucher). Thiếu 1 trong 3 bảng `order_customers`, `order_shipping_addresses`, `order_amounts` thì `COMMIT` báo lỗi. Sau khi đơn rời `new` không thêm/sửa dòng hàng và tiền được nữa.
7. **Hủy đơn:** thêm 1 dòng `order_cancellations (order_id, reason)`, database tự chuyển đơn sang `cancelled`. Không `UPDATE orders SET status = 'cancelled'` trực tiếp (sẽ bị chặn).
8. **Tích/dùng điểm:** ứng dụng ghi `loyalty_transactions` (`earn` khi đơn hoàn thành, `redeem_order` khi dùng điểm, `refund` khi hủy đơn đã dùng điểm). Đổi quà chỉ cần thêm dòng `reward_redemptions`.
9. **Khách vãng lai (Guest Checkout):**
   - Đơn có `user_id = NULL`, bắt buộc `order_customers.customer_name`, `customer_phone`. Database chặn đơn khách vãng lai dùng điểm.
   - Tra cứu / hủy đơn / gửi đổi trả: backend chỉ cho phép khi khớp **mã đơn + số điện thoại**, và nên gửi OTP trước khi cho hủy hoặc đổi/trả, vì mã đơn dễ đoán.
   - Yêu cầu đổi/trả của đơn khách vãng lai có `user_id = NULL`. Thông tin hoàn tiền (ngân hàng, số tài khoản) ghi ở `refunds`.
   - Live chat: `chat_conversations.customer_id = NULL`, lưu `guest_name`, `guest_contact`.
10. **Giỏ hàng khách vãng lai** lưu trong `carts` theo `session_token` (cookie):
   - Tự hết hạn sau `cart.guest_ttl_days` ngày (mặc định 30) kể từ lần thay đổi cuối. Mỗi lần thêm/sửa sản phẩm trong giỏ thì hạn được gia hạn.
   - Chạy định kỳ (ví dụ mỗi đêm) để xóa giỏ hết hạn: `SELECT cleanup_expired_guest_carts();`
   - Khi khách đăng nhập/đăng ký, gộp giỏ vào giỏ tài khoản (cộng dồn số lượng, xóa giỏ khách): `SELECT merge_guest_cart('<session_token>', <user_id>);`
   - Giỏ thành viên không hết hạn (`expires_at = NULL`).

## Những gì database tự xử lý (trigger)

| Việc | Cách hoạt động |
|---|---|
| Giữ chỗ hàng | Thêm dòng hàng vào đơn thì tự tăng `quantity_reserved`, **chỉ khi còn đủ hàng chưa giữ** (2 khách đặt cùng lúc không mua lố được). Hủy đơn thì tự trả lại. Xuất kho theo đơn trừ cả `quantity_on_hand` lẫn `quantity_reserved`. Xuất không gắn đơn / xuất hàng đổi không được lấy vào hàng đang giữ cho đơn khác. Số còn bán được: `v_inventory_available.quantity_available` |
| Giá | Đổi giá hoặc ẩn/hiện biến thể thì `products.base_price` tự cập nhật bằng giá thấp nhất của biến thể đang bán. Dòng hàng phải là biến thể đang bán, giá không vượt giá biến thể |
| Tồn kho | Thêm biến thể thì tự tạo dòng `inventories`. Thêm dòng phiếu kho thì `quantity_on_hand` tự cộng (`import`, `return_import`) hoặc trừ (`export`, `exchange_export`). Kiểm kê tự lấy tồn hệ thống, tính `difference` và đặt tồn bằng số đếm thực tế. Tồn không thể âm |
| Phiếu kho | `export` gắn đơn chỉ tạo khi đơn đang `packing`, chỉ xuất biến thể có trong đơn, không vượt số lượng đặt. `return_import` / `exchange_export` phải gắn yêu cầu đổi/trả đã `received`, chỉ nhập lại đúng hàng khách trả / xuất đúng biến thể đổi, không vượt số lượng |
| Luồng trạng thái đơn | Đơn mới luôn ở `new`. `new → processing → packing → shipping → completed`. Chỉ hủy được khi còn `new` hoặc `processing`, bằng cách thêm `order_cancellations` (bắt buộc `reason`; `cancelled_at`, `cancelled_by` tự gán). Sang `shipping` phải xuất kho **đủ** hàng. Mỗi lần đổi ghi vào `order_status_histories`. Sang `shipping` / `completed` tự ghi `order_shipments.shipped_at` / `delivered_at` |
| Bảng chi tiết đơn | Đơn mới phải có đủ `order_customers`, `order_shipping_addresses`, `order_amounts` (kiểm tra lúc `COMMIT`). `order_amounts` chỉ sửa khi đơn `new`, đơn khách vãng lai không dùng điểm. Người đặt và địa chỉ sửa được khi đơn còn `new` / `processing` (trước khi đóng gói). Không xóa riêng, không chuyển sang đơn khác. Sửa bảng chi tiết thì `orders.updated_at` tự cập nhật |
| Voucher | Thêm `voucher_usages` thì kiểm tra voucher khớp đơn, còn hiệu lực, đủ giá trị tối thiểu, chưa hết `usage_limit`, chưa vượt `per_user_limit` (khách vãng lai đếm theo số điện thoại), rồi tăng `used_count`. Hủy đơn thì tự trả lại 1 lượt (đơn đã hủy không tính vào cả tổng lượt lẫn lượt mỗi người) |
| Điểm loyalty | Thêm dòng `loyalty_transactions` thì `users.loyalty_points` tự cập nhật, không tiêu quá số điểm đang có. Mỗi đơn chỉ được tích điểm (`earn`) 1 lần và trừ điểm (`redeem_order`) 1 lần. Đổi quà (`reward_redemptions`) tự lấy số điểm theo quà, trừ `stock` của quà và ghi dòng `redeem_gift` |
| Đổi/trả | Chỉ chủ đơn tạo được (đơn khách vãng lai thì `user_id` của yêu cầu là `NULL`), cho đơn đã `completed`, trong thời hạn `return.window_days` (mặc định 7 ngày, tính từ lúc đơn hoàn thành). Luồng: `pending → approved/rejected`, `approved → received`, `received → completed`. Đổi hàng chỉ `completed` khi đã xuất đủ hàng đổi. `reviewed_by/at`, `received_by/at` tự gán. Dòng hàng phải thuộc đúng đơn, tổng số lượng (trừ yêu cầu bị từ chối) không vượt số đã mua, chỉ sửa khi còn `pending` (riêng `condition_note`, `is_restocked` kho sửa được sau đó). Đổi hàng bắt buộc có `exchange_variant_id`, hoàn tiền thì không |
| Hoàn tiền | Gắn yêu cầu đổi/trả thì phải cùng đơn, loại `refund`, đã được duyệt. Tổng hoàn (trừ `failed`) không vượt `order_amounts.total_amount` của đơn. `completed_at` tự gán |
| Đánh giá | Chỉ người mua, đúng sản phẩm của dòng hàng, đơn đã `completed`, mỗi dòng hàng 1 lần. Đánh giá mới luôn ở `pending` |
| Chỉ thêm dòng | `order_status_histories`, `order_cancellations`, `loyalty_transactions`, `reward_redemptions`, `voucher_usages`, `activity_logs`, `stock_document_items`, `stocktake_items` **không sửa hay xóa được**. Vì lịch sử đơn không xóa được nên đơn hàng cũng không xóa cứng được, chỉ hủy. Sai thì thêm phiếu điều chỉnh, kiểm kê hoặc dòng loyalty `adjust` |

Hệ quả: dữ liệu mẫu trong `03_seed_demo.sql` không xóa từng dòng được. Muốn bỏ thì tạo lại database từ đầu.

## Quy ước thiết kế

- Tên bảng, tên cột, giá trị enum giữ **đúng như DBML**, trừ `orders` đã tách thành 6 bảng (cần cập nhật DBML theo). Kiểu dữ liệu đổi cho hợp PostgreSQL: `timestamp` → `TIMESTAMPTZ`, `json` → `JSONB`, `tinyint` → `SMALLINT`, `increment` → `GENERATED ALWAYS AS IDENTITY`.
- Tiền dùng `NUMERIC(15,2)`, không dùng `FLOAT`.
- Sản phẩm xóa mềm bằng `deleted_at`, ẩn/hiện bằng `is_visible`. Tài khoản khóa bằng `users.status = 'locked'`, không xóa.
- `order_shipping_addresses` chụp lại địa chỉ người nhận, `order_items` chụp lại tên, biến thể, giá lúc mua: đổi giá sau này không ảnh hưởng đơn cũ.
- Ảnh và video chỉ lưu đường dẫn (`url`), file nằm ở dịch vụ lưu trữ riêng.
- Ràng buộc `UNIQUE (product_id, size_id, color_id, material_id)` của biến thể không chặn trùng khi có cột `NULL` (đặc tính của PostgreSQL). Nên luôn gán đủ size/màu/chất liệu.

## Đơn hàng tách thành 6 bảng

Mỗi bảng con quan hệ 1-1 với `orders` (khóa chính chính là `order_id`), mỗi bảng chỉ giữ 1 nhóm thông tin nên dễ sửa và phân quyền riêng:

| Bảng | Nội dung | Ai sửa / khi nào |
|---|---|---|
| `orders` | Mã đơn, chủ đơn, mua ngay, phương thức / trạng thái thanh toán, trạng thái đơn, ghi chú | Trạng thái theo luồng |
| `order_customers` | Tên, SĐT, email người đặt | Khi đơn `new` / `processing` |
| `order_shipping_addresses` | Người nhận, SĐT, tỉnh / quận / phường, địa chỉ | Khi đơn `new` / `processing` |
| `order_amounts` | Tạm tính, voucher, điểm, phí ship, tổng tiền | Chỉ khi đơn `new` |
| `order_shipments` | Đơn vị vận chuyển, mã vận đơn, `shipped_at`, `delivered_at` | Kho, khi giao hàng (tùy chọn, có thể chưa có) |
| `order_cancellations` | Lý do, người hủy, thời điểm hủy | Thêm 1 lần, không sửa / xóa |

Cần xem đủ thông tin một đơn thì dùng view `v_order_details` (đã gộp sẵn các bảng trên, thêm tên voucher, tên đơn vị vận chuyển, tổng số lượng sản phẩm).

## Các nhóm bảng (51 bảng)

| Nhóm | Bảng |
|---|---|
| Tài khoản & phân quyền | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `password_reset_otps`, `customer_addresses` |
| Sản phẩm | `categories`, `products`, `sizes`, `colors`, `materials`, `product_variants`, `product_images` |
| Khuyến mãi & loyalty | `promotions`, `promotion_products`, `vouchers`, `voucher_usages`, `loyalty_transactions`, `loyalty_rewards`, `reward_redemptions` |
| Giỏ hàng & đơn hàng | `carts`, `cart_items`, `wishlists`, `shipping_carriers`, `orders`, `order_customers`, `order_shipping_addresses`, `order_amounts`, `order_shipments`, `order_cancellations`, `order_items`, `order_status_histories`, `payments` |
| Đổi trả & đánh giá | `return_requests`, `return_request_items`, `return_request_media`, `refunds`, `reviews`, `review_media` |
| Kho | `inventories`, `suppliers`, `stock_documents`, `stock_document_items`, `stocktakes`, `stocktake_items` |
| Hệ thống | `chat_conversations`, `chat_messages`, `system_settings`, `activity_logs`, `marketing_campaigns` |

View: `v_inventory_available` (tồn có thể bán), `v_product_rating` (điểm đánh giá trung bình), `v_user_permissions` (quyền của từng tài khoản), `v_order_details` (đơn hàng đầy đủ).

Hàm cho ứng dụng gọi: `cleanup_expired_guest_carts()`, `merge_guest_cart(session_token, user_id)`, `has_permission(user_id, code)`, `can_view_order(user_id, order_id)`, `orders_visible_to(user_id)`.

## Bảo mật khi đẩy lên git

Không đưa các thứ sau vào repository:

- Mật khẩu thật (`postgres`, `shop_user`), khóa API: đặt trong file `.env`, thêm `.env` vào `.gitignore`.
- File sao lưu chứa dữ liệu thật (`*.dump`, `*.backup`, `.sql` xuất từ database đang chạy).
- Thư mục ảnh người dùng tải lên (ví dụ `media/`).

Website không nên kết nối bằng tài khoản `postgres`. Cuối `01_schema.sql` có sẵn các lệnh (đang để comment) tạo user `shop_user` với quyền vừa đủ, hãy đổi mật khẩu rồi chạy riêng.
