--liquibase formatted sql

--changeset jorge:12-add-description-to-shopping-lists
ALTER TABLE shopping.shopping_lists ADD COLUMN description TEXT;

--rollback ALTER TABLE shopping.shopping_lists DROP COLUMN description;
