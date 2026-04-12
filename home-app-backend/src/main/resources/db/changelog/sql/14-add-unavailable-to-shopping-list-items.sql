-- Liquibase ChangeSet: 14-add-unavailable-to-shopping-list-items
-- Description: Add unavailable column to shopping_list_items table

ALTER TABLE shopping.shopping_list_items
ADD COLUMN unavailable BOOLEAN DEFAULT FALSE NOT NULL;
