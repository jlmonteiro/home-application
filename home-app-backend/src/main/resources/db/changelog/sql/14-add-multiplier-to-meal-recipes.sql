--liquibase formatted sql

--changeset jorge:14-add-multiplier-to-meal-recipes
ALTER TABLE meals.meal_plan_entry_recipes 
ADD COLUMN multiplier DECIMAL(10,2) NOT NULL DEFAULT 1.0;
