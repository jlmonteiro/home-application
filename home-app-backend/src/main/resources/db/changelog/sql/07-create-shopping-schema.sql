--liquibase formatted sql

--changeset jorge:07-create-shopping-schema
CREATE SCHEMA IF NOT EXISTS shopping;

--changeset jorge:07-create-shopping-categories-table
CREATE TABLE shopping.shopping_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--changeset jorge:07-create-shopping-items-table
CREATE TABLE shopping.shopping_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    photo TEXT,
    category_id BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shopping_items_category FOREIGN KEY (category_id) REFERENCES shopping.shopping_categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_shopping_items_category_id ON shopping.shopping_items(category_id);
CREATE UNIQUE INDEX idx_shopping_items_name_category ON shopping.shopping_items(name, category_id);

--rollback DROP TABLE IF EXISTS shopping.shopping_items;
--rollback DROP TABLE IF EXISTS shopping.shopping_categories;
--rollback DROP SCHEMA IF EXISTS shopping CASCADE;
