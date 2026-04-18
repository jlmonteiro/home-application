-- Meal Plan Export Service Test Data
-- Clean up existing test data
DELETE FROM meals.meal_plan_entry_recipes WHERE entry_id IN (
    SELECT id FROM meals.meal_plan_entries WHERE plan_id IN (SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-25')
);
DELETE FROM meals.meal_plan_entries WHERE plan_id IN (SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-25');
DELETE FROM meals.meal_plans WHERE week_start_date = '2026-04-25';

-- Create test user
INSERT INTO profiles.user (email, first_name, last_name, enabled) VALUES
('export-test@example.com', 'Export', 'Test', true)
ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name;

-- Create shopping items
INSERT INTO shopping.shopping_items (name, unit, category_id) VALUES
('Flour', 'g', (SELECT id FROM shopping.shopping_categories WHERE name = 'Pantry & Grains' LIMIT 1)),
('Eggs', 'pcs', (SELECT id FROM shopping.shopping_categories WHERE name = 'Dairy & Eggs' LIMIT 1))
ON CONFLICT (name, category_id) DO NOTHING;

-- Create recipe
INSERT INTO recipes.recipes (name, description, servings, created_by, prep_time_minutes) VALUES
('Test Pancakes', 'Test recipe', 4, (SELECT id FROM profiles.user WHERE email = 'export-test@example.com' LIMIT 1), 15)
ON CONFLICT DO NOTHING;

-- Create recipe ingredients
INSERT INTO recipes.recipe_ingredients (recipe_id, item_id, quantity) VALUES
((SELECT id FROM recipes.recipes WHERE name = 'Test Pancakes' LIMIT 1), (SELECT id FROM shopping.shopping_items WHERE name = 'Flour' LIMIT 1), 200.00),
((SELECT id FROM recipes.recipes WHERE name = 'Test Pancakes' LIMIT 1), (SELECT id FROM shopping.shopping_items WHERE name = 'Eggs' LIMIT 1), 2.00)
ON CONFLICT DO NOTHING;

-- Create meal plan
INSERT INTO meals.meal_plans (week_start_date, status) VALUES
('2026-04-25', 'PENDING')
ON CONFLICT (week_start_date) DO NOTHING;

-- Get existing meal time (Breakfast)
-- Create entry with recipe assignment
INSERT INTO meals.meal_plan_entries (plan_id, meal_time_id, day_of_week) VALUES
((SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-25' LIMIT 1), 
 (SELECT id FROM meals.meal_times WHERE name = 'Breakfast' LIMIT 1), 0)
ON CONFLICT (plan_id, meal_time_id, day_of_week) DO NOTHING;

INSERT INTO meals.meal_plan_entry_recipes (entry_id, recipe_id) VALUES
((SELECT id FROM meals.meal_plan_entries WHERE plan_id = (SELECT id FROM meals.meal_plans WHERE week_start_date = '2026-04-25' LIMIT 1) AND day_of_week = 0 LIMIT 1), 
 (SELECT id FROM recipes.recipes WHERE name = 'Test Pancakes' LIMIT 1))
ON CONFLICT DO NOTHING;
