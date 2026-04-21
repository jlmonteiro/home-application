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
  recipe: {
    id: number;
    name: string;
  };
  users: {
    id: number;
    name: string;
    photo?: { data?: string; url?: string };
  }[];
  multiplier?: number;
}

export interface MealPlanEntryItem {
  id?: number;
  item: {
    id: number;
    name: string;
    photo?: { data?: string; url?: string };
    unit: string;
  };
  users: {
    id: number;
    name: string;
    photo?: { data?: string; url?: string };
  }[];
  quantity: number;
  unit: string;
}

export interface MealPlanEntry {
  id?: number;
  mealTimeId: number;
  mealTimeName?: string;
  dayOfWeek: number;
  isDone: boolean;
  recipes: MealPlanEntryRecipe[];
  items: MealPlanEntryItem[];
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
  };
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
  itemPhoto?: { data?: string; url?: string };
  quantity: number;
  unit: string;
  existingQuantity: number;
  storeId?: number;
  suggestedPrice?: number;
}
