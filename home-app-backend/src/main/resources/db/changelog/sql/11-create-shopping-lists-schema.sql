--liquibase formatted sql

--changeset jorge:11-create-shopping-lists-table-v2
CREATE TABLE shopping.shopping_lists (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED
    created_by BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_shopping_lists_user FOREIGN KEY (created_by) REFERENCES profiles.user(id)
);

CREATE INDEX idx_shopping_lists_status ON shopping.shopping_lists(status);
CREATE INDEX idx_shopping_lists_created_by ON shopping.shopping_lists(created_by);

--changeset jorge:11-create-shopping-list-items-table-v2
CREATE TABLE shopping.shopping_list_items (
    id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    store_id BIGINT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs', -- pcs, kg, L, etc.
    price DECIMAL(10,2), -- The price actually paid or estimated
    bought BOOLEAN NOT NULL DEFAULT false,
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

--rollback DROP TABLE IF EXISTS shopping.shopping_list_items;
--rollback DROP TABLE IF EXISTS shopping.shopping_lists;
