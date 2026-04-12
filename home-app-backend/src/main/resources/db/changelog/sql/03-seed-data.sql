--liquibase formatted sql

--changeset jorge:03-seed-shopping-data
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
('Pet Supplies', 'Pet food, toys, and care items', 'IconPaw')
ON CONFLICT (name) DO NOTHING;

INSERT INTO shopping.shopping_stores (name, description, icon, photo) VALUES
('Tesco', 'Large international grocery and general merchandise retailer.', 'IconBuildingStore', '/logos/tesco.svg'),
('Marks & Spencer', 'Premium retailer specializing in high-quality food and clothing.', 'IconBuildingStore', '/logos/marks_and_spencer.svg'),
('Lidl', 'International discount supermarket chain.', 'IconBuildingStore', '/logos/lidl.svg'),
('Aldi', 'Global discount supermarket chain known for high quality at low prices.', 'IconBuildingStore', '/logos/aldi.svg'),
('Dunnes Stores', 'Leading Irish retail chain offering food, clothes, and homeware.', 'IconBuildingStore', '/logos/dunnes_stores.webp'),
('SuperValu', 'Irish supermarket brand owned by Musgrave Group.', 'IconBuildingStore', '/logos/supervalu.png')
ON CONFLICT (name) DO NOTHING;
