--liquibase formatted sql

--changeset jorge:10-seed-irish-stores-v3
DELETE FROM shopping.shopping_stores;

INSERT INTO shopping.shopping_stores (name, description, icon, photo) VALUES
('Tesco', 'Large international grocery and general merchandise retailer.', 'IconBuildingStore', '/logos/tesco.svg'),
('Marks & Spencer', 'Premium retailer specializing in high-quality food and clothing.', 'IconBuildingStore', '/logos/marks_and_spencer.svg'),
('Lidl', 'International discount supermarket chain.', 'IconBuildingStore', '/logos/lidl.svg'),
('Aldi', 'Global discount supermarket chain known for high quality at low prices.', 'IconBuildingStore', '/logos/aldi.svg'),
('Dunnes Stores', 'Leading Irish retail chain offering food, clothes, and homeware.', 'IconBuildingStore', '/logos/dunnes_stores.webp'),
('SuperValu', 'Irish supermarket brand owned by Musgrave Group.', 'IconBuildingStore', '/logos/supervalu.png')
ON CONFLICT (name) DO NOTHING;

--rollback DELETE FROM shopping.shopping_stores WHERE name IN ('Tesco', 'Marks & Spencer', 'Lidl', 'Aldi', 'Dunnes Stores', 'SuperValu');
