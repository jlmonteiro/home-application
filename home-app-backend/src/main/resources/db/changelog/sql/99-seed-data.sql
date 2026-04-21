-- liquibase formatted sql

-- changeset consolidated:99-seed-data
INSERT INTO shopping.shopping_categories (name, description, icon) VALUES
('Fruits & Vegetables', 'Fresh produce, fruits, and vegetables', 'IconApple'),
('Dairy & Eggs', 'Milk, cheese, yogurt, and eggs', 'IconEgg'),
('Meat & Poultry', 'Beef, chicken, pork, and other meats', 'IconMeat'),
('Bakery & Bread', 'Fresh bread, pastries, and baked goods', 'IconBread'),
('Pantry & Grains', 'Rice, pasta, flour, canned goods, and spices', 'IconPaperBag'),
('Frozen Foods', 'Frozen meals, vegetables, and ice cream', 'IconSnowflake'),
('Beverages', 'Water, juice, soda, coffee, and tea', 'IconBottle'),
('Snacks & Sweets', 'Chips, chocolate, cookies, and nuts', 'IconCandy'),
('Household & Cleaning', 'Cleaning supplies, paper towels, and laundry detergent', 'IconWashDry1'),
('Personal Care', 'Shampoo, soap, toothpaste, and pharmacy items', 'IconMedicineSyrup'),
('Baby Care', 'Diapers, wipes, and baby food', 'IconBabyCarriage'),
('Pet Supplies', 'Pet food, toys, and care items', 'IconPaw'),
('Dry Goods & Seasoning', 'Spices, herbs, and other dry pantry items', 'IconSalt')
ON CONFLICT (name) DO NOTHING;

-- Update store table to use these names
INSERT INTO shopping.shopping_stores (name, description, icon, photo) VALUES
('Tesco', 'Large international grocery and general merchandise retailer.', 'IconBuildingStore', 'tesco-logo.svg'),
('Marks & Spencer', 'Premium retailer specializing in high-quality food and clothing.', 'IconBuildingStore', 'ms-logo.svg'),
('Lidl', 'International discount supermarket chain.', 'IconBuildingStore', 'lidl-logo.svg'),
('Aldi', 'Global discount supermarket chain known for high quality at low prices.', 'IconBuildingStore', 'aldi-logo.svg'),
('Dunnes Stores', 'Leading Irish retail chain offering food, clothes, and homeware.', 'IconBuildingStore', 'dunnes-logo.svg'),
('SuperValu', 'Irish supermarket brand owned by Musgrave Group.', 'IconBuildingStore', 'supervalu-logo.svg')
ON CONFLICT (name) DO UPDATE SET photo = EXCLUDED.photo;
