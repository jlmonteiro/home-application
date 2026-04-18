--liquibase formatted sql

--changeset jorge:18-add-ingredient-group-name
-- 1. Add group_name column to recipe_ingredients
ALTER TABLE recipes.recipe_ingredients ADD COLUMN group_name VARCHAR(50);

-- 2. Add index for better performance when fetching recipe ingredients
CREATE INDEX idx_recipe_ingredients_recipe_group ON recipes.recipe_ingredients(recipe_id, group_name);
