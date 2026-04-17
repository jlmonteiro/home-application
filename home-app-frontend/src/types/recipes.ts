export interface RecipePhoto {
  id?: number;
  photoData: string;
  isDefault: boolean;
  version?: number;
}

export interface Label {
  id?: number;
  name: string;
}

export interface NutritionEntry {
  id?: number;
  nutrientKey: string;
  value: number;
  unit: string;
}

export interface RecipeStep {
  id?: number;
  instruction: string;
  timeMinutes?: number;
  sortOrder: number;
}

export interface RecipeIngredient {
  id?: number;
  itemId: number;
  itemName?: string;
  quantity: number;
  unit: string;
  nutritionEntries?: NutritionEntry[];
}

export interface RecipeComment {
  id?: number;
  userName: string;
  userPhoto?: string;
  comment: string;
  createdAt: string;
}

export interface RecipeRating {
  id?: number;
  userName?: string;
  rating: number;
  createdAt?: string;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  servings: number;
  sourceLink?: string;
  videoLink?: string;
  prepTimeMinutes: number;
  createdBy: string;
  version: number;
  labels: string[];
  photos: RecipePhoto[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  averageRating: number;
  comments: RecipeComment[];
  ratings: RecipeRating[];
  nutritionTotals?: NutritionEntry[];
}
