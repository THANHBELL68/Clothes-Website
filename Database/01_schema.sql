-- =====================================================================
-- 01_schema.sql - CAU TRUC DATABASE (enum, bang, index, trigger, view)
-- Website ban quan ao | PostgreSQL 13+
-- Theo thiet ke schema_ban_hang_thoi_trang.dbml; rieng don hang tach orders thanh 6 bang (51 bang).
--
-- Chay DAU TIEN, tren database trong (da tao rieng bang CREATE DATABASE shop_db).
-- Tiep theo chay 02_seed_required.sql, sau do (tuy chon) 03_seed_demo.sql.
--
-- Vai tro (roles.code): CUSTOMER, WAREHOUSE_MANAGER, CS_STAFF, SUPER_ADMIN.
-- Khach vang lai (GUEST) khong co tai khoan, xu ly o tang ung dung:
-- don co user_id NULL, gio hang theo session_token, chat theo guest_name/guest_contact.
--
-- Khac biet so voi DBML (chi ve kieu du lieu, khong doi ten bang/cot):
--   timestamp -> TIMESTAMPTZ, json -> JSONB, tinyint -> SMALLINT,
--   [increment] -> GENERATED ALWAYS AS IDENTITY.
--
-- Quy uoc gia: gia ban that la product_variants.price.
--   products.base_price chi la gia hien thi "tu ..." = gia thap nhat cua cac bien the dang ban
--   (trigger tu cap nhat).
--
-- File nay co BEGIN ... COMMIT: neu thieu dong COMMIT cuoi file thi bang KHONG duoc luu.
-- =====================================================================

SET client_encoding = 'UTF8';
BEGIN;

-- ---------------------------------------------------------------------
-- 1. ENUM
-- ---------------------------------------------------------------------
CREATE TYPE user_type           AS ENUM ('customer','staff');
CREATE TYPE account_status      AS ENUM ('active','locked','deleted');
CREATE TYPE otp_channel         AS ENUM ('email','sms');
CREATE TYPE discount_type       AS ENUM ('percent','fixed_amount');
CREATE TYPE order_status        AS ENUM ('new','processing','packing','shipping','completed','cancelled');
CREATE TYPE payment_method      AS ENUM ('cod','bank_qr');
CREATE TYPE payment_status      AS ENUM ('unpaid','paid','refunded','partially_refunded');
CREATE TYPE return_type         AS ENUM ('exchange','refund');
CREATE TYPE return_reason       AS ENUM ('wrong_size','defective','changed_mind','other');
CREATE TYPE return_status       AS ENUM ('pending','approved','rejected','received','completed');
CREATE TYPE refund_status       AS ENUM ('pending','processing','completed','failed');
CREATE TYPE review_status       AS ENUM ('pending','approved','hidden');
CREATE TYPE media_type          AS ENUM ('image','video');
CREATE TYPE stock_document_type AS ENUM ('import','export','return_import','exchange_export');
CREATE TYPE loyalty_tx_type     AS ENUM ('earn','redeem_order','redeem_gift','refund','adjust');
CREATE TYPE chat_status         AS ENUM ('open','closed');
CREATE TYPE sender_type         AS ENUM ('customer','staff');

-- ---------------------------------------------------------------------
-- 2. TAI KHOAN & PHAN QUYEN
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone          VARCHAR(15)  NOT NULL UNIQUE,         -- dang ky bang so dien thoai
    email          VARCHAR(255),
    password_hash  VARCHAR(255) NOT NULL,                -- luu ma BAM (bcrypt/argon2), khong luu mat khau goc
    full_name      VARCHAR(100),
    avatar_url     VARCHAR(500),
    user_type      user_type      NOT NULL DEFAULT 'customer',
    status         account_status NOT NULL DEFAULT 'active',
    loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),  -- so du, tu cap nhat tu loyalty_transactions
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_users_email ON users (lower(email));

CREATE TABLE roles (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,            -- CUSTOMER, WAREHOUSE_MANAGER, CS_STAFF, SUPER_ADMIN
    name        VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,            -- VD: PRODUCT_MANAGE, REVIEW_MODERATE
    name        VARCHAR(150) NOT NULL,
    module      VARCHAR(50),                             -- catalog, order, warehouse, cskh, system...
    description TEXT
);

