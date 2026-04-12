-- Liquibase ChangeSet: 13-add-barcode-to-coupons
-- Description: Add code and barcode_type fields to coupons table

ALTER TABLE shopping.coupons
ADD COLUMN code VARCHAR(100),
ADD COLUMN barcode_type VARCHAR(20) DEFAULT 'CODE_128';
