export interface RecipePhoto {
  id?: number;
  photoData?: string; // Kept for backward compatibility if needed
  photoUrl?: string;  // New centralized binary storage URL
  isDefault: boolean;
  version?: number;
}


export interface Label {
  id?: number;
  name: string;
  version?: number;
}


export interface Nutrient {
  id?: number;
  name: string;
  description?: string;
  unit: string;
  version?: number;
}

export interface NutritionEntry {
  id?: number;
  nutrientId: number;
  nutrientName?: string;
  value: number;
  unit?: string;
}

export interface RecipeStep {
  id?: number;
  instruction: string;
  timeMinutes?: number;
  sortOrder: number;
}

export interface RecipeIngredient {
  id?: number;
  item: {
    id: number;
    name: string;
    photo: { url: string | null } | null;
    unit: string;
  };
  quantity: number;
  unit: string;
  groupName?: string;
  nutritionEntries?: NutritionEntry[];
}

export interface RecipeComment {
  id?: number;
  userId?: number;
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
