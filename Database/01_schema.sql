-- =====================================================================
-- 01_schema.sql - CAU TRUC DATABASE (bang, index, trigger, view)
-- Website ban quan ao | PostgreSQL 13+
--
-- Chay DAU TIEN, tren database trong (da tao rieng bang CREATE DATABASE shop_db).
-- Tiep theo chay 02_seed_required.sql, sau do (tuy chon) 03_seed_demo.sql.
--
-- Vai tro: customer (khach hang), warehouse (quan ly kho),
--          cskh (CSKH / xu ly don hang), admin (admin toi cao).
-- Khach vang lai chua dang nhap nen khong co tai khoan trong DB.
--
-- File nay co BEGIN ... COMMIT: neu thieu dong COMMIT cuoi file thi bang KHONG duoc luu.
-- =====================================================================

SET client_encoding = 'UTF8';
BEGIN;

-- ---------------------------------------------------------------------
-- 1. VAI TRO VA QUYEN
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        VARCHAR(30) NOT NULL UNIQUE,
    name        VARCHAR(80) NOT NULL,
    description VARCHAR(200)
);

CREATE TABLE permissions (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,        -- dang module.action
    description VARCHAR(200)
);

CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- 2. TAI KHOAN
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id           BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,  -- Admin doi role tai day
    email             VARCHAR(150) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,        -- luu ma BAM (bcrypt/argon2), khong luu mat khau goc
    full_name         VARCHAR(100) NOT NULL,
    phone             VARCHAR(15),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,   -- FALSE = bi khoa (khoa thay vi xoa)
    email_verified_at TIMESTAMPTZ,
    loyalty_points    INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),  -- ban sao, tu cap nhat tu loyalty_transactions
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_users_email ON users (lower(email));