CREATE TABLE role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id     BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_by BIGINT  REFERENCES users(id) ON DELETE SET NULL,   -- admin gan vai tro
    assigned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE password_reset_otps (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel    otp_channel  NOT NULL,
    otp_hash   VARCHAR(255) NOT NULL,                    -- luu ma bam cua OTP
    expires_at TIMESTAMPTZ  NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- So dia chi, moi nguoi toi da 1 dia chi mac dinh
CREATE TABLE customer_addresses (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           VARCHAR(50),                         -- Nha, Cong ty...
    recipient_name  VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(15)  NOT NULL,
    province        VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    ward            VARCHAR(100) NOT NULL,
    street_address  VARCHAR(255) NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX uq_address_default ON customer_addresses (user_id) WHERE is_default;

-- ---------------------------------------------------------------------
-- 3. DANH MUC & SAN PHAM
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,  -- danh muc cha
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(150) NOT NULL UNIQUE,
    is_active  BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    base_price  NUMERIC(15,2) NOT NULL CHECK (base_price >= 0),  -- gia "tu ...", tu dong = MIN(gia bien the dang ban)
    is_visible  BOOLEAN DEFAULT TRUE,                    -- an / hien san pham
    created_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ,
    deleted_at  TIMESTAMPTZ                              -- xoa mem
);

CREATE TABLE sizes (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       VARCHAR(20) NOT NULL UNIQUE,              -- S, M, L, XL, 38, 39...
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE colors (
    id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name     VARCHAR(50) NOT NULL UNIQUE,
    hex_code VARCHAR(7) CHECK (hex_code ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE materials (
    id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE                    -- Cotton, Linen, Kaki...
);

CREATE TABLE product_variants (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku         VARCHAR(100) NOT NULL UNIQUE,            -- vi du AT01-DEN-M
    size_id     INTEGER REFERENCES sizes(id) ON DELETE RESTRICT,
    color_id    INTEGER REFERENCES colors(id) ON DELETE RESTRICT,
    material_id INTEGER REFERENCES materials(id) ON DELETE RESTRICT,
    price       NUMERIC(15,2) NOT NULL CHECK (price >= 0),  -- GIA BAN THAT
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (product_id, size_id, color_id, material_id)
);

CREATE TABLE product_images (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,  -- anh rieng theo mau neu co
    url        VARCHAR(500) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 4. KHUYEN MAI & VOUCHER
-- ---------------------------------------------------------------------
CREATE TABLE promotions (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    discount_type  discount_type NOT NULL,
    discount_value NUMERIC(15,2) NOT NULL CHECK (discount_value > 0),
    start_at       TIMESTAMPTZ NOT NULL,
    end_at         TIMESTAMPTZ NOT NULL,
    is_active      BOOLEAN DEFAULT TRUE,
    created_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    CHECK (end_at > start_at),
    CHECK (discount_type <> 'percent' OR discount_value <= 100)
);

CREATE TABLE promotion_products (
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id   BIGINT  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, product_id)
);

CREATE TABLE vouchers (
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code                VARCHAR(50) NOT NULL UNIQUE,
    discount_type       discount_type NOT NULL,
    discount_value      NUMERIC(15,2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount NUMERIC(15,2) CHECK (max_discount_amount > 0),  -- tran giam khi giam theo %
    min_order_value     NUMERIC(15,2) DEFAULT 0 CHECK (min_order_value >= 0),
    usage_limit         INTEGER CHECK (usage_limit > 0),                -- tong luot dung, NULL = khong gioi han
    per_user_limit      INTEGER DEFAULT 1 CHECK (per_user_limit > 0),
    used_count          INTEGER DEFAULT 0 CHECK (used_count >= 0),      -- tu cap nhat tu voucher_usages
    start_at            TIMESTAMPTZ NOT NULL,
    end_at              TIMESTAMPTZ NOT NULL,
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          BIGINT REFERENCES users(id) ON DELETE SET NULL,
    CHECK (end_at > start_at),
    CHECK (discount_type <> 'percent' OR discount_value <= 100)
);

-- ---------------------------------------------------------------------
-- 5. DON HANG
-- ---------------------------------------------------------------------
CREATE TABLE shipping_carriers (
    id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code      VARCHAR(50)  NOT NULL UNIQUE,
    name      VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Don hang tach thanh 1 bang chinh + cac bang 1-1 (khoa chinh = order_id), moi bang 1 nhom thong tin:
--   orders                   : thong tin chung + trang thai
--   order_customers          : nguoi dat
--   order_shipping_addresses : dia chi giao (snapshot luc dat, sua duoc khi chua dong goi)
--   order_amounts            : tien, voucher, diem (chi sua khi don con 'new')
--   order_shipments          : van chuyen (don vi, ma van don, thoi diem giao)
--   order_cancellations      : ly do / nguoi / thoi diem huy (them dong = huy don)
-- Tao don: them orders + order_customers + order_shipping_addresses + order_amounts + order_items
-- trong CUNG giao dich; trigger kiem tra luc COMMIT la du 3 bang bat buoc.
--
-- Luong trang thai: new -> processing -> packing -> shipping -> completed
-- Khach tu huy duoc khi con 'new' hoac 'processing' (chua xuat kho). Trigger o muc 14 chan chuyen sai luong.
CREATE TABLE orders (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_code     VARCHAR(30) NOT NULL UNIQUE,          -- ma don hien thi cho khach, do ung dung sinh
    user_id        BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- NULL = don cua khach vang lai
    is_buy_now     BOOLEAN DEFAULT FALSE,                -- dat nhanh tu trang chi tiet
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    status         order_status   NOT NULL DEFAULT 'new',
    note           TEXT,
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ
);

-- Nguoi dat (bat buoc voi khach vang lai; thanh vien thi chup lai tu ho so)
CREATE TABLE order_customers (
    order_id       BIGINT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    customer_name  VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15)  NOT NULL,
    customer_email VARCHAR(255)
);

-- Snapshot dia chi giao hang tai thoi diem dat
CREATE TABLE order_shipping_addresses (
    order_id        BIGINT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    recipient_name  VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(15)  NOT NULL,
    province        VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    ward            VARCHAR(100) NOT NULL,
    street_address  VARCHAR(255) NOT NULL
);

-- Tien cua don
CREATE TABLE order_amounts (
    order_id         BIGINT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    subtotal         NUMERIC(15,2) NOT NULL CHECK (subtotal >= 0),
    voucher_id       INTEGER REFERENCES vouchers(id) ON DELETE RESTRICT,
    voucher_discount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (voucher_discount >= 0),
    points_used      INTEGER       NOT NULL DEFAULT 0 CHECK (points_used >= 0),
    points_discount  NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (points_discount >= 0),
    shipping_fee     NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    total_amount     NUMERIC(15,2) NOT NULL CHECK (total_amount >= 0),
    CHECK (total_amount = subtotal + shipping_fee - voucher_discount - points_discount),
    CHECK (voucher_id IS NOT NULL OR voucher_discount = 0)
    -- Khach vang lai khong dung diem: kiem tra bang trigger (can user_id cua orders)
);

-- Van chuyen: kho tao khi giao cho don vi van chuyen.
-- shipped_at / delivered_at do trigger gan khi don sang 'shipping' / 'completed'.
CREATE TABLE order_shipments (
    order_id            BIGINT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    shipping_carrier_id INTEGER REFERENCES shipping_carriers(id) ON DELETE RESTRICT,
    tracking_code       VARCHAR(100),
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ
);

-- Huy don: them 1 dong vao day thi trigger tu chuyen don sang 'cancelled'.
-- Khong sua / xoa duoc (lich su).
CREATE TABLE order_cancellations (
    order_id     BIGINT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
    reason       VARCHAR(255) NOT NULL,
    cancelled_by BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- NULL = khach vang lai tu huy
    cancelled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id      BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id    BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name  VARCHAR(255) NOT NULL,                 -- snapshot ten san pham
    variant_label VARCHAR(100),                          -- snapshot: Size M / Den / Cotton
    unit_price    NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    line_total    NUMERIC(15,2) NOT NULL,
    CHECK (line_total = unit_price * quantity)
);

CREATE TABLE order_status_histories (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status order_status,
    to_status   order_status NOT NULL,
    changed_by  BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- kho / admin / khach tu huy
    note        VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    method          payment_method NOT NULL,
    amount          NUMERIC(15,2)  NOT NULL CHECK (amount >= 0),
    status          payment_status NOT NULL,
    transaction_ref VARCHAR(100),                        -- ma giao dich ngan hang
    qr_content      TEXT,
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE voucher_usages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    voucher_id      INTEGER NOT NULL REFERENCES vouchers(id) ON DELETE RESTRICT,
    user_id         BIGINT REFERENCES users(id) ON DELETE RESTRICT,     -- NULL neu khach vang lai
    order_id        BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,  -- 1 voucher / don
    discount_amount NUMERIC(15,2) NOT NULL CHECK (discount_amount >= 0),
    used_at         TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. LOYALTY
-- ---------------------------------------------------------------------
CREATE TABLE loyalty_rewards (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    stock           INTEGER DEFAULT 0 CHECK (stock >= 0),
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE reward_redemptions (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      BIGINT  NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reward_id    INTEGER NOT NULL REFERENCES loyalty_rewards(id) ON DELETE RESTRICT,
    points_spent INTEGER NOT NULL CHECK (points_spent > 0),  -- trigger tu lay theo points_required
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- So cai diem: chi them dong, khong sua, khong xoa
CREATE TABLE loyalty_transactions (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type          loyalty_tx_type NOT NULL,
    points        INTEGER NOT NULL CHECK (points <> 0),  -- duong = cong, am = tru
    order_id      BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
    redemption_id BIGINT REFERENCES reward_redemptions(id) ON DELETE RESTRICT,
    note          VARCHAR(255),
    created_at    TIMESTAMPTZ DEFAULT now(),
    CHECK (type NOT IN ('earn','refund') OR points > 0),
    CHECK (type NOT IN ('redeem_order','redeem_gift') OR points < 0),
    CHECK (type <> 'redeem_gift' OR redemption_id IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 7. GIO HANG & WISHLIST
-- ---------------------------------------------------------------------
CREATE TABLE carts (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,  -- thanh vien: 1 gio / nguoi
    session_token VARCHAR(255) UNIQUE,                                    -- gio hang cua khach vang lai
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ,
    expires_at    TIMESTAMPTZ,   -- chi gio khach vang lai: tu gia han moi lan thay doi (cart.guest_ttl_days)
    CHECK (user_id IS NOT NULL OR session_token IS NOT NULL)
);
CREATE INDEX idx_carts_guest_expiry ON carts (expires_at) WHERE user_id IS NULL;

CREATE TABLE cart_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (cart_id, variant_id)
);

CREATE TABLE wishlists (
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,  -- dung size / mau / chat lieu
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, variant_id)
);

-- ---------------------------------------------------------------------
-- 8. DOI TRA & HOAN TIEN
-- ---------------------------------------------------------------------
-- Luong: pending -> approved | rejected ; approved -> received ; received -> completed
CREATE TABLE return_requests (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_code  VARCHAR(30) NOT NULL UNIQUE,
    order_id      BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id       BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- NULL = don cua khach vang lai
    type          return_type   NOT NULL,
    reason        return_reason NOT NULL,
    description   TEXT,
    status        return_status NOT NULL DEFAULT 'pending',

    reviewed_by   BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- CSKH / Admin duyet
    reviewed_at   TIMESTAMPTZ,
    reject_reason VARCHAR(255),

    received_by   BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- quan ly kho xac nhan nhan hang
    received_at   TIMESTAMPTZ,

    created_at    TIMESTAMPTZ DEFAULT now(),
    CHECK (status <> 'rejected' OR reject_reason IS NOT NULL)
);

CREATE TABLE return_request_items (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    return_request_id   BIGINT NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    order_item_id       BIGINT NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    exchange_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,  -- bien the moi neu doi hang
    condition_note      VARCHAR(255),                    -- tinh trang hang khi kho kiem tra
    is_restocked        BOOLEAN DEFAULT FALSE            -- TRUE khi da nhap lai kho (phieu return_import)
);

CREATE TABLE return_request_media (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    return_request_id BIGINT NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    media_type        media_type   NOT NULL,
    url               VARCHAR(500) NOT NULL
);

CREATE TABLE refunds (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    return_request_id BIGINT REFERENCES return_requests(id) ON DELETE RESTRICT,
    order_id          BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount            NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    status            refund_status NOT NULL DEFAULT 'pending',
    bank_name         VARCHAR(100),
    bank_account_no   VARCHAR(50),
    bank_account_name VARCHAR(100),
    processed_by      BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 9. DANH GIA
-- ---------------------------------------------------------------------
-- Chi danh gia san pham da mua, 1 lan / dong don; cho CSKH duyet truoc khi hien cong khai
CREATE TABLE reviews (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_item_id BIGINT NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE RESTRICT,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content       TEXT,
    status        review_status NOT NULL DEFAULT 'pending',
    moderated_by  BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    moderated_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE review_media (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id  BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    media_type media_type   NOT NULL,
    url        VARCHAR(500) NOT NULL
);

-- ---------------------------------------------------------------------
-- 10. KHO
-- ---------------------------------------------------------------------
-- Kho trung tam: 1 dong / bien the, tu tao khi them bien the,
-- quantity_on_hand tu cap nhat tu phieu kho va kiem ke (khong sua tay).
CREATE TABLE inventories (
    variant_id        BIGINT PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_on_hand  INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),  -- da giu cho don chua xuat kho
    updated_at        TIMESTAMPTZ
);

CREATE TABLE suppliers (
    id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    phone   VARCHAR(15),
    email   VARCHAR(255),
    address VARCHAR(255)
);

-- Phieu nhap / xuat kho:
--   import          : nhap tu nha cung cap (supplier_id)
--   export          : xuat giao don vi van chuyen (order_id, shipping_carrier_id)
--   return_import   : nhap lai hang khach tra (return_request_id)
--   exchange_export : xuat hang doi moi cho khach (return_request_id)
CREATE TABLE stock_documents (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code                VARCHAR(30) NOT NULL UNIQUE,     -- ma phieu nhap / xuat
    type                stock_document_type NOT NULL,
    supplier_id         INTEGER REFERENCES suppliers(id) ON DELETE RESTRICT,
    order_id            BIGINT  REFERENCES orders(id) ON DELETE RESTRICT,
    shipping_carrier_id INTEGER REFERENCES shipping_carriers(id) ON DELETE RESTRICT,
    return_request_id   BIGINT  REFERENCES return_requests(id) ON DELETE RESTRICT,
    created_by          BIGINT  NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note                TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    CHECK (type = 'import' OR supplier_id IS NULL),
    CHECK (type = 'export' OR (order_id IS NULL AND shipping_carrier_id IS NULL)),
    CHECK ((type IN ('return_import','exchange_export')) = (return_request_id IS NOT NULL))
);

CREATE TABLE stock_document_items (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stock_document_id BIGINT NOT NULL REFERENCES stock_documents(id) ON DELETE RESTRICT,
    variant_id        BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity          INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost         NUMERIC(15,2) CHECK (unit_cost >= 0)
);

-- Kiem ke: nhap so dem thuc te, trigger tu lay ton he thong, tinh chenh lech va cap nhat ton kho
CREATE TABLE stocktakes (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code       VARCHAR(30) NOT NULL UNIQUE,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note       TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stocktake_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stocktake_id    BIGINT NOT NULL REFERENCES stocktakes(id) ON DELETE RESTRICT,
    variant_id      BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    system_quantity INTEGER NOT NULL DEFAULT 0,          -- trigger tu dien
    actual_quantity INTEGER NOT NULL CHECK (actual_quantity >= 0),
    difference      INTEGER NOT NULL DEFAULT 0,          -- trigger tu tinh = actual - system
    UNIQUE (stocktake_id, variant_id)
);

-- ---------------------------------------------------------------------
-- 11. LIVE CHAT
-- ---------------------------------------------------------------------
CREATE TABLE chat_conversations (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id       BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- NULL neu khach vang lai
    guest_name        VARCHAR(100),
    guest_contact     VARCHAR(255),
    assigned_staff_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    status            chat_status NOT NULL DEFAULT 'open',
    created_at        TIMESTAMPTZ DEFAULT now(),
    closed_at         TIMESTAMPTZ,
    CHECK (customer_id IS NOT NULL OR guest_contact IS NOT NULL)
);
CREATE UNIQUE INDEX uq_chat_open ON chat_conversations (customer_id)
    WHERE status = 'open' AND customer_id IS NOT NULL;

CREATE TABLE chat_messages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type     sender_type NOT NULL,
    sender_id       BIGINT REFERENCES users(id) ON DELETE RESTRICT,  -- NULL khi khach vang lai gui
    content         TEXT,
    attachment_url  VARCHAR(500),
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    CHECK (content IS NOT NULL OR attachment_url IS NOT NULL),
    CHECK (sender_type <> 'staff' OR sender_id IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 12. HE THONG, LOG & MARKETING
-- ---------------------------------------------------------------------
CREATE TABLE system_settings (
    key        VARCHAR(100) PRIMARY KEY,
    value      TEXT,
    group_name VARCHAR(50),                              -- payment, shipping, general
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ
);

-- Nhat ky hoat dong: chi them dong, khong sua, khong xoa
CREATE TABLE activity_logs (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    action      VARCHAR(100) NOT NULL,                   -- CREATE, UPDATE, DELETE, LOGIN...
    entity_type VARCHAR(50),                             -- products, orders, stock_documents...
    entity_id   BIGINT,
    old_values  JSONB,
    new_values  JSONB,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Giai doan 2
CREATE TABLE marketing_campaigns (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    channel     VARCHAR(50),                             -- email, sms, push
    voucher_id  INTEGER REFERENCES vouchers(id) ON DELETE SET NULL,
    start_at    TIMESTAMPTZ,
    end_at      TIMESTAMPTZ,
    is_active   BOOLEAN DEFAULT TRUE,
    created_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    CHECK (end_at IS NULL OR start_at IS NULL OR end_at > start_at)
);

-- ---------------------------------------------------------------------
-- 13. INDEX
-- ---------------------------------------------------------------------
CREATE INDEX idx_user_roles_role       ON user_roles(role_id);
CREATE INDEX idx_otps_user             ON password_reset_otps(user_id, created_at DESC);
CREATE INDEX idx_addresses_user        ON customer_addresses(user_id);
CREATE INDEX idx_categories_parent     ON categories(parent_id);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_visible      ON products(category_id) WHERE is_visible AND deleted_at IS NULL;
CREATE INDEX idx_variants_product      ON product_variants(product_id);
CREATE INDEX idx_images_product        ON product_images(product_id);
CREATE INDEX idx_promo_products_prod   ON promotion_products(product_id);
CREATE INDEX idx_voucher_usages_user   ON voucher_usages(voucher_id, user_id);
CREATE INDEX idx_orders_user           ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status         ON orders(status, created_at DESC);
CREATE INDEX idx_order_customers_phone ON order_customers(customer_phone);   -- tra cuu don khach vang lai
CREATE INDEX idx_order_amounts_voucher ON order_amounts(voucher_id) WHERE voucher_id IS NOT NULL;
CREATE INDEX idx_order_shipments_track ON order_shipments(tracking_code) WHERE tracking_code IS NOT NULL;
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_variant   ON order_items(variant_id);
CREATE INDEX idx_order_history_order   ON order_status_histories(order_id, created_at);
CREATE INDEX idx_payments_order        ON payments(order_id);
CREATE INDEX idx_loyalty_user          ON loyalty_transactions(user_id, created_at DESC);
-- Moi don chi duoc tich diem 1 lan va tru diem 1 lan
CREATE UNIQUE INDEX uq_loyalty_earn_order   ON loyalty_transactions(order_id) WHERE type = 'earn';
CREATE UNIQUE INDEX uq_loyalty_redeem_order ON loyalty_transactions(order_id) WHERE type = 'redeem_order';
CREATE INDEX idx_redemptions_user      ON reward_redemptions(user_id);
CREATE INDEX idx_cart_items_cart       ON cart_items(cart_id);
CREATE INDEX idx_wishlists_variant     ON wishlists(variant_id);
CREATE INDEX idx_returns_order         ON return_requests(order_id);
CREATE INDEX idx_returns_status        ON return_requests(status, created_at DESC);
CREATE INDEX idx_return_items_request  ON return_request_items(return_request_id);
CREATE INDEX idx_return_items_oi       ON return_request_items(order_item_id);
CREATE INDEX idx_refunds_order         ON refunds(order_id);
CREATE INDEX idx_reviews_product       ON reviews(product_id, status);
CREATE INDEX idx_reviews_status        ON reviews(status, created_at DESC);
CREATE INDEX idx_stock_docs_order      ON stock_documents(order_id);
CREATE INDEX idx_stock_docs_return     ON stock_documents(return_request_id);
CREATE INDEX idx_stock_doc_items_doc   ON stock_document_items(stock_document_id);
CREATE INDEX idx_stock_doc_items_var   ON stock_document_items(variant_id);
CREATE INDEX idx_stocktake_items_st    ON stocktake_items(stocktake_id);
CREATE INDEX idx_chat_customer         ON chat_conversations(customer_id);
CREATE INDEX idx_chat_staff            ON chat_conversations(assigned_staff_id, status);
CREATE INDEX idx_chat_msgs             ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_activity_user_time    ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_entity       ON activity_logs(entity_type, entity_id);

-- ---------------------------------------------------------------------
-- 14. HAM VA TRIGGER
-- ---------------------------------------------------------------------

-- Ung dung gan "app.user_id" truoc khi thao tac de database biet ai lam:
--   SET LOCAL app.user_id = '5';    (trong cung transaction)
CREATE FUNCTION app_user_id() RETURNS BIGINT AS $$
    SELECT NULLIF(current_setting('app.user_id', true), '')::BIGINT;
$$ LANGUAGE sql STABLE;

-- 14.1 Tu cap nhat updated_at
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated       BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated    BEFORE UPDATE ON products        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated      BEFORE UPDATE ON orders          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inventories_updated BEFORE UPDATE ON inventories     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_settings_updated    BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 14.1b Tai khoan va vai tro
--   - Tai khoan customer tu duoc gan vai tro CUSTOMER khi dang ky.
--   - Vai tro CUSTOMER chi cho tai khoan customer; cac vai tro nhan vien chi cho tai khoan staff.
--   - Luon con it nhat 1 SUPER_ADMIN dang hoat dong (khong go vai tro / khoa / xoa admin cuoi cung).
CREATE FUNCTION is_last_active_admin(p_user_id BIGINT) RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
                   WHERE ur.user_id = p_user_id AND r.code = 'SUPER_ADMIN')
       AND NOT EXISTS (SELECT 1 FROM user_roles ur
                       JOIN roles r ON r.id = ur.role_id
                       JOIN users u ON u.id = ur.user_id
                       WHERE r.code = 'SUPER_ADMIN' AND ur.user_id <> p_user_id AND u.status = 'active');
$$ LANGUAGE sql STABLE;

CREATE FUNCTION assign_default_role() RETURNS trigger AS $$
BEGIN
    IF NEW.user_type = 'customer' THEN
        INSERT INTO user_roles (user_id, role_id)
        SELECT NEW.id, id FROM roles WHERE code = 'CUSTOMER';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_default_role
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION assign_default_role();

CREATE FUNCTION check_user_change() RETURNS trigger AS $$
BEGIN
    IF NEW.user_type <> OLD.user_type AND EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = NEW.id AND (r.code = 'CUSTOMER') <> (NEW.user_type = 'customer')
    ) THEN
        RAISE EXCEPTION 'Go cac vai tro khong phu hop truoc khi doi loai tai khoan.';
    END IF;
    IF OLD.status = 'active' AND NEW.status <> 'active' AND is_last_active_admin(NEW.id) THEN
        RAISE EXCEPTION 'Khong the khoa / xoa SUPER_ADMIN cuoi cung.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_change_check
BEFORE UPDATE OF user_type, status ON users
FOR EACH ROW EXECUTE FUNCTION check_user_change();

CREATE FUNCTION check_user_role() RETURNS trigger AS $$
DECLARE
    u_type user_type;
    r_code VARCHAR(50);
BEGIN
    IF TG_OP <> 'INSERT' THEN
        IF (TG_OP = 'DELETE' OR NEW.role_id <> OLD.role_id OR NEW.user_id <> OLD.user_id)
           AND (SELECT code FROM roles WHERE id = OLD.role_id) = 'SUPER_ADMIN'
           AND NOT EXISTS (SELECT 1 FROM user_roles ur JOIN users u ON u.id = ur.user_id
                           WHERE ur.role_id = OLD.role_id AND ur.user_id <> OLD.user_id
                             AND u.status = 'active') THEN
            RAISE EXCEPTION 'Khong the go vai tro SUPER_ADMIN cua admin cuoi cung.';
        END IF;
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
    END IF;
    SELECT user_type INTO u_type FROM users WHERE id = NEW.user_id;
    SELECT code INTO r_code FROM roles WHERE id = NEW.role_id;
    IF (r_code = 'CUSTOMER') <> (u_type = 'customer') THEN
        RAISE EXCEPTION 'Vai tro % khong danh cho tai khoan loai %.', r_code, u_type;
    END IF;
    NEW.assigned_by := COALESCE(NEW.assigned_by, app_user_id());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_role_check
BEFORE INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION check_user_role();

-- Them quyen moi -> tu gan cho SUPER_ADMIN (admin luon toan quyen, ke ca xem moi don hang).
-- Khong go duoc quyen cua SUPER_ADMIN.
CREATE FUNCTION grant_permission_to_admin() RETURNS trigger AS $$
BEGIN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT id, NEW.id FROM roles WHERE code = 'SUPER_ADMIN'
    ON CONFLICT DO NOTHING;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_permission_grant_admin
AFTER INSERT ON permissions
FOR EACH ROW EXECUTE FUNCTION grant_permission_to_admin();

CREATE FUNCTION protect_admin_permissions() RETURNS trigger AS $$
BEGIN
    IF (SELECT code FROM roles WHERE id = OLD.role_id) = 'SUPER_ADMIN'
       AND EXISTS (SELECT 1 FROM permissions WHERE id = OLD.permission_id) THEN
        RAISE EXCEPTION 'Khong duoc go quyen cua SUPER_ADMIN.';
    END IF;
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_permissions_protect
BEFORE UPDATE OR DELETE ON role_permissions
FOR EACH ROW EXECUTE FUNCTION protect_admin_permissions();

-- 14.1c Gio hang: gio khach vang lai het han sau 'cart.guest_ttl_days' ngay (mac dinh 30)
--       ke tu lan thay doi cuoi; gio thanh vien khong het han.
CREATE FUNCTION set_cart_expiry() RETURNS trigger AS $$
DECLARE
    ttl INTEGER;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at := now();
    END IF;
    IF NEW.user_id IS NULL THEN
        SELECT NULLIF(value, '')::INTEGER INTO ttl FROM system_settings WHERE key = 'cart.guest_ttl_days';
        NEW.expires_at := now() + make_interval(days => COALESCE(ttl, 30));
    ELSE
        NEW.expires_at := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cart_expiry
BEFORE INSERT OR UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION set_cart_expiry();

-- Them / sua san pham trong gio -> gia han gio
CREATE FUNCTION touch_cart() RETURNS trigger AS $$
BEGIN
    UPDATE carts SET updated_at = now() WHERE id = NEW.cart_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cart_items_touch
AFTER INSERT OR UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION touch_cart();

-- Xoa gio khach vang lai da het han. Chay dinh ky (cron / job cua ung dung):
--   SELECT cleanup_expired_guest_carts();
CREATE FUNCTION cleanup_expired_guest_carts() RETURNS INTEGER AS $$
DECLARE
    n INTEGER;
BEGIN
    DELETE FROM carts WHERE user_id IS NULL AND expires_at < now();
    GET DIAGNOSTICS n = ROW_COUNT;
    RETURN n;
END;
$$ LANGUAGE plpgsql;

-- Khach vang lai dang nhap / dang ky: gop gio theo session_token vao gio cua tai khoan.
--   SELECT merge_guest_cart('session-token', 5);   -- tra ve id gio cua tai khoan
CREATE FUNCTION merge_guest_cart(p_session_token VARCHAR, p_user_id BIGINT) RETURNS BIGINT AS $$
DECLARE
    guest_id  BIGINT;
    member_id BIGINT;
BEGIN
    SELECT id INTO guest_id FROM carts
    WHERE session_token = p_session_token AND user_id IS NULL AND expires_at > now()
    FOR UPDATE;
    INSERT INTO carts (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
    SELECT id INTO member_id FROM carts WHERE user_id = p_user_id;
    IF guest_id IS NOT NULL THEN
        INSERT INTO cart_items (cart_id, variant_id, quantity)
        SELECT member_id, variant_id, quantity FROM cart_items WHERE cart_id = guest_id
        ON CONFLICT (cart_id, variant_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;
    END IF;
    DELETE FROM carts WHERE session_token = p_session_token AND user_id IS NULL;
    RETURN member_id;
END;
$$ LANGUAGE plpgsql;

-- 14.1d Gia "tu ..." cua san pham = gia thap nhat cua cac bien the dang ban
CREATE FUNCTION refresh_base_price(p_product_id BIGINT) RETURNS void AS $$
    UPDATE products p SET base_price = m.min_price
    FROM (SELECT MIN(price) AS min_price FROM product_variants
          WHERE product_id = p_product_id AND is_active) m
    WHERE p.id = p_product_id AND m.min_price IS NOT NULL AND p.base_price <> m.min_price;
$$ LANGUAGE sql;

CREATE FUNCTION sync_product_base_price() RETURNS trigger AS $$
BEGIN
    IF TG_OP <> 'INSERT' THEN
        PERFORM refresh_base_price(OLD.product_id);
    END IF;
    IF TG_OP <> 'DELETE' AND (TG_OP = 'INSERT' OR NEW.product_id <> OLD.product_id
                              OR NEW.price <> OLD.price OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
        PERFORM refresh_base_price(NEW.product_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_variant_base_price
AFTER INSERT OR UPDATE OF price, is_active, product_id OR DELETE ON product_variants
FOR EACH ROW EXECUTE FUNCTION sync_product_base_price();

-- 14.2 Them bien the -> tu tao dong ton kho = 0
CREATE FUNCTION create_inventory_row() RETURNS trigger AS $$
BEGIN
    INSERT INTO inventories (variant_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_variant_inventory
AFTER INSERT ON product_variants
FOR EACH ROW EXECUTE FUNCTION create_inventory_row();

-- 14.3 Phieu kho: kiem tra lien ket voi don / yeu cau doi tra
--      export gan don       : don phai dang 'packing'
--      return_import        : yeu cau doi/tra phai o 'received'
--      exchange_export      : yeu cau phai la doi hang, o 'received'
CREATE FUNCTION check_stock_document() RETURNS trigger AS $$
DECLARE
    o_status order_status;
    r_status return_status;
    r_type   return_type;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.type <> OLD.type
           OR NEW.order_id IS DISTINCT FROM OLD.order_id
           OR NEW.return_request_id IS DISTINCT FROM OLD.return_request_id THEN
            RAISE EXCEPTION 'Khong duoc doi loai phieu, don hang hoac yeu cau doi/tra cua phieu kho.';
        END IF;
        RETURN NEW;
    END IF;
    IF NEW.type = 'export' AND NEW.order_id IS NOT NULL THEN
        SELECT status INTO o_status FROM orders WHERE id = NEW.order_id;
        IF o_status <> 'packing' THEN
            RAISE EXCEPTION 'Chi tao phieu xuat cho don dang dong goi (don dang o "%").', o_status;
        END IF;
    ELSIF NEW.type IN ('return_import','exchange_export') THEN
        SELECT status, type INTO r_status, r_type FROM return_requests WHERE id = NEW.return_request_id;
        IF r_status <> 'received' THEN
            RAISE EXCEPTION 'Chi tao phieu doi/tra khi kho da nhan hang (yeu cau dang o "%").', r_status;
        END IF;
        IF NEW.type = 'exchange_export' AND r_type <> 'exchange' THEN
            RAISE EXCEPTION 'Yeu cau hoan tien khong co phieu xuat doi hang.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_document_check
BEFORE INSERT OR UPDATE ON stock_documents
FOR EACH ROW EXECUTE FUNCTION check_stock_document();

-- 14.4 Dong phieu kho: kiem tra so luong theo don / yeu cau doi tra
CREATE FUNCTION check_stock_document_item() RETURNS trigger AS $$
DECLARE
    d       stock_documents%ROWTYPE;
    o_stat  order_status;
    can_co  INTEGER;
    da_co   INTEGER;
BEGIN
    SELECT * INTO d FROM stock_documents WHERE id = NEW.stock_document_id;

    IF d.type = 'export' AND d.order_id IS NOT NULL THEN
        -- Khoa don: cac phieu xuat dong thoi cho cung don chay lan luot
        SELECT status INTO o_stat FROM orders WHERE id = d.order_id FOR UPDATE;
        IF o_stat <> 'packing' THEN
            RAISE EXCEPTION 'Chi xuat kho cho don dang dong goi (don dang o "%").', o_stat;
        END IF;
        SELECT SUM(quantity) INTO can_co FROM order_items
        WHERE order_id = d.order_id AND variant_id = NEW.variant_id;
        SELECT COALESCE(SUM(i.quantity), 0) INTO da_co
        FROM stock_document_items i JOIN stock_documents s ON s.id = i.stock_document_id
        WHERE s.type = 'export' AND s.order_id = d.order_id AND i.variant_id = NEW.variant_id;

    ELSIF d.type = 'return_import' THEN
        PERFORM 1 FROM return_requests WHERE id = d.return_request_id FOR UPDATE;
        SELECT SUM(ri.quantity) INTO can_co
        FROM return_request_items ri JOIN order_items oi ON oi.id = ri.order_item_id
        WHERE ri.return_request_id = d.return_request_id AND oi.variant_id = NEW.variant_id;
        SELECT COALESCE(SUM(i.quantity), 0) INTO da_co
        FROM stock_document_items i JOIN stock_documents s ON s.id = i.stock_document_id
        WHERE s.type = 'return_import' AND s.return_request_id = d.return_request_id
          AND i.variant_id = NEW.variant_id;

    ELSIF d.type = 'exchange_export' THEN
        PERFORM 1 FROM return_requests WHERE id = d.return_request_id FOR UPDATE;
        SELECT SUM(quantity) INTO can_co
        FROM return_request_items
        WHERE return_request_id = d.return_request_id AND exchange_variant_id = NEW.variant_id;
        SELECT COALESCE(SUM(i.quantity), 0) INTO da_co
        FROM stock_document_items i JOIN stock_documents s ON s.id = i.stock_document_id
        WHERE s.type = 'exchange_export' AND s.return_request_id = d.return_request_id
          AND i.variant_id = NEW.variant_id;

    ELSE
        RETURN NEW;   -- nhap NCC, xuat khong gan don: khong gioi han
    END IF;

    IF can_co IS NULL THEN
        RAISE EXCEPTION 'Bien the % khong co trong don / yeu cau doi tra cua phieu.', NEW.variant_id;
    END IF;
    IF da_co + NEW.quantity > can_co THEN
        RAISE EXCEPTION 'So luong tren phieu (%) vuot so luong cho phep (%).', da_co + NEW.quantity, can_co;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_document_item_check
BEFORE INSERT ON stock_document_items
FOR EACH ROW EXECUTE FUNCTION check_stock_document_item();

-- 14.5 Dong phieu kho -> cap nhat ton kho
--      Nhap (+), xuat (-). Ton am thi CHECK (quantity_on_hand >= 0) chan va huy giao dich.
--      Xuat theo don: lay tu hang da giu cho don, giam ca quantity_reserved.
--      Xuat khong gan don / xuat doi hang: chi duoc lay phan con trong (khong dung hang da giu cho don khac).
CREATE FUNCTION apply_stock_document_item() RETURNS trigger AS $$
DECLARE
    d_type  stock_document_type;
    d_order BIGINT;
    con     INTEGER;
BEGIN
    SELECT type, order_id INTO d_type, d_order FROM stock_documents WHERE id = NEW.stock_document_id;
    IF d_type IN ('import','return_import') THEN
        UPDATE inventories SET quantity_on_hand = quantity_on_hand + NEW.quantity
        WHERE variant_id = NEW.variant_id;
    ELSIF d_order IS NOT NULL THEN
        UPDATE inventories
        SET quantity_on_hand  = quantity_on_hand - NEW.quantity,
            quantity_reserved = GREATEST(quantity_reserved - NEW.quantity, 0)
        WHERE variant_id = NEW.variant_id;
    ELSE
        UPDATE inventories SET quantity_on_hand = quantity_on_hand - NEW.quantity
        WHERE variant_id = NEW.variant_id
          AND quantity_on_hand - quantity_reserved >= NEW.quantity;
        IF NOT FOUND THEN
            SELECT quantity_on_hand - quantity_reserved INTO con FROM inventories WHERE variant_id = NEW.variant_id;
            RAISE EXCEPTION 'Bien the % chi con % san pham chua giu cho don, khong du de xuat %.',
                NEW.variant_id, con, NEW.quantity;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_document_item_apply
AFTER INSERT ON stock_document_items
FOR EACH ROW EXECUTE FUNCTION apply_stock_document_item();

-- 14.6 Kiem ke: lay ton he thong, tinh chenh lech, dat ton = so dem thuc te
CREATE FUNCTION apply_stocktake_item() RETURNS trigger AS $$
DECLARE
    cur INTEGER;
BEGIN
    SELECT quantity_on_hand INTO cur FROM inventories WHERE variant_id = NEW.variant_id FOR UPDATE;
    NEW.system_quantity := cur;
    NEW.difference      := NEW.actual_quantity - cur;
    IF NEW.difference <> 0 THEN
        UPDATE inventories SET quantity_on_hand = NEW.actual_quantity WHERE variant_id = NEW.variant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stocktake_item_apply
BEFORE INSERT ON stocktake_items
FOR EACH ROW EXECUTE FUNCTION apply_stocktake_item();

-- 14.7 So cai diem -> cap nhat users.loyalty_points (CHECK >= 0 chan tieu qua so diem co)
CREATE FUNCTION apply_loyalty() RETURNS trigger AS $$
BEGIN
    UPDATE users SET loyalty_points = loyalty_points + NEW.points WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loyalty_apply
AFTER INSERT ON loyalty_transactions
FOR EACH ROW EXECUTE FUNCTION apply_loyalty();

-- 14.8 Doi qua: lay so diem theo qua, tru ton qua, ghi so cai diem (redeem_gift)
CREATE FUNCTION before_reward_redemption() RETURNS trigger AS $$
DECLARE
    rw loyalty_rewards%ROWTYPE;
BEGIN
    SELECT * INTO rw FROM loyalty_rewards WHERE id = NEW.reward_id FOR UPDATE;
    IF NOT rw.is_active THEN
        RAISE EXCEPTION 'Qua "%" dang ngung doi.', rw.name;
    END IF;
    NEW.points_spent := rw.points_required;
    UPDATE loyalty_rewards SET stock = stock - 1 WHERE id = NEW.reward_id;  -- CHECK stock >= 0 chan het qua
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_redemption_before
BEFORE INSERT ON reward_redemptions
FOR EACH ROW EXECUTE FUNCTION before_reward_redemption();

CREATE FUNCTION after_reward_redemption() RETURNS trigger AS $$
BEGIN
    INSERT INTO loyalty_transactions (user_id, type, points, redemption_id, note)
    VALUES (NEW.user_id, 'redeem_gift', -NEW.points_spent, NEW.id, 'Doi qua');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_redemption_after
AFTER INSERT ON reward_redemptions
FOR EACH ROW EXECUTE FUNCTION after_reward_redemption();

-- 14.9 Dung voucher: dung voucher cua don, con hieu luc, chua het luot,
--      chua vuot luot / nguoi (khach vang lai dem theo so dien thoai dat hang); tang used_count
--      Can them order_amounts (va order_customers) cua don TRUOC voucher_usages trong giao dich tao don.
CREATE FUNCTION apply_voucher_usage() RETURNS trigger AS $$
DECLARE
    v       vouchers%ROWTYPE;
    a       order_amounts%ROWTYPE;
    o_user  BIGINT;
    o_phone VARCHAR(15);
    da_dung INTEGER;
BEGIN
    SELECT * INTO v FROM vouchers WHERE id = NEW.voucher_id FOR UPDATE;
    SELECT user_id INTO o_user FROM orders WHERE id = NEW.order_id;
    SELECT * INTO a FROM order_amounts WHERE order_id = NEW.order_id;
    SELECT customer_phone INTO o_phone FROM order_customers WHERE order_id = NEW.order_id;
    IF a.order_id IS NULL THEN
        RAISE EXCEPTION 'Them order_amounts cua don truoc khi ghi voucher_usages.';
    END IF;
    IF a.voucher_id IS DISTINCT FROM NEW.voucher_id THEN
        RAISE EXCEPTION 'Voucher khong khop voi voucher cua don hang.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM o_user THEN
        RAISE EXCEPTION 'Nguoi dung voucher khong phai chu don hang.';
    END IF;
    IF NOT v.is_active OR now() NOT BETWEEN v.start_at AND v.end_at THEN
        RAISE EXCEPTION 'Voucher % khong con hieu luc.', v.code;
    END IF;
    IF a.subtotal < COALESCE(v.min_order_value, 0) THEN
        RAISE EXCEPTION 'Don chua dat gia tri toi thieu de dung voucher %.', v.code;
    END IF;
    IF v.usage_limit IS NOT NULL AND COALESCE(v.used_count, 0) >= v.usage_limit THEN
        RAISE EXCEPTION 'Voucher % da het luot su dung.', v.code;
    END IF;
    SELECT count(*) INTO da_dung
    FROM voucher_usages u
    JOIN orders uo               ON uo.id = u.order_id
    LEFT JOIN order_customers uc ON uc.order_id = u.order_id
    WHERE u.voucher_id = NEW.voucher_id
      AND uo.status <> 'cancelled'
      AND CASE WHEN NEW.user_id IS NOT NULL THEN u.user_id = NEW.user_id
               ELSE u.user_id IS NULL AND uc.customer_phone = o_phone END;
    IF da_dung >= COALESCE(v.per_user_limit, 1) THEN
        RAISE EXCEPTION 'Ban da dung het luot cua voucher %.', v.code;
    END IF;
    UPDATE vouchers SET used_count = COALESCE(used_count, 0) + 1 WHERE id = NEW.voucher_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_voucher_usage
BEFORE INSERT ON voucher_usages
FOR EACH ROW EXECUTE FUNCTION apply_voucher_usage();

-- 14.10 Chan chuyen trang thai don sai luong + ghi lich su
--      new -> processing -> packing -> shipping -> completed ; huy chi tu new/processing
--      Sang 'shipping' phai co phieu xuat kho du so luong tung bien the trong don.
--      Sang 'cancelled' phai co dong order_cancellations (ung dung chi can them dong do).
CREATE FUNCTION enforce_order_status() RETURNS trigger AS $$
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;
    IF NOT (
           (OLD.status = 'new'        AND NEW.status IN ('processing','cancelled'))
        OR (OLD.status = 'processing' AND NEW.status IN ('packing','cancelled'))
        OR (OLD.status = 'packing'    AND NEW.status = 'shipping')
        OR (OLD.status = 'shipping'   AND NEW.status = 'completed')
    ) THEN
        RAISE EXCEPTION 'Khong the chuyen don hang tu "%" sang "%".', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'shipping' AND EXISTS (
        SELECT 1
        FROM (SELECT variant_id, SUM(quantity) AS qty
              FROM order_items WHERE order_id = NEW.id GROUP BY variant_id) o
        LEFT JOIN (SELECT i.variant_id, SUM(i.quantity) AS qty
                   FROM stock_document_items i
                   JOIN stock_documents s ON s.id = i.stock_document_id
                   WHERE s.type = 'export' AND s.order_id = NEW.id
                   GROUP BY i.variant_id) x
               ON x.variant_id = o.variant_id
        WHERE COALESCE(x.qty, 0) <> o.qty
    ) THEN
        RAISE EXCEPTION 'Don % chua xuat kho du hang, chua the chuyen sang giao hang.', NEW.order_code;
    END IF;
    IF NEW.status = 'cancelled'
       AND NOT EXISTS (SELECT 1 FROM order_cancellations WHERE order_id = NEW.id) THEN
        RAISE EXCEPTION 'Huy don bang cach them dong vao order_cancellations (kem ly do).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_flow
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION enforce_order_status();

-- Don moi luon bat dau o 'new' (khong insert thang don 'completed' de lach han doi/tra)
CREATE FUNCTION check_order_insert() RETURNS trigger AS $$
BEGIN
    IF NEW.status <> 'new' THEN
        RAISE EXCEPTION 'Don hang moi phai o trang thai new.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_insert
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION check_order_insert();

-- Luc COMMIT: don moi phai co du nguoi dat, dia chi giao va tien (cac bang tach ra tu orders)
CREATE FUNCTION check_order_complete() RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM orders WHERE id = NEW.id) THEN
        RETURN NULL;   -- don da bi xoa trong cung giao dich
    END IF;
    IF NOT EXISTS (SELECT 1 FROM order_customers WHERE order_id = NEW.id) THEN
        RAISE EXCEPTION 'Don % thieu thong tin nguoi dat (order_customers).', NEW.order_code;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM order_shipping_addresses WHERE order_id = NEW.id) THEN
        RAISE EXCEPTION 'Don % thieu dia chi giao hang (order_shipping_addresses).', NEW.order_code;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM order_amounts WHERE order_id = NEW.id) THEN
        RAISE EXCEPTION 'Don % thieu thong tin tien (order_amounts).', NEW.order_code;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_order_complete
AFTER INSERT ON orders
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION check_order_complete();

-- Cac bang chi tiet cua don (order_customers, order_shipping_addresses, order_amounts):
--   TG_ARGV[0] = cac trang thai don duoc phep them / sua (phan cach bang dau phay).
--   Khong xoa rieng duoc (chi xoa theo CASCADE), khong chuyen sang don khac.
--   order_amounts: khach vang lai khong dung diem.
CREATE FUNCTION check_order_detail_change() RETURNS trigger AS $$
DECLARE
    o orders%ROWTYPE;
BEGIN
    SELECT * INTO o FROM orders
    WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.order_id ELSE NEW.order_id END;
    IF TG_OP = 'DELETE' THEN
        -- Khong tim thay: dang xoa theo CASCADE tu don hang
        IF FOUND THEN
            RAISE EXCEPTION 'Khong xoa rieng % cua don duoc.', TG_TABLE_NAME;
        END IF;
        RETURN OLD;
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.order_id <> OLD.order_id THEN
        RAISE EXCEPTION 'Khong duoc chuyen % sang don khac.', TG_TABLE_NAME;
    END IF;
    IF NOT (o.status::TEXT = ANY (string_to_array(TG_ARGV[0], ','))) THEN
        RAISE EXCEPTION 'Chi sua duoc % khi don o trang thai %, don % dang o "%".',
            TG_TABLE_NAME, TG_ARGV[0], o.order_code, o.status;
    END IF;
    -- IF long nhau: PL/pgSQL khong bo qua ve sau, NEW.points_used chi co o order_amounts
    IF TG_TABLE_NAME = 'order_amounts' AND o.user_id IS NULL THEN
        IF NEW.points_used <> 0 OR NEW.points_discount <> 0 THEN
            RAISE EXCEPTION 'Don khach vang lai khong dung duoc diem loyalty.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tien chi sua khi don con 'new' (cung luc voi dong hang); nguoi dat / dia chi sua duoc truoc khi dong goi
CREATE TRIGGER trg_order_amounts_check
BEFORE INSERT OR UPDATE OR DELETE ON order_amounts
FOR EACH ROW EXECUTE FUNCTION check_order_detail_change('new');

CREATE TRIGGER trg_order_customers_check
BEFORE INSERT OR UPDATE OR DELETE ON order_customers
FOR EACH ROW EXECUTE FUNCTION check_order_detail_change('new,processing');

CREATE TRIGGER trg_order_addresses_check
BEFORE INSERT OR UPDATE OR DELETE ON order_shipping_addresses
FOR EACH ROW EXECUTE FUNCTION check_order_detail_change('new,processing');

-- Sua bang chi tiet -> cap nhat orders.updated_at
CREATE FUNCTION touch_order() RETURNS trigger AS $$
BEGIN
    UPDATE orders SET updated_at = now() WHERE id = NEW.order_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_customers_touch AFTER UPDATE ON order_customers          FOR EACH ROW EXECUTE FUNCTION touch_order();
CREATE TRIGGER trg_order_addresses_touch AFTER UPDATE ON order_shipping_addresses FOR EACH ROW EXECUTE FUNCTION touch_order();
CREATE TRIGGER trg_order_amounts_touch   AFTER UPDATE ON order_amounts            FOR EACH ROW EXECUTE FUNCTION touch_order();
CREATE TRIGGER trg_order_shipments_touch AFTER UPDATE ON order_shipments          FOR EACH ROW EXECUTE FUNCTION touch_order();

-- Van chuyen: khong gan cho don da huy, khong chuyen sang don khac
CREATE FUNCTION check_order_shipment() RETURNS trigger AS $$
DECLARE
    o_status order_status;
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.order_id <> OLD.order_id THEN
        RAISE EXCEPTION 'Khong duoc chuyen thong tin van chuyen sang don khac.';
    END IF;
    SELECT status INTO o_status FROM orders WHERE id = NEW.order_id;
    IF o_status = 'cancelled' THEN
        RAISE EXCEPTION 'Don da huy, khong cap nhat van chuyen.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_shipment_check
BEFORE INSERT OR UPDATE ON order_shipments
FOR EACH ROW EXECUTE FUNCTION check_order_shipment();

-- Don sang 'shipping' / 'completed' -> ghi shipped_at / delivered_at
CREATE FUNCTION stamp_order_shipment() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'shipping' THEN
        INSERT INTO order_shipments (order_id, shipped_at) VALUES (NEW.id, now())
        ON CONFLICT (order_id) DO UPDATE SET shipped_at = EXCLUDED.shipped_at;
    ELSE
        INSERT INTO order_shipments (order_id, delivered_at) VALUES (NEW.id, now())
        ON CONFLICT (order_id) DO UPDATE SET delivered_at = EXCLUDED.delivered_at;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_shipment_stamp
AFTER UPDATE OF status ON orders
FOR EACH ROW WHEN (NEW.status IN ('shipping','completed') AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION stamp_order_shipment();

-- Huy don: chi khi don con 'new' / 'processing'. cancelled_at = now(),
-- cancelled_by lay tu app.user_id neu ung dung khong truyen; sau do tu chuyen don sang 'cancelled'.
CREATE FUNCTION before_order_cancellation() RETURNS trigger AS $$
DECLARE
    o_status order_status;
BEGIN
    SELECT status INTO o_status FROM orders WHERE id = NEW.order_id FOR UPDATE;
    IF o_status NOT IN ('new','processing') THEN
        RAISE EXCEPTION 'Chi huy duoc don dang o new / processing (don dang o "%").', o_status;
    END IF;
    NEW.cancelled_at := now();
    NEW.cancelled_by := COALESCE(NEW.cancelled_by, app_user_id());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_cancellation_before
BEFORE INSERT ON order_cancellations
FOR EACH ROW EXECUTE FUNCTION before_order_cancellation();

CREATE FUNCTION after_order_cancellation() RETURNS trigger AS $$
BEGIN
    UPDATE orders SET status = 'cancelled' WHERE id = NEW.order_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_cancellation_after
AFTER INSERT ON order_cancellations
FOR EACH ROW EXECUTE FUNCTION after_order_cancellation();

CREATE FUNCTION log_order_status() RETURNS trigger AS $$
BEGIN
    INSERT INTO order_status_histories (order_id, from_status, to_status, changed_by, note)
    VALUES (NEW.id,
            CASE WHEN TG_OP = 'UPDATE' THEN OLD.status END,
            NEW.status,
            app_user_id(),
            CASE WHEN NEW.status = 'cancelled'
                 THEN (SELECT reason FROM order_cancellations WHERE order_id = NEW.id) END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_history_ins AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status();

CREATE TRIGGER trg_order_history_upd AFTER UPDATE ON orders
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_order_status();

-- Dong hang chi them/sua/xoa khi don con 'new' (sau do da dung de xuat kho, doi tra, danh gia).
-- Gia: bien the phai dang ban; unit_price khong vuot gia bien the (gia ban that),
--      thap hon gia bien the chi khi san pham dang co chuong trinh khuyen mai.
CREATE FUNCTION check_order_item_change() RETURNS trigger AS $$
DECLARE
    o_status  order_status;
    v_price   NUMERIC(15,2);
    v_active  BOOLEAN;
    v_product BIGINT;
    p_visible BOOLEAN;
    p_deleted TIMESTAMPTZ;
BEGIN
    SELECT status INTO o_status FROM orders
    WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.order_id ELSE NEW.order_id END;
    -- Khong tim thay: dang xoa theo CASCADE tu don hang
    IF FOUND AND o_status <> 'new' THEN
        RAISE EXCEPTION 'Chi sua duoc dong hang khi don con o trang thai new.';
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.order_id <> OLD.order_id THEN
        RAISE EXCEPTION 'Khong duoc chuyen dong hang sang don khac.';
    END IF;

    SELECT v.price, v.is_active, v.product_id, p.is_visible, p.deleted_at
    INTO v_price, v_active, v_product, p_visible, p_deleted
    FROM product_variants v JOIN products p ON p.id = v.product_id
    WHERE v.id = NEW.variant_id;
    IF v_active IS NOT TRUE OR p_visible IS NOT TRUE OR p_deleted IS NOT NULL THEN
        RAISE EXCEPTION 'Bien the % dang ngung ban.', NEW.variant_id;
    END IF;
    IF NEW.unit_price > v_price THEN
        RAISE EXCEPTION 'Gia ban (%) vuot gia bien the (%).', NEW.unit_price, v_price;
    END IF;
    IF NEW.unit_price < v_price AND NOT EXISTS (
        SELECT 1 FROM promotion_products pp JOIN promotions pr ON pr.id = pp.promotion_id
        WHERE pp.product_id = v_product AND pr.is_active AND now() BETWEEN pr.start_at AND pr.end_at
    ) THEN
        RAISE EXCEPTION 'Gia ban (%) thap hon gia bien the (%) nhung san pham khong co khuyen mai.',
            NEW.unit_price, v_price;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_item_change
BEFORE INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION check_order_item_change();

-- Giu cho ton kho khi dat hang: them dong hang -> tang quantity_reserved,
-- chi khi con du hang chua giu (khoa dong ton kho nen 2 khach dat cung luc khong mua lo).
CREATE FUNCTION reserve_order_item() RETURNS trigger AS $$
DECLARE
    con INTEGER;
BEGIN
    IF TG_OP IN ('UPDATE','DELETE') THEN
        UPDATE inventories SET quantity_reserved = GREATEST(quantity_reserved - OLD.quantity, 0)
        WHERE variant_id = OLD.variant_id;
    END IF;
    IF TG_OP IN ('INSERT','UPDATE') THEN
        UPDATE inventories SET quantity_reserved = quantity_reserved + NEW.quantity
        WHERE variant_id = NEW.variant_id
          AND quantity_on_hand - quantity_reserved >= NEW.quantity;
        IF NOT FOUND THEN
            SELECT quantity_on_hand - quantity_reserved INTO con FROM inventories WHERE variant_id = NEW.variant_id;
            RAISE EXCEPTION 'Bien the % chi con % san pham, khong du %.', NEW.variant_id, COALESCE(con, 0), NEW.quantity;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_item_reserve
AFTER INSERT OR UPDATE OF variant_id, quantity OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION reserve_order_item();

-- Huy don (chi tu new / processing, chua xuat kho): tra lai hang da giu va tra lai luot voucher
CREATE FUNCTION release_cancelled_order() RETURNS trigger AS $$
BEGIN
    UPDATE inventories i SET quantity_reserved = GREATEST(i.quantity_reserved - x.qty, 0)
    FROM (SELECT variant_id, SUM(quantity) AS qty FROM order_items
          WHERE order_id = NEW.id GROUP BY variant_id) x
    WHERE i.variant_id = x.variant_id;
    UPDATE vouchers SET used_count = GREATEST(COALESCE(used_count, 0) - 1, 0)
    WHERE id IN (SELECT voucher_id FROM voucher_usages WHERE order_id = NEW.id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_cancel_release
AFTER UPDATE OF status ON orders
FOR EACH ROW WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION release_cancelled_order();

-- 14.11 Doi tra chi duoc yeu cau boi chu don, cho don da hoan thanh va trong thoi han
--       Don khach vang lai: user_id cua yeu cau la NULL; ung dung xac minh bang ma don + so dien thoai + OTP.
--       (system_settings 'return.window_days', tinh tu luc don chuyen 'completed').
CREATE FUNCTION check_return_window() RETURNS trigger AS $$
DECLARE
    o_status order_status;
    o_user   BIGINT;
    o_done   TIMESTAMPTZ;
    win_days INTEGER;
BEGIN
    IF NEW.status <> 'pending' THEN
        RAISE EXCEPTION 'Yeu cau doi/tra moi phai o trang thai pending.';
    END IF;
    SELECT status, user_id INTO o_status, o_user FROM orders WHERE id = NEW.order_id;
    IF o_user IS DISTINCT FROM NEW.user_id THEN
        RAISE EXCEPTION 'Chi chu don hang moi duoc yeu cau doi/tra.';
    END IF;
    IF o_status <> 'completed' THEN
        RAISE EXCEPTION 'Chi duoc yeu cau doi/tra cho don da hoan thanh.';
    END IF;
    SELECT max(created_at) INTO o_done
    FROM order_status_histories WHERE order_id = NEW.order_id AND to_status = 'completed';
    SELECT COALESCE(NULLIF(value, '')::INTEGER, 7) INTO win_days
    FROM system_settings WHERE key = 'return.window_days';
    IF now() > o_done + make_interval(days => COALESCE(win_days, 7)) THEN
        RAISE EXCEPTION 'Da qua thoi han doi/tra (% ngay).', COALESCE(win_days, 7);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_return_window
BEFORE INSERT ON return_requests
FOR EACH ROW EXECUTE FUNCTION check_return_window();

-- 14.12 Luong trang thai doi/tra:
--       pending -> approved | rejected ; approved -> received ; received -> completed
--       Doi hang chi 'completed' khi da xuat du hang doi (phieu exchange_export).
--       Chi xoa duoc yeu cau con 'pending'.
CREATE FUNCTION enforce_return_status() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.status <> 'pending' THEN
            RAISE EXCEPTION 'Chi xoa duoc yeu cau doi/tra con cho duyet.';
        END IF;
        RETURN OLD;
    END IF;
    IF NEW.order_id <> OLD.order_id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.type <> OLD.type THEN
        RAISE EXCEPTION 'Khong duoc doi don hang, khach hang hoac loai cua yeu cau doi/tra.';
    END IF;
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;
    IF NOT (
           (OLD.status = 'pending'  AND NEW.status IN ('approved','rejected'))
        OR (OLD.status = 'approved' AND NEW.status = 'received')
        OR (OLD.status = 'received' AND NEW.status = 'completed')
    ) THEN
        RAISE EXCEPTION 'Khong the chuyen yeu cau doi/tra tu "%" sang "%".', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'approved'
       AND NOT EXISTS (SELECT 1 FROM return_request_items WHERE return_request_id = NEW.id) THEN
        RAISE EXCEPTION 'Yeu cau doi/tra chua co dong hang nao.';
    END IF;
    IF NEW.status = 'completed' AND NEW.type = 'exchange' AND EXISTS (
        SELECT 1
        FROM (SELECT exchange_variant_id AS variant_id, SUM(quantity) AS qty
              FROM return_request_items WHERE return_request_id = NEW.id
              GROUP BY exchange_variant_id) r
        LEFT JOIN (SELECT i.variant_id, SUM(i.quantity) AS qty
                   FROM stock_document_items i
                   JOIN stock_documents s ON s.id = i.stock_document_id
                   WHERE s.type = 'exchange_export' AND s.return_request_id = NEW.id
                   GROUP BY i.variant_id) x
               ON x.variant_id = r.variant_id
        WHERE COALESCE(x.qty, 0) <> r.qty
    ) THEN
        RAISE EXCEPTION 'Yeu cau % chua xuat du hang doi cho khach.', NEW.request_code;
    END IF;
    IF NEW.status IN ('approved','rejected') THEN
        NEW.reviewed_by := COALESCE(NEW.reviewed_by, app_user_id());
        NEW.reviewed_at := now();
    ELSIF NEW.status = 'received' THEN
        NEW.received_by := COALESCE(NEW.received_by, app_user_id());
        NEW.received_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_return_status_flow
BEFORE UPDATE OR DELETE ON return_requests
FOR EACH ROW EXECUTE FUNCTION enforce_return_status();

-- 14.13 Dong hang doi/tra: chi them/sua/xoa khi yeu cau con 'pending' (rieng condition_note,
--       is_restocked thi kho sua duoc sau khi nhan hang). Dong hang phai thuoc dung don, tong so
--       luong doi/tra (tru yeu cau bi tu choi) khong vuot so luong da mua.
--       Doi hang bat buoc chon bien the moi, hoan tien thi khong.
CREATE FUNCTION check_return_item() RETURNS trigger AS $$
DECLARE
    r_status return_status;
    r_type   return_type;
    r_order  BIGINT;
    oi_order BIGINT;
    oi_qty   INTEGER;
    da_tra   INTEGER;
BEGIN
    IF TG_OP <> 'INSERT' THEN
        SELECT status INTO r_status FROM return_requests WHERE id = OLD.return_request_id;
        -- Kho cap nhat tinh trang hang / da nhap lai kho
        IF TG_OP = 'UPDATE'
           AND (NEW.return_request_id, NEW.order_item_id, NEW.quantity, NEW.exchange_variant_id)
               IS NOT DISTINCT FROM
               (OLD.return_request_id, OLD.order_item_id, OLD.quantity, OLD.exchange_variant_id) THEN
            RETURN NEW;
        END IF;
        -- Khong tim thay: dang xoa theo CASCADE tu yeu cau 'pending'
        IF FOUND AND r_status <> 'pending' THEN
            RAISE EXCEPTION 'Chi sua duoc dong hang khi yeu cau doi/tra con cho duyet.';
        END IF;
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
    END IF;

    SELECT status, type, order_id INTO r_status, r_type, r_order
    FROM return_requests WHERE id = NEW.return_request_id;
    IF r_status <> 'pending' THEN
        RAISE EXCEPTION 'Chi sua duoc dong hang khi yeu cau doi/tra con cho duyet.';
    END IF;

    -- Khoa dong hang de 2 yeu cau dong thoi khong cung vuot so luong
    SELECT order_id, quantity INTO oi_order, oi_qty
    FROM order_items WHERE id = NEW.order_item_id FOR UPDATE;
    IF oi_order <> r_order THEN
        RAISE EXCEPTION 'Dong hang khong thuoc don hang cua yeu cau doi/tra.';
    END IF;
    IF r_type = 'exchange' AND NEW.exchange_variant_id IS NULL THEN
        RAISE EXCEPTION 'Doi hang phai chon bien the (size/mau) moi.';
    END IF;
    IF r_type = 'refund' AND NEW.exchange_variant_id IS NOT NULL THEN
        RAISE EXCEPTION 'Hoan tien khong co bien the doi sang.';
    END IF;

    SELECT COALESCE(SUM(ri.quantity), 0) INTO da_tra
    FROM return_request_items ri
    JOIN return_requests rr ON rr.id = ri.return_request_id
    WHERE ri.order_item_id = NEW.order_item_id
      AND rr.status <> 'rejected'
      AND ri.id <> NEW.id;
    IF da_tra + NEW.quantity > oi_qty THEN
        RAISE EXCEPTION 'So luong doi/tra (%) vuot so luong da mua (%).', da_tra + NEW.quantity, oi_qty;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_return_item_check
BEFORE INSERT OR UPDATE OR DELETE ON return_request_items
FOR EACH ROW EXECUTE FUNCTION check_return_item();

-- 14.14 Hoan tien: gan yeu cau doi/tra thi phai cung don, la yeu cau hoan tien da duoc duyet;
--       tong hoan khong vuot so tien khach da tra. completed_at tu gan.
CREATE FUNCTION check_refund() RETURNS trigger AS $$
DECLARE
    r_order  BIGINT;
    r_type   return_type;
    r_status return_status;
    da_hoan  NUMERIC(15,2);
    tong_don NUMERIC(15,2);
BEGIN
    IF NEW.return_request_id IS NOT NULL THEN
        SELECT order_id, type, status INTO r_order, r_type, r_status
        FROM return_requests WHERE id = NEW.return_request_id;
        IF r_order <> NEW.order_id THEN
            RAISE EXCEPTION 'Yeu cau doi/tra khong thuoc don hang cua phieu hoan tien.';
        END IF;
        IF r_type <> 'refund' OR r_status NOT IN ('approved','received','completed') THEN
            RAISE EXCEPTION 'Chi hoan tien cho yeu cau tra hang hoan tien da duoc duyet.';
        END IF;
    END IF;
    -- Khoa don: cac phieu hoan dong thoi cho cung don chay lan luot
    PERFORM 1 FROM orders WHERE id = NEW.order_id FOR UPDATE;
    SELECT total_amount INTO tong_don FROM order_amounts WHERE order_id = NEW.order_id;
    SELECT COALESCE(SUM(amount), 0) INTO da_hoan
    FROM refunds WHERE order_id = NEW.order_id AND status <> 'failed' AND id <> NEW.id;
    IF NEW.status <> 'failed' AND da_hoan + NEW.amount > tong_don THEN
        RAISE EXCEPTION 'Tong tien hoan (%) vuot gia tri don (%).', da_hoan + NEW.amount, tong_don;
    END IF;
    IF NEW.status = 'completed' THEN
        NEW.completed_at := COALESCE(NEW.completed_at, now());
        NEW.processed_by := COALESCE(NEW.processed_by, app_user_id());
    ELSE
        NEW.completed_at := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refund_check
BEFORE INSERT OR UPDATE ON refunds
FOR EACH ROW EXECUTE FUNCTION check_refund();

-- 14.15 Danh gia: chi chu don, dong hang dung san pham, don da hoan thanh; danh gia moi cho duyet
CREATE FUNCTION check_review() RETURNS trigger AS $$
DECLARE
    o_user    BIGINT;
    o_status  order_status;
    v_product BIGINT;
BEGIN
    SELECT o.user_id, o.status, v.product_id INTO o_user, o_status, v_product
    FROM order_items oi
    JOIN orders o           ON o.id = oi.order_id
    JOIN product_variants v ON v.id = oi.variant_id
    WHERE oi.id = NEW.order_item_id;
    -- Don khach vang lai (o_user NULL) khong danh gia duoc: reviews.user_id luon co gia tri
    IF o_user IS DISTINCT FROM NEW.user_id THEN
        RAISE EXCEPTION 'Chi nguoi mua moi duoc danh gia.';
    END IF;
    IF v_product <> NEW.product_id THEN
        RAISE EXCEPTION 'Dong hang khong phai san pham dang danh gia.';
    END IF;
    IF o_status <> 'completed' THEN
        RAISE EXCEPTION 'Chi danh gia duoc don da hoan thanh.';
    END IF;
    IF TG_OP = 'INSERT' AND NEW.status <> 'pending' THEN
        RAISE EXCEPTION 'Danh gia moi phai o trang thai pending.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_check
BEFORE INSERT OR UPDATE OF user_id, product_id, order_item_id ON reviews
FOR EACH ROW EXECUTE FUNCTION check_review();

-- 14.16 Cam sua/xoa so cai, dong phieu kho va nhat ky
--       Sai thi tao phieu dieu chinh / kiem ke / dong loyalty 'adjust'.
CREATE FUNCTION forbid_modify() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Bang % chi cho phep them dong moi, khong duoc sua hay xoa.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loyalty_append_only         BEFORE UPDATE OR DELETE ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_redemptions_append_only     BEFORE UPDATE OR DELETE ON reward_redemptions   FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_activity_append_only        BEFORE UPDATE OR DELETE ON activity_logs        FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_stock_doc_items_append_only BEFORE UPDATE OR DELETE ON stock_document_items FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_stocktake_items_append_only BEFORE UPDATE OR DELETE ON stocktake_items      FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_voucher_usages_append_only  BEFORE UPDATE OR DELETE ON voucher_usages       FOR EACH ROW EXECUTE FUNCTION forbid_modify();
-- Lich su trang thai don quyet dinh han doi/tra: khong cho sua (dong nghia don hang khong xoa cung duoc, chi huy)
CREATE TRIGGER trg_order_history_append_only   BEFORE UPDATE OR DELETE ON order_status_histories FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_order_cancel_append_only    BEFORE UPDATE OR DELETE ON order_cancellations    FOR EACH ROW EXECUTE FUNCTION forbid_modify();

-- ---------------------------------------------------------------------
-- 15. VIEW
-- ---------------------------------------------------------------------
-- Ton kho co the ban = ton thuc te - da giu cho don
CREATE VIEW v_inventory_available AS
SELECT v.id AS variant_id, v.sku, p.name AS product_name,
       s.name AS size, c.name AS color, m.name AS material,
       i.quantity_on_hand, i.quantity_reserved,
       i.quantity_on_hand - i.quantity_reserved AS quantity_available
FROM product_variants v
JOIN products p    ON p.id = v.product_id
JOIN inventories i ON i.variant_id = v.id
LEFT JOIN sizes s     ON s.id = v.size_id
LEFT JOIN colors c    ON c.id = v.color_id
LEFT JOIN materials m ON m.id = v.material_id;

-- Diem danh gia trung binh (chi tinh danh gia da duyet)
CREATE VIEW v_product_rating AS
SELECT product_id, COUNT(*) AS review_count, ROUND(AVG(rating), 1) AS avg_rating
FROM reviews
WHERE status = 'approved'
GROUP BY product_id;

-- Tra cuu quyen cua tung tai khoan: SELECT * FROM v_user_permissions WHERE phone = '...';
-- SUPER_ADMIN luon co TOAN BO quyen (ke ca quyen them sau nay), khong phu thuoc role_permissions.
CREATE VIEW v_user_permissions AS
SELECT DISTINCT u.id AS user_id, u.phone, u.email, r.code AS role, p.code AS permission
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r       ON r.id = ur.role_id
JOIN permissions p ON r.code = 'SUPER_ADMIN'
                   OR EXISTS (SELECT 1 FROM role_permissions rp
                              WHERE rp.role_id = r.id AND rp.permission_id = p.id)
WHERE u.status = 'active';

-- Don hang day du (gop cac bang tach ra) - dung cho man hinh danh sach / chi tiet don
CREATE VIEW v_order_details AS
SELECT o.id AS order_id, o.order_code, o.user_id, o.is_buy_now,
       o.status, o.payment_method, o.payment_status, o.note, o.created_at, o.updated_at,
       c.customer_name, c.customer_phone, c.customer_email,
       ad.recipient_name, ad.recipient_phone, ad.province, ad.district, ad.ward, ad.street_address,
       am.subtotal, am.voucher_id, vc.code AS voucher_code, am.voucher_discount,
       am.points_used, am.points_discount, am.shipping_fee, am.total_amount,
       sh.shipping_carrier_id, sc.name AS shipping_carrier_name, sh.tracking_code,
       sh.shipped_at, sh.delivered_at,
       cn.reason AS cancel_reason, cn.cancelled_by, cn.cancelled_at,
       (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM orders o
LEFT JOIN order_customers c           ON c.order_id  = o.id
LEFT JOIN order_shipping_addresses ad ON ad.order_id = o.id
LEFT JOIN order_amounts am            ON am.order_id = o.id
LEFT JOIN vouchers vc                 ON vc.id       = am.voucher_id
LEFT JOIN order_shipments sh          ON sh.order_id = o.id
LEFT JOIN shipping_carriers sc        ON sc.id       = sh.shipping_carrier_id
LEFT JOIN order_cancellations cn      ON cn.order_id = o.id;

-- ---------------------------------------------------------------------
-- 15b. KIEM TRA QUYEN XEM DON HANG
--   SUPER_ADMIN va vai tro co ORDER_HISTORY_ALL_VIEW (CSKH, kho) xem duoc MOI don,
--   ke ca don khach vang lai; khach hang (ORDER_HISTORY_OWN) chi xem don cua minh.
--   SELECT has_permission(5, 'ORDER_HISTORY_ALL_VIEW');
--   SELECT can_view_order(5, 123);
--   SELECT * FROM orders_visible_to(5) WHERE status = 'new' ORDER BY created_at DESC;
-- ---------------------------------------------------------------------
CREATE FUNCTION has_permission(p_user_id BIGINT, p_code VARCHAR) RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM v_user_permissions
                   WHERE user_id = p_user_id AND permission = p_code);
$$ LANGUAGE sql STABLE;

CREATE FUNCTION can_view_order(p_user_id BIGINT, p_order_id BIGINT) RETURNS BOOLEAN AS $$
    SELECT has_permission(p_user_id, 'ORDER_HISTORY_ALL_VIEW')
        OR (has_permission(p_user_id, 'ORDER_HISTORY_OWN')
            AND EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND user_id = p_user_id));
$$ LANGUAGE sql STABLE;

CREATE FUNCTION orders_visible_to(p_user_id BIGINT) RETURNS SETOF v_order_details AS $$
    SELECT d.* FROM v_order_details d
    WHERE has_permission(p_user_id, 'ORDER_HISTORY_ALL_VIEW')
       OR (d.user_id = p_user_id AND has_permission(p_user_id, 'ORDER_HISTORY_OWN'));
$$ LANGUAGE sql STABLE;

-- ---------------------------------------------------------------------
-- 16. USER RIENG CHO UNG DUNG (bo dau -- va chay rieng bang tai khoan postgres, trong shop_db)
--     Doi mat khau truoc khi chay. Khong cho website ket noi bang tai khoan postgres.
-- ---------------------------------------------------------------------
-- CREATE USER shop_user WITH PASSWORD 'doi_mat_khau_manh';
-- GRANT CONNECT ON DATABASE shop_db TO shop_user;
-- GRANT USAGE ON SCHEMA public TO shop_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO shop_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO shop_user;

COMMIT;
