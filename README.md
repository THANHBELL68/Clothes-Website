# Clothes-Website — Website bán quần áo

Dự án full-stack gồm 3 phần:

| Thư mục | Công nghệ | Vai trò |
|---|---|---|
| `Frontend` | React + Vite | Giao diện cho khách và quản trị |
| `Backend` | Node.js + Express 5 | REST API, xác thực JWT, xử lý nghiệp vụ |
| `Database` | PostgreSQL (SQL scripts) | 51 bảng, seed dữ liệu |

## Cấu trúc thư mục

```
CLOTHES_WEBSITE/
├── Backend/            # REST API (Node.js + Express)
│   └── src/
│       ├── config/     # Kết nối PostgreSQL (pg Pool, transaction helper)
│       ├── middleware/ # Xác thực JWT (requireAuth, requireRole)
│       └── routes/     # auth, products, cart, orders
├── Database/           # SQL scripts tạo schema + seed dữ liệu
│   ├── 01_schema.sql          # 17 enum, 51 bảng, index, trigger, view
│   ├── 02_seed_required.sql   # Vai trò, quyền (bắt buộc ở mọi môi trường)
│   └── 03_seed_demo.sql       # Dữ liệu mẫu (CHỈ cho dev, không chạy production)
└── Frontend/           # React + Vite
    └── src/            # Trang, components, services/api
```

## Yêu cầu trước khi chạy

- **Node.js 18+** và npm
- **PostgreSQL 13+** (encoding `UTF8`)
- Git

## 1. Cài đặt Database

### 1.1. Tạo database trống

```sql
CREATE DATABASE shop_db ENCODING 'UTF8';
```

(Hoặc trong pgAdmin: chuột phải **Databases → Create → Database**.)

### 1.2. Chạy các file SQL theo thứ tự

Mở terminal tại thư mục `Database`:

```bash
psql -U postgres -d shop_db -v ON_ERROR_STOP=1 -f 01_schema.sql
psql -U postgres -d shop_db -v ON_ERROR_STOP=1 -f 02_seed_required.sql
psql -U postgres -d shop_db -v ON_ERROR_STOP=1 -f 03_seed_demo.sql   # tùy chọn, chỉ dev
```

> Chi tiết schema xem [Database/README.md](Database/README.md).

## 2. Cài đặt Backend

### 2.1. Cấu hình

Sao chép file cấu hình mẫu rồi điền thông số của máy bạn:

```bash
cd Backend
cp .env.example .env
```

Nội dung `.env` (điền mật khẩu PostgreSQL vào `DB_PASSWORD`, có thể tự chọn `PORT` và `JWT_SECRET`):

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shop_db
DB_USER=shop_user
DB_PASSWORD=<mật khẩu của bạn>

PORT=3001
JWT_SECRET=<chuỗi bất kỳ, giữ bí mật>
```

> File `.env` đã nằm trong `.gitignore`, sẽ không được đưa lên Git.

### 2.2. Cài dependencies và chạy

```bash
npm install
npm run dev     # chạy chế độ dev (tự reload khi sửa code)
# hoặc
npm start       # chạy production
```

Backend chạy tại **http://localhost:3001**.

## 3. Cài đặt Frontend

```bash
cd Frontend
npm install
npm run dev     # Vite dev server
npm run build   # build production
```

Frontend chạy tại **http://localhost:5173** và gọi API tới Backend ở `http://localhost:3001`.

## 4. Chạy toàn bộ dự án (3 terminal)

| Terminal | Thư mục | Lệnh |
|---|---|---|
| 1 | `Database` | `psql ... -f 01_schema.sql` ... (chạy 1 lần khi khởi tạo) |
| 2 | `Backend` | `npm run dev` (port 3001) |
| 3 | `Frontend` | `npm run dev` (port 5173) |

## Tài khoản demo

Sau khi chạy `03_seed_demo.sql`, có sẵn tài khoản admin mẫu để thử đăng nhập qua API `POST /api/auth/login`. Xem chi tiết trong file seed.

## Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân / cách sửa |
|---|---|
| Backend báo `password authentication failed` | Sai `DB_USER`/`DB_PASSWORD` trong `Backend/.env` |
| Backend báo `database "shop_db" does not exist` | Chưa tạo database hoặc sai `DB_NAME` |
| CORS bị chặn từ frontend | Kiểm tra frontend đang chạy ở `http://localhost:5173` |
| Port đã được sử dụng (`EADDRINUSE`) | Đổi `PORT` trong `Backend/.env` |
| Bảng không tồn tại | Chưa chạy `01_schema.sql` / `02_seed_required.sql`, hoặc chạy sai thứ tự |
| Frontend không tải được dữ liệu | Đảm bảo Backend đang chạy trước, kiểm tra `BASE_URL` trong `Frontend/src/services/api` |