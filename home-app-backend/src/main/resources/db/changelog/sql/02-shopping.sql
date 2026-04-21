-- liquibase formatted sql

-- changeset consolidated:02-shopping
CREATE SCHEMA IF NOT EXISTS shopping;

-- Shopping Categories
CREATE TABLE shopping.shopping_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Shopping Items (Master)
CREATE TABLE shopping.shopping_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    photo VARCHAR(255),
    category_id BIGINT NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    pc_quantity DECIMAL(19, 4),
    pc_unit VARCHAR(20),
    nutrition_sample_size DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    nutrition_sample_unit VARCHAR(20) NOT NULL DEFAULT 'g',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shopping_items_category FOREIGN KEY (category_id) REFERENCES shopping.shopping_categories(id) ON DELETE CASCADE
);

COMMENT ON COLUMN shopping.shopping_items.pc_quantity IS 'Quantity of standard unit per piece (e.g. 1.0 for a 1L bottle)';
COMMENT ON COLUMN shopping.shopping_items.pc_unit IS 'Standard unit for piece conversion (e.g. L for a 1L bottle)';

CREATE INDEX idx_shopping_items_category_id ON shopping.shopping_items(category_id);
CREATE UNIQUE INDEX idx_shopping_items_name_category ON shopping.shopping_items(name, category_id);

-- Shopping Stores
CREATE TABLE shopping.shopping_stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    photo VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Cards
CREATE TABLE shopping.loyalty_cards (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    number VARCHAR(100) NOT NULL,
    barcode_type VARCHAR(20) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_cards_store FOREIGN KEY (store_id) REFERENCES shopping.shopping_stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_loyalty_cards_store_id ON shopping.loyalty_cards(store_id);

-- Coupons
CREATE TABLE shopping.coupons (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    value VARCHAR(100),
    photo VARCHAR(255),
    due_date TIMESTAMP,
    code VARCHAR(100),
    barcode_type VARCHAR(20) DEFAULT 'CODE_128',
    used BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupons_store FOREIGN KEY (store_id) REFERENCES shopping.shopping_stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_coupons_store_id ON shopping.coupons(store_id);
CREATE INDEX idx_coupons_status_due ON shopping.coupons(used, due_date);

-- Shopping Lists
CREATE TABLE shopping.shopping_lists (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_shopping_lists_user FOREIGN KEY (created_by) REFERENCES profiles.user(id)
);

CREATE INDEX idx_shopping_lists_status ON shopping.shopping_lists(status);
CREATE INDEX idx_shopping_lists_created_by ON shopping.shopping_lists(created_by);

-- Shopping List Items
CREATE TABLE shopping.shopping_list_items (
    id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    store_id BIGINT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
    price DECIMAL(10,2),
    bought BOOLEAN NOT NULL DEFAULT false,
    unavailable BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_list_items_list FOREIGN KEY (list_id) REFERENCES shopping.shopping_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_list_items_item FOREIGN KEY (item_id) REFERENCES shopping.shopping_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_list_items_store FOREIGN KEY (store_id) REFERENCES shopping.shopping_stores(id) ON DELETE SET NULL
);

CREATE INDEX idx_list_items_list_id ON shopping.shopping_list_items(list_id);
CREATE INDEX idx_list_items_item_id ON shopping.shopping_list_items(item_id);
CREATE INDEX idx_list_items_store_id ON shopping.shopping_list_items(store_id);

-- Price History
CREATE TABLE shopping.shopping_item_price_history (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL,
    store_id BIGINT,
    price DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_price_history_item FOREIGN KEY (item_id) REFERENCES shopping.shopping_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_price_history_store FOREIGN KEY (store_id) REFERENCES shopping.shopping_stores(id) ON DELETE SET NULL
);

CREATE INDEX idx_price_history_item_store ON shopping.shopping_item_price_history(item_id, store_id, recorded_at DESC);
