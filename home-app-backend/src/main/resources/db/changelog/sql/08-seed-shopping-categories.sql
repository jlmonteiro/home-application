--liquibase formatted sql

--changeset jorge:08-seed-shopping-categories
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

--rollback DELETE FROM shopping.shopping_categories WHERE name IN ('Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Poultry', 'Bakery & Bread', 'Pantry & Grains', 'Frozen Foods', 'Beverages', 'Snacks & Sweets', 'Household & Cleaning', 'Personal Care', 'Baby Care', 'Pet Supplies');
