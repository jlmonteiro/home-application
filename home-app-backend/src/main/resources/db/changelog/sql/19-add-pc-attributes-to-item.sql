-- liquibase formatted sql

-- changeset jorge:19-add-pc-attributes-to-item
ALTER TABLE shopping.shopping_items ADD COLUMN pc_quantity DECIMAL(19, 4);
ALTER TABLE shopping.shopping_items ADD COLUMN pc_unit VARCHAR(20);

COMMENT ON COLUMN shopping.shopping_items.pc_quantity IS 'Quantity of standard unit per piece (e.g. 1.0 for a 1L bottle)';
COMMENT ON COLUMN shopping.shopping_items.pc_unit IS 'Standard unit for piece conversion (e.g. L for a 1L bottle)';
