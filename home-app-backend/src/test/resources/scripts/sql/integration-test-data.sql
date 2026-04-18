-- Target specific test rows to ensure a fresh state
DELETE FROM notifications.notifications WHERE title IN ('Unread Notif', 'Read Notif', 'Manual Notif');
DELETE FROM notifications.messages WHERE content = 'Hello there!';
DELETE FROM meals.meal_plan_entry_recipes WHERE entry_id IN (SELECT id FROM meals.meal_plan_entries WHERE plan_id IN (SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-20'));
DELETE FROM meals.meal_plan_entries WHERE plan_id IN (SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-20');
DELETE FROM meals.meal_plans WHERE week_start_date = '2026-04-20';
DELETE FROM recipes.recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes.recipes WHERE name IN ('Integration Test Pancakes', 'Test Pasta'));
DELETE FROM recipes.recipe_labels WHERE recipe_id IN (SELECT id FROM recipes.recipes WHERE name IN ('Integration Test Pancakes', 'Test Pasta'));
DELETE FROM recipes.recipes WHERE name IN ('Integration Test Pancakes', 'Test Pasta');
DELETE FROM recipes.nutrition_entries WHERE item_id IN (SELECT id FROM shopping.shopping_items WHERE name IN ('All-purpose Flour', 'Large Egg'));
DELETE FROM shopping.shopping_items WHERE name IN ('All-purpose Flour', 'Large Egg');

-- Test Users (using ON CONFLICT because email is unique)
INSERT INTO profiles.user (email, first_name, last_name, enabled) VALUES
('recipeuser@example.com', 'Recipe', 'User', true),
('planner@example.com', 'Planner', 'User', true),
('household@example.com', 'Household', 'Member', true),
('sender@example.com', 'Sender', 'User', true),
('receiver@example.com', 'Receiver', 'User', true)
ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name;

-- Shopping Category
INSERT INTO shopping.shopping_categories (name, description) VALUES
('Test Ingredients', 'Category for integration tests')
ON CONFLICT (name) DO NOTHING;

-- Shopping Items
INSERT INTO shopping.shopping_items (name, category_id, nutrition_sample_size, nutrition_sample_unit) VALUES
('All-purpose Flour', (SELECT id FROM shopping.shopping_categories WHERE name = 'Test Ingredients'), 100.00, 'g'),
('Large Egg', (SELECT id FROM shopping.shopping_categories WHERE name = 'Test Ingredients'), 1.00, 'pcs');

-- Nutrients
INSERT INTO recipes.nutrients (name, unit) VALUES
('Energy', 'kcal'),
('Protein', 'g'),
('Carbohydrate', 'g')
ON CONFLICT (name) DO UPDATE SET unit = EXCLUDED.unit;

-- Nutrition Entries
INSERT INTO recipes.nutrition_entries (item_id, nutrient_id, value) VALUES
((SELECT id FROM shopping.shopping_items WHERE name = 'All-purpose Flour' LIMIT 1), (SELECT id FROM recipes.nutrients WHERE name = 'Energy' LIMIT 1), 364.00),
((SELECT id FROM shopping.shopping_items WHERE name = 'All-purpose Flour' LIMIT 1), (SELECT id FROM recipes.nutrients WHERE name = 'Protein' LIMIT 1), 10.33),
((SELECT id FROM shopping.shopping_items WHERE name = 'Large Egg' LIMIT 1), (SELECT id FROM recipes.nutrients WHERE name = 'Energy' LIMIT 1), 78.00),
((SELECT id FROM shopping.shopping_items WHERE name = 'Large Egg' LIMIT 1), (SELECT id FROM recipes.nutrients WHERE name = 'Protein' LIMIT 1), 6.29);

-- Recipes
INSERT INTO recipes.recipes (name, description, servings, created_by) VALUES
('Integration Test Pancakes', 'Classic breakfast pancakes', 4, (SELECT id FROM profiles.user WHERE email = 'recipeuser@example.com')),
('Test Pasta', 'Simple pasta', 2, (SELECT id FROM profiles.user WHERE email = 'planner@example.com'));

-- Ingredients
INSERT INTO recipes.recipe_ingredients (recipe_id, item_id, quantity) VALUES
((SELECT id FROM recipes.recipes WHERE name = 'Integration Test Pancakes' LIMIT 1), (SELECT id FROM shopping.shopping_items WHERE name = 'All-purpose Flour' LIMIT 1), 200.00),
((SELECT id FROM recipes.recipes WHERE name = 'Integration Test Pancakes' LIMIT 1), (SELECT id FROM shopping.shopping_items WHERE name = 'Large Egg' LIMIT 1), 2.00);

-- Meal Plan
INSERT INTO meals.meal_plans (week_start_date, status) VALUES
('2026-04-20', 'PENDING');

INSERT INTO meals.meal_plan_entries (plan_id, meal_time_id, day_of_week) VALUES
((SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-20' LIMIT 1), (SELECT id FROM meals.meal_times WHERE name = 'Dinner' LIMIT 1), 1);

INSERT INTO meals.meal_plan_entry_recipes (entry_id, recipe_id) VALUES
((SELECT id FROM meals.meal_plan_entries WHERE plan_id = (SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-20' LIMIT 1) AND day_of_week = 1 LIMIT 1), (SELECT id FROM recipes.recipes WHERE name = 'Test Pasta' LIMIT 1));

-- Notifications
INSERT INTO notifications.notifications (recipient_id, sender_id, type, title, message, is_read) VALUES
((SELECT id FROM profiles.user WHERE email = 'receiver@example.com'), (SELECT id FROM profiles.user WHERE email = 'sender@example.com'), 'TEST', 'Unread Notif', 'This is unread', false),
((SELECT id FROM profiles.user WHERE email = 'receiver@example.com'), (SELECT id FROM profiles.user WHERE email = 'sender@example.com'), 'TEST', 'Read Notif', 'This is read', true);

INSERT INTO notifications.messages (sender_id, recipient_id, content, is_read) VALUES
((SELECT id FROM profiles.user WHERE email = 'sender@example.com'), (SELECT id FROM profiles.user WHERE email = 'receiver@example.com'), 'Hello there!', false);
