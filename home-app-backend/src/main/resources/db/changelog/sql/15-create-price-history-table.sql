-- Liquibase ChangeSet: 15-create-price-history-table
-- Description: Create table to track price history of items per store

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