-- So dia chi (nha, cong ty...), moi nguoi co toi da 1 dia chi mac dinh
CREATE TABLE addresses (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label         VARCHAR(30) NOT NULL DEFAULT 'Nha',
    receiver_name VARCHAR(100) NOT NULL,
    phone         VARCHAR(15)  NOT NULL,
    province      VARCHAR(50)  NOT NULL,
    district      VARCHAR(50)  NOT NULL,
    ward          VARCHAR(50)  NOT NULL,
    street        VARCHAR(200) NOT NULL,
    is_default    BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX uq_address_default ON addresses (user_id) WHERE is_default;

-- Ma OTP: quen mat khau, xac minh email
CREATE TABLE otp_codes (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose    VARCHAR(20) NOT NULL CHECK (purpose IN ('reset_password','verify_email')),
    code_hash  VARCHAR(255) NOT NULL,                -- luu ma bam cua OTP
    attempts   SMALLINT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 3. DANH MUC, SAN PHAM, BIEN THE (size, mau)
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id  BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(120) NOT NULL UNIQUE,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE products (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(220) NOT NULL UNIQUE,
    description TEXT,
    price       NUMERIC(12,0) NOT NULL CHECK (price >= 0),
    cost_price  NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,     -- an/hien
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,    -- xoa mem
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku        VARCHAR(50) NOT NULL UNIQUE,         -- vi du AT01-DEN-M
    size       VARCHAR(10) NOT NULL,
    color      VARCHAR(30) NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),  -- ton kho trung tam, tu cap nhat tu stock_movements
    UNIQUE (product_id, size, color)
);

CREATE TABLE product_images (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color      VARCHAR(30),
    image_url  VARCHAR(500) NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 4. MA GIAM GIA / VOUCHER
-- ---------------------------------------------------------------------
CREATE TABLE coupons (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code           VARCHAR(30) NOT NULL UNIQUE,
    name           VARCHAR(150) NOT NULL,
    discount_type  VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent','fixed')),
    discount_value NUMERIC(12,0) NOT NULL CHECK (discount_value > 0),
    max_discount   NUMERIC(12,0),                   -- tran giam khi giam theo %
    min_order      NUMERIC(12,0) NOT NULL DEFAULT 0,
    valid_from     TIMESTAMPTZ NOT NULL,
    valid_to       TIMESTAMPTZ NOT NULL,
    usage_limit    INTEGER NOT NULL DEFAULT 0,      -- 0 = khong gioi han
    per_user_limit INTEGER NOT NULL DEFAULT 1,
    used_count     INTEGER NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (valid_to > valid_from),
    CHECK (discount_type <> 'percent' OR discount_value <= 100)
);

-- ---------------------------------------------------------------------
-- 5. DON HANG
-- ---------------------------------------------------------------------
-- Luong trang thai: new -> processing -> packing -> shipping -> completed
-- Khach tu huy duoc khi con 'new' hoac 'processing' (chua xuat kho). Trigger o muc 13 chan chuyen sai luong.
CREATE TABLE orders (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,    -- ma don hien thi cho khach, do ung dung sinh
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,  -- bat buoc dang nhap
    receiver_name   VARCHAR(100) NOT NULL,          -- chup lai thong tin giao hang luc dat
    receiver_phone  VARCHAR(15)  NOT NULL,
    shipping_address TEXT NOT NULL,
    status          VARCHAR(15) NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','processing','packing','shipping','completed','cancelled')),
    subtotal        NUMERIC(12,0) NOT NULL CHECK (subtotal >= 0),
    shipping_fee    NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    coupon_id       BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
    coupon_discount NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (coupon_discount >= 0),
    points_used     INTEGER NOT NULL DEFAULT 0 CHECK (points_used >= 0),      -- diem loyalty dung de tru tien
    points_discount NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (points_discount >= 0),
    total           NUMERIC(12,0) NOT NULL CHECK (total >= 0),
    note            TEXT,
    cancel_reason   VARCHAR(200),
    carrier         VARCHAR(50),
    tracking_code   VARCHAR(50),
    cancelled_at    TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (total = subtotal + shipping_fee - coupon_discount - points_discount),
    CHECK (status <> 'cancelled' OR cancel_reason IS NOT NULL)
);

CREATE TABLE order_items (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id     BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id   BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,             -- chup lai ten, size, mau, gia luc mua
    size         VARCHAR(10)  NOT NULL,
    color        VARCHAR(30)  NOT NULL,
    unit_price   NUMERIC(12,0) NOT NULL CHECK (unit_price >= 0),
    quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE order_status_history (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(15),
    to_status   VARCHAR(15) NOT NULL,
    changed_by  BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    method      VARCHAR(10) NOT NULL CHECK (method IN ('cod','bank_qr')),
    amount      NUMERIC(12,0) NOT NULL CHECK (amount >= 0),
    status      VARCHAR(10) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','paid','failed','refunded')),
    transaction_ref VARCHAR(100),
    paid_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coupon_usages (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_id  BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    used_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. KHO: NHAP / XUAT / KIEM KE / SO CAI
-- ---------------------------------------------------------------------
CREATE TABLE suppliers (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    VARCHAR(150) NOT NULL,
    phone   VARCHAR(15),
    email   VARCHAR(150),
    address VARCHAR(250)
);

-- So cai ton kho: chi them dong, khong sua, khong xoa
CREATE TABLE stock_movements (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL CHECK (quantity <> 0),      -- +nhap, -xuat
    reason     VARCHAR(15) NOT NULL
               CHECK (reason IN ('IMPORT','EXPORT','RETURN_IN','EXCHANGE_OUT','ADJUST')),
    ref_type   VARCHAR(20),                                 -- goods_receipt, goods_issue, return_request, stocktake
    ref_id     BIGINT,
    note       VARCHAR(200),
    created_by BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phieu nhap kho (tu nha cung cap)
CREATE TABLE goods_receipts (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code        VARCHAR(20) NOT NULL UNIQUE,
    supplier_id BIGINT REFERENCES suppliers(id) ON DELETE RESTRICT,
    created_by  BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note        VARCHAR(250),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE goods_receipt_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    receipt_id BIGINT NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost  NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0)
);

-- Phieu xuat kho (giao cho don vi van chuyen)
CREATE TABLE goods_issues (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code          VARCHAR(20) NOT NULL UNIQUE,
    order_id      BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
    carrier       VARCHAR(50),
    tracking_code VARCHAR(50),
    created_by    BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note          VARCHAR(250),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE goods_issue_items (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_id   BIGINT NOT NULL REFERENCES goods_issues(id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL CHECK (quantity > 0)
);

-- Kiem ke: nhap so dem thuc te, he thong tu lay ton he thong va ghi chenh lech vao so cai
CREATE TABLE stocktakes (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code       VARCHAR(20) NOT NULL UNIQUE,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note       VARCHAR(250),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE stocktake_items (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stocktake_id BIGINT NOT NULL REFERENCES stocktakes(id) ON DELETE CASCADE,
    variant_id   BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    system_qty   INTEGER NOT NULL DEFAULT 0,               -- trigger tu dien
    counted_qty  INTEGER NOT NULL CHECK (counted_qty >= 0),
    diff         INTEGER GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
    UNIQUE (stocktake_id, variant_id)
);

-- ---------------------------------------------------------------------
-- 7. YEU CAU DOI / TRA HANG
-- ---------------------------------------------------------------------
CREATE TABLE return_requests (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type        VARCHAR(10) NOT NULL CHECK (type IN ('return','exchange')),
    reason      VARCHAR(20) NOT NULL CHECK (reason IN ('wrong_size','defective','changed_mind','other')),
    description TEXT,
    status      VARCHAR(10) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected','received','refunded','completed')),
    reviewed_by   BIGINT REFERENCES users(id) ON DELETE RESTRICT,   -- CSKH hoac Admin duyet
    reviewed_at   TIMESTAMPTZ,
    reject_reason VARCHAR(250),
    received_by   BIGINT REFERENCES users(id) ON DELETE RESTRICT,   -- Quan ly kho xac nhan nhan hang
    received_at   TIMESTAMPTZ,
    item_condition VARCHAR(250),                                    -- tinh trang hang khi nhan lai
    refund_amount NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
    refunded_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (status <> 'rejected' OR reject_reason IS NOT NULL)
);

CREATE TABLE return_request_items (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    return_id           BIGINT NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    order_item_id       BIGINT NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    exchange_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,  -- doi sang size/mau nao
    restock             BOOLEAN NOT NULL DEFAULT TRUE    -- TRUE = hang con ban duoc, nhap lai kho
);

CREATE TABLE return_request_media (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    return_id  BIGINT NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    media_type VARCHAR(5) NOT NULL CHECK (media_type IN ('image','video')),
    file_url   VARCHAR(500) NOT NULL
);

-- ---------------------------------------------------------------------
-- 8. TICH DIEM LOYALTY
-- ---------------------------------------------------------------------
CREATE TABLE loyalty_rewards (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(250),
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    reward_type VARCHAR(10) NOT NULL CHECK (reward_type IN ('gift','voucher')),
    coupon_id   BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- So cai diem: chi them dong, khong sua, khong xoa
CREATE TABLE loyalty_transactions (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    points     INTEGER NOT NULL CHECK (points <> 0),             -- +tich, -tieu
    reason     VARCHAR(15) NOT NULL
               CHECK (reason IN ('EARN','REDEEM_ORDER','REDEEM_REWARD','REFUND','ADJUST')),
    order_id   BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
    reward_id  BIGINT REFERENCES loyalty_rewards(id) ON DELETE RESTRICT,
    note       VARCHAR(200),
    created_by BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 9. GIO HANG, YEU THICH, DANH GIA
-- ---------------------------------------------------------------------
CREATE TABLE cart_items (
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, variant_id)
);

CREATE TABLE wishlist_items (
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, variant_id)
);

-- Moi dong hang da mua chi duoc danh gia 1 lan; danh gia cho CSKH duyet truoc khi hien cong khai
CREATE TABLE reviews (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_item_id BIGINT NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE RESTRICT,
    rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    status        VARCHAR(10) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','hidden')),
    moderated_by  BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    moderated_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE review_media (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id  BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    media_type VARCHAR(5) NOT NULL CHECK (media_type IN ('image','video')),
    file_url   VARCHAR(500) NOT NULL
);

-- ---------------------------------------------------------------------
-- 10. LIVE CHAT
-- ---------------------------------------------------------------------
CREATE TABLE chat_conversations (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to     BIGINT REFERENCES users(id) ON DELETE RESTRICT,    -- nhan vien CSKH dang tra loi
    status          VARCHAR(6) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_message_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_chat_open ON chat_conversations (customer_id) WHERE status = 'open';

CREATE TABLE chat_messages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content         TEXT,
    attachment_url  VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (content IS NOT NULL OR attachment_url IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 11. CAU HINH HE THONG VA NHAT KY (chi Admin)
-- ---------------------------------------------------------------------
CREATE TABLE system_settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    value       TEXT NOT NULL,
    description VARCHAR(200),
    updated_by  BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nhat ky hoat dong: chi them dong, khong sua, khong xoa
CREATE TABLE audit_logs (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    action     VARCHAR(30)  NOT NULL,           -- CHANGE_ROLE, LOCK_USER, CHANGE_SETTING, APPROVE_RETURN...
    target     VARCHAR(100) NOT NULL,           -- vi du Order#1052
    detail     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 12. INDEX
-- ---------------------------------------------------------------------
CREATE INDEX idx_users_role          ON users(role_id);
CREATE INDEX idx_addresses_user      ON addresses(user_id);
CREATE INDEX idx_otp_user            ON otp_codes(user_id, purpose);
CREATE INDEX idx_categories_parent   ON categories(parent_id);
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_visible    ON products(is_active, is_deleted);
CREATE INDEX idx_variants_product    ON product_variants(product_id);
CREATE INDEX idx_images_product      ON product_images(product_id);
CREATE INDEX idx_orders_user         ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status       ON orders(status, created_at DESC);
CREATE INDEX idx_items_order         ON order_items(order_id);
CREATE INDEX idx_items_variant       ON order_items(variant_id);
CREATE INDEX idx_history_order       ON order_status_history(order_id);
CREATE INDEX idx_payments_order      ON payments(order_id);
CREATE INDEX idx_stock_variant       ON stock_movements(variant_id, created_at DESC);
CREATE INDEX idx_receipt_items       ON goods_receipt_items(receipt_id);
CREATE INDEX idx_issue_items         ON goods_issue_items(issue_id);
CREATE INDEX idx_issues_order        ON goods_issues(order_id);
CREATE INDEX idx_returns_order       ON return_requests(order_id);
CREATE INDEX idx_returns_status      ON return_requests(status, created_at DESC);
CREATE INDEX idx_return_items        ON return_request_items(return_id);
CREATE INDEX idx_loyalty_user        ON loyalty_transactions(user_id, created_at DESC);
CREATE INDEX idx_wishlist_variant    ON wishlist_items(variant_id);
CREATE INDEX idx_reviews_product     ON reviews(product_id, status);
CREATE INDEX idx_reviews_status      ON reviews(status, created_at DESC);
CREATE INDEX idx_chat_msgs           ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_audit_user_time     ON audit_logs(user_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 13. HAM VA TRIGGER
-- ---------------------------------------------------------------------

-- Ung dung gan "app.user_id" truoc khi thao tac de database biet ai lam:
--   SET LOCAL app.user_id = '5';    (trong cung transaction)
CREATE FUNCTION app_user_id() RETURNS BIGINT AS $$
    SELECT NULLIF(current_setting('app.user_id', true), '')::BIGINT;
$$ LANGUAGE sql STABLE;

-- 13.1 Tu cap nhat updated_at
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 13.2 Moi dong so cai kho tu dong cong/tru product_variants.stock
--      Neu ton se am thi CHECK (stock >= 0) chan va huy ca giao dich (chong ban qua so luong).
CREATE FUNCTION apply_stock_movement() RETURNS trigger AS $$
BEGIN
    UPDATE product_variants SET stock = stock + NEW.quantity WHERE id = NEW.variant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_apply
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION apply_stock_movement();

-- 13.3 Phieu nhap kho -> ghi so cai (+)
CREATE FUNCTION receipt_item_to_ledger() RETURNS trigger AS $$
BEGIN
    INSERT INTO stock_movements (variant_id, quantity, reason, ref_type, ref_id, created_by)
    SELECT NEW.variant_id, NEW.quantity, 'IMPORT', 'goods_receipt', NEW.receipt_id, r.created_by
    FROM goods_receipts r WHERE r.id = NEW.receipt_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_receipt_item_ledger
AFTER INSERT ON goods_receipt_items
FOR EACH ROW EXECUTE FUNCTION receipt_item_to_ledger();

-- 13.4 Phieu xuat kho -> ghi so cai (-)
CREATE FUNCTION issue_item_to_ledger() RETURNS trigger AS $$
BEGIN
    INSERT INTO stock_movements (variant_id, quantity, reason, ref_type, ref_id, created_by)
    SELECT NEW.variant_id, -NEW.quantity, 'EXPORT', 'goods_issue', NEW.issue_id, i.created_by
    FROM goods_issues i WHERE i.id = NEW.issue_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_issue_item_ledger
AFTER INSERT ON goods_issue_items
FOR EACH ROW EXECUTE FUNCTION issue_item_to_ledger();

-- 13.5 Kiem ke: lay ton he thong, ghi chenh lech (neu co) vao so cai
CREATE FUNCTION stocktake_item_to_ledger() RETURNS trigger AS $$
DECLARE
    cur INTEGER;
BEGIN
    SELECT stock INTO cur FROM product_variants WHERE id = NEW.variant_id FOR UPDATE;
    NEW.system_qty := cur;
    IF NEW.counted_qty <> cur THEN
        INSERT INTO stock_movements (variant_id, quantity, reason, ref_type, ref_id, created_by)
        SELECT NEW.variant_id, NEW.counted_qty - cur, 'ADJUST', 'stocktake', NEW.stocktake_id, s.created_by
        FROM stocktakes s WHERE s.id = NEW.stocktake_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stocktake_item_ledger
BEFORE INSERT ON stocktake_items
FOR EACH ROW EXECUTE FUNCTION stocktake_item_to_ledger();

-- 13.6 Doi/tra: khi 'received' -> nhap lai kho cac dong restock = TRUE
--               khi 'completed' (doi hang) -> xuat hang moi cho khach
CREATE FUNCTION return_to_ledger() RETURNS trigger AS $$
DECLARE
    uid BIGINT := COALESCE(app_user_id(), NEW.received_by);
BEGIN
    IF NEW.status = 'received' THEN
        INSERT INTO stock_movements (variant_id, quantity, reason, ref_type, ref_id, created_by)
        SELECT oi.variant_id, ri.quantity, 'RETURN_IN', 'return_request', NEW.id, uid
        FROM return_request_items ri
        JOIN order_items oi ON oi.id = ri.order_item_id
        WHERE ri.return_id = NEW.id AND ri.restock;
    ELSIF NEW.status = 'completed' AND NEW.type = 'exchange' THEN
        INSERT INTO stock_movements (variant_id, quantity, reason, ref_type, ref_id, created_by)
        SELECT ri.exchange_variant_id, -ri.quantity, 'EXCHANGE_OUT', 'return_request', NEW.id, uid
        FROM return_request_items ri
        WHERE ri.return_id = NEW.id AND ri.exchange_variant_id IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_return_ledger
AFTER UPDATE OF status ON return_requests
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION return_to_ledger();

-- 13.6b Doi tra chi duoc yeu cau cho don da hoan thanh va trong thoi han (system_settings.return.window_days)
CREATE FUNCTION check_return_window() RETURNS trigger AS $$
DECLARE
    o_status VARCHAR(15);
    o_done   TIMESTAMPTZ;
    win_days INTEGER;
BEGIN
    SELECT status, completed_at INTO o_status, o_done FROM orders WHERE id = NEW.order_id;
    IF o_status <> 'completed' THEN
        RAISE EXCEPTION 'Chi duoc yeu cau doi/tra cho don da hoan thanh.';
    END IF;
    SELECT COALESCE(NULLIF(value, '')::INTEGER, 7) INTO win_days
    FROM system_settings WHERE setting_key = 'return.window_days';
    IF now() > o_done + make_interval(days => COALESCE(win_days, 7)) THEN
        RAISE EXCEPTION 'Da qua thoi han doi/tra (% ngay).', COALESCE(win_days, 7);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_return_window
BEFORE INSERT ON return_requests
FOR EACH ROW EXECUTE FUNCTION check_return_window();

-- 13.7 So cai diem -> cap nhat users.loyalty_points (CHECK >= 0 chan tieu qua so diem co)
CREATE FUNCTION apply_loyalty() RETURNS trigger AS $$
BEGIN
    UPDATE users SET loyalty_points = loyalty_points + NEW.points WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loyalty_apply
AFTER INSERT ON loyalty_transactions
FOR EACH ROW EXECUTE FUNCTION apply_loyalty();

-- 13.8 Chan chuyen trang thai don sai luong + ghi lich su
--      new -> processing -> packing -> shipping -> completed ; huy chi tu new/processing
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
    IF NEW.status = 'cancelled' THEN NEW.cancelled_at := now(); END IF;
    IF NEW.status = 'completed' THEN NEW.completed_at := now(); END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_flow
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION enforce_order_status();

CREATE FUNCTION log_order_status() RETURNS trigger AS $$
BEGIN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id,
            CASE WHEN TG_OP = 'UPDATE' THEN OLD.status END,
            NEW.status,
            app_user_id());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_history_ins AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status();

CREATE TRIGGER trg_order_history_upd AFTER UPDATE ON orders
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_order_status();

-- 13.9 Cam sua/xoa cac so cai va nhat ky
CREATE FUNCTION forbid_modify() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Bang % chi cho phep them dong moi, khong duoc sua hay xoa.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_append_only   BEFORE UPDATE OR DELETE ON stock_movements      FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_loyalty_append_only BEFORE UPDATE OR DELETE ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION forbid_modify();
CREATE TRIGGER trg_audit_append_only   BEFORE UPDATE OR DELETE ON audit_logs           FOR EACH ROW EXECUTE FUNCTION forbid_modify();

-- ---------------------------------------------------------------------
-- 14. VIEW
-- ---------------------------------------------------------------------
-- Doi chieu ton kho: cot stock (ban sao) so voi tong so cai
CREATE VIEW v_stock_check AS
SELECT v.id AS variant_id, v.sku, p.name, v.size, v.color,
       v.stock AS ton_hien_thi,
       COALESCE(SUM(m.quantity), 0) AS ton_theo_so_cai,
       v.stock = COALESCE(SUM(m.quantity), 0) AS khop
FROM product_variants v
JOIN products p ON p.id = v.product_id
LEFT JOIN stock_movements m ON m.variant_id = v.id
GROUP BY v.id, p.name;

-- Diem danh gia trung binh (chi tinh danh gia da duyet)
CREATE VIEW v_product_rating AS
SELECT product_id, COUNT(*) AS review_count, ROUND(AVG(rating), 1) AS avg_rating
FROM reviews
WHERE status = 'approved'
GROUP BY product_id;

-- Tra cuu quyen cua tung tai khoan: SELECT * FROM v_user_permissions WHERE email = '...';
CREATE VIEW v_user_permissions AS
SELECT u.id AS user_id, u.email, r.code AS role, p.code AS permission
FROM users u
JOIN roles r ON r.id = u.role_id
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.is_active;

-- ---------------------------------------------------------------------
-- 15. USER RIENG CHO UNG DUNG (bo dau -- va chay rieng bang tai khoan postgres, trong shop_db)
--     Doi mat khau truoc khi chay. Khong cho website ket noi bang tai khoan postgres.
-- ---------------------------------------------------------------------
-- CREATE USER shop_user WITH PASSWORD 'doi_mat_khau_manh';
-- GRANT CONNECT ON DATABASE shop_db TO shop_user;
-- GRANT USAGE ON SCHEMA public TO shop_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO shop_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO shop_user;

COMMIT;
