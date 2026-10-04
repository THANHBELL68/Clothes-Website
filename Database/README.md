# Database website bán quần áo (PostgreSQL)

Cấu trúc database cho website bán quần áo, thiết kế theo bảng phân quyền chức năng của dự án.

## Cấu trúc thư mục

| File | Nội dung | Khi nào chạy |
|---|---|---|
| `01_schema.sql` | 37 bảng, index, trigger, view | Luôn chạy đầu tiên |
| `02_seed_required.sql` | Vai trò, quyền, phân quyền theo vai trò, cấu hình hệ thống | Luôn chạy, ở **mọi** môi trường |
| `03_seed_demo.sql` | Danh mục, sản phẩm, tồn kho, tài khoản admin mẫu | **Chỉ** khi phát triển, **không** chạy trên production |

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

### 3. Kiểm tra

```sql
-- Phải ra 37 bảng
SELECT count(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Số quyền mỗi vai trò: cskh 5, warehouse 9, customer 11, admin 29
SELECT r.code, count(*) FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id GROUP BY r.code ORDER BY 2;

-- Chỉ có sau khi chạy 03_seed_demo.sql: tồn kho 50, 40, 30, 20; cột khop toàn true
SELECT * FROM v_stock_check;
```

## Vai trò và phân quyền

Quyền kiểm tra qua `users.role_id` → `roles` → `role_permissions` → `permissions`. Tra quyền của một tài khoản:

```sql
SELECT permission FROM v_user_permissions WHERE email = 'ten@example.com';
```

| Vai trò | `roles.code` | Quyền chính |
|---|---|---|
| Khách vãng lai | (không có tài khoản) | Xem sản phẩm, tìm kiếm, lọc. Phải đăng ký và đăng nhập mới đặt hàng được, **không có Guest Checkout** |
| Khách hàng thành viên | `customer` | Hồ sơ, sổ địa chỉ, giỏ hàng, đặt hàng, hủy đơn, đổi/trả, tích điểm, yêu thích, đánh giá, chat |
| Quản lý kho | `warehouse` | Danh mục và sản phẩm, nhập/xuất/kiểm kê kho, cập nhật trạng thái đơn, xác nhận hàng đổi/trả, báo cáo kho |
| Nhân viên CSKH | `cskh` | Xem đơn của mọi khách, duyệt/từ chối đổi trả, kiểm duyệt đánh giá, trả lời chat. **Không** sửa sản phẩm, tồn kho, cấu hình |
| Admin tối cao | `admin` | Toàn bộ 29 quyền, gồm quản lý tài khoản, gán vai trò, cấu hình hệ thống, nhật ký, báo cáo |

Danh sách quyền đầy đủ nằm trong `02_seed_required.sql`.

Lưu ý hai quyết định đã suy luận từ tài liệu phân quyền, nhóm nên xác nhận lại:

1. Vai trò `warehouse` có thêm quyền `order.view_any`, vì phải xem đơn mới đóng gói và cập nhật trạng thái được.
2. Vai trò `cskh` **không** có quyền `order.update_status`, dù tên vai trò có chữ "Xử lý đơn hàng". Tài liệu chỉ giao việc cập nhật trạng thái đơn cho Quản lý kho.

## Những việc ứng dụng phải làm

1. **Tạo admin đầu tiên từ ứng dụng.** File SQL không chứa mật khẩu thật. Tài khoản `admin@shop.local` trong file demo có mật khẩu bị khóa. Mật khẩu luôn lưu dạng băm (bcrypt/argon2).
2. **Kiểm tra quyền ở backend**, không chỉ ẩn nút ở giao diện. Khách hàng chỉ được xem dữ liệu của chính mình (lọc theo `user_id`).
3. **Báo cho database biết ai đang thao tác**, để lịch sử ghi đúng người. Trước khi sửa đơn hàng, yêu cầu đổi trả hay kho, chạy trong cùng giao dịch:

   ```sql
   SET LOCAL app.user_id = '5';   -- id của tài khoản đang đăng nhập
   ```

