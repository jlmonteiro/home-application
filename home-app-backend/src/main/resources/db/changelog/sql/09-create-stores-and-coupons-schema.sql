--liquibase formatted sql

--changeset jorge:09-create-shopping-stores-table
CREATE TABLE shopping.shopping_stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    photo TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--changeset jorge:09-create-loyalty-cards-table
CREATE TABLE shopping.loyalty_cards (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    number VARCHAR(100) NOT NULL,
    barcode_type VARCHAR(20) NOT NULL, -- e.g., QR, CODE_128
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_cards_store FOREIGN KEY (store_id) REFERENCES shopping.shopping_stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_loyalty_cards_store_id ON shopping.loyalty_cards(store_id);

--changeset jorge:09-create-coupons-table
CREATE TABLE shopping.coupons (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    value VARCHAR(100), -- Free text for value (e.g., "$10 off", "20%")
    photo TEXT,
    due_date TIMESTAMP,
    used BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupons_store FOREIGN KEY (store_id) REFERENCES shopping.shopping_stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_coupons_store_id ON shopping.coupons(store_id);
CREATE INDEX idx_coupons_status_due ON shopping.coupons(used, due_date);

--rollback DROP TABLE IF EXISTS shopping.coupons;
--rollback DROP TABLE IF EXISTS shopping.loyalty_cards;
--rollback DROP TABLE IF EXISTS shopping.shopping_stores;
