--liquibase formatted sql

--changeset jorge:15-move-unit-to-shopping-item
-- 1. Add unit column to shopping_items
ALTER TABLE shopping.shopping_items ADD COLUMN unit VARCHAR(20) NOT NULL DEFAULT 'pcs';

-- 2. Migrate data from shopping_list_items to shopping_items (take the most common or first found unit)
-- This is a heuristic since the requirement is that it should ALWAYS be the same.
UPDATE shopping.shopping_items si
SET unit = (
    SELECT sli.unit 
    FROM shopping.shopping_list_items sli 
    WHERE sli.item_id = si.id 
    LIMIT 1
)
WHERE si.id IN (SELECT item_id FROM shopping.shopping_list_items);

-- 3. If still null (not in any list), try to get from recipe_ingredients
UPDATE shopping.shopping_items si
SET unit = (
    SELECT ri.unit 
    FROM recipes.recipe_ingredients ri 
    WHERE ri.item_id = si.id 
    LIMIT 1
)
WHERE si.unit = 'pcs' AND si.id IN (SELECT item_id FROM recipes.recipe_ingredients);

-- 4. Remove unit from shopping_list_items
ALTER TABLE shopping.shopping_list_items DROP COLUMN unit;

-- 5. Remove unit from recipe_ingredients
ALTER TABLE recipes.recipe_ingredients DROP COLUMN unit;