4. **Sinh mã đơn** (`orders.code`), mã phiếu (`goods_receipts.code`...) ở phía ứng dụng.
5. **Giữ chỗ tồn kho khi đặt hàng là việc của ứng dụng.** Tồn kho chỉ giảm khi tạo phiếu xuất kho, không giảm lúc khách đặt hàng. Ứng dụng nên kiểm tra tồn trước khi cho đặt, để tránh bán quá số lượng.

## Những gì database tự xử lý (trigger)

| Việc | Cách hoạt động |
|---|---|
| Tồn kho | Thêm dòng vào phiếu nhập/xuất, kiểm kê hoặc duyệt trả hàng thì `stock_movements` tự ghi dòng sổ cái, và `product_variants.stock` tự cộng/trừ. Tồn không thể âm |
| Điểm loyalty | Thêm dòng vào `loyalty_transactions` thì `users.loyalty_points` tự cập nhật. Không tiêu quá số điểm đang có |
| Luồng trạng thái đơn | `new → processing → packing → shipping → completed`. Chỉ hủy được khi đơn còn `new` hoặc `processing`. Chuyển sai luồng sẽ báo lỗi. Mỗi lần đổi được ghi vào `order_status_history` |
| Đổi/trả | Chỉ tạo được cho đơn đã `completed`, trong thời hạn `return.window_days` (mặc định 7 ngày) |
| Sổ cái và nhật ký | `stock_movements`, `loyalty_transactions`, `audit_logs` **chỉ cho thêm dòng**, không sửa hay xóa. Sai thì thêm dòng điều chỉnh |

Hệ quả: dữ liệu mẫu trong `03_seed_demo.sql` không xóa từng dòng được. Muốn bỏ thì tạo lại database từ đầu.

## Quy ước thiết kế

- Tiền dùng `NUMERIC(12,0)` (VND không có số lẻ), không dùng `FLOAT`.
- Xóa mềm bằng `is_deleted`, ẩn/hiện bằng `is_active`. Tài khoản **khóa** bằng `is_active = FALSE`, không xóa.
- `order_items` chụp lại tên, size, màu, giá lúc mua, đổi giá sản phẩm sau này không ảnh hưởng đơn cũ.
- Ảnh và video chỉ lưu đường dẫn (`image_url`, `file_url`), file nằm ở thư mục hoặc dịch vụ lưu trữ riêng.
- Quan hệ dữ liệu tiền và kho dùng `ON DELETE RESTRICT`, dữ liệu phụ (ảnh, biến thể, dòng hàng) dùng `CASCADE`.

## Các nhóm bảng (37 bảng)

| Nhóm | Bảng |
|---|---|
| Phân quyền | `roles`, `permissions`, `role_permissions` |
| Tài khoản | `users`, `addresses`, `otp_codes` |
| Sản phẩm | `categories`, `products`, `product_variants`, `product_images` |
| Bán hàng | `coupons`, `coupon_usages`, `orders`, `order_items`, `order_status_history`, `payments` |
| Kho | `suppliers`, `goods_receipts`, `goods_receipt_items`, `goods_issues`, `goods_issue_items`, `stocktakes`, `stocktake_items`, `stock_movements` |
| Đổi / trả | `return_requests`, `return_request_items`, `return_request_media` |
| Loyalty | `loyalty_rewards`, `loyalty_transactions` |
| Tương tác | `cart_items`, `wishlist_items`, `reviews`, `review_media`, `chat_conversations`, `chat_messages` |
| Hệ thống | `system_settings`, `audit_logs` |

## Bảo mật khi đẩy lên git

Không đưa các thứ sau vào repository:

- Mật khẩu thật (`postgres`, `shop_user`), khóa API: đặt trong file `.env`, thêm `.env` vào `.gitignore`.
- File sao lưu chứa dữ liệu thật (`*.dump`, `*.backup`, `.sql` xuất từ database đang chạy).
- Thư mục ảnh người dùng tải lên (ví dụ `media/`).

Website không nên kết nối bằng tài khoản `postgres`. Cuối `01_schema.sql` có sẵn các lệnh (đang để comment) tạo user `shop_user` với quyền vừa đủ, hãy đổi mật khẩu rồi chạy riêng.
