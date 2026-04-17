--liquibase formatted sql

--changeset jorge:17-add-nutrition-sample-size
-- 1. Add sample size fields to shopping_items
ALTER TABLE shopping.shopping_items ADD COLUMN nutrition_sample_size DECIMAL(10, 2) NOT NULL DEFAULT 100.00;
ALTER TABLE shopping.shopping_items ADD COLUMN nutrition_sample_unit VARCHAR(20) NOT NULL DEFAULT 'g';

-- 2. Update existing items to use their master unit as the sample unit where appropriate
UPDATE shopping.shopping_items SET nutrition_sample_unit = unit WHERE unit IN ('g', 'ml', 'kg', 'l');
