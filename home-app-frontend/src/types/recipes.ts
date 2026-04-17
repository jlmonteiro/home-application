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
}
