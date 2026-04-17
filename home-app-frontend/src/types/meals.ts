export interface MealTimeSchedule {
  id?: number;
  dayOfWeek: number;
  startTime: string; // ISO 8601 time string
}

export interface MealTime {
  id?: number;
  name: string;
  sortOrder: number;
  schedules: MealTimeSchedule[];
  version?: number;
}

export interface MealPlanEntryRecipe {
  id?: number;
  recipeId: number;
  recipeName?: string;
  userId?: number;
  userName?: string;
}

export interface MealPlanEntry {
  id?: number;
  mealTimeId: number;
  mealTimeName?: string;
  dayOfWeek: number;
  isDone: boolean;
  recipes: MealPlanEntryRecipe[];
  thumbsUpCount?: number;
  thumbsDownCount?: number;
}

export interface MealPlan {
  id?: number;
  weekStartDate: string; // ISO date
  status: 'PENDING' | 'PUBLISHED' | 'ACCEPTED' | 'CHANGED';
  entries: MealPlanEntry[];
  version?: number;
}

export interface MealPlanExportItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
  existingQuantity: number;
}
