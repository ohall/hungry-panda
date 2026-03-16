export interface Ingredient {
	name: string;
	amount?: string;
	unit?: string;
	category?: string;
}

export interface User {
	id: string;
	email: string;
	created_at: string;
}

export interface Household {
	id: string;
	name: string;
	created_by: string;
	created_at: string;
}

export interface HouseholdMember {
	id: string;
	household_id: string;
	user_id: string;
	role: 'owner' | 'member';
	joined_at: string;
}

export interface PromptSettings {
	householdId: string;
	positivePrompts: string[];
	avoidPrompts: string[];
	cuisines: string[];
	pantryStaples: string[];
	dietaryPreferences: string[];
	maxPrepMinutes: number;
	servings: number;
	notes: string;
	updatedAt: string;
}

export interface Recipe {
	id: string;
	household_id: string;
	name: string;
	description?: string;
	ingredients: Ingredient[];
	instructions?: string;
	prep_time?: number;
	cook_time?: number;
	servings?: number;
	image_url?: string;
	is_favorite: boolean;
	is_disliked?: boolean;
	last_planned_at?: string | null;
	times_served?: number;
	source?: 'saved' | 'generated';
	created_at: string;
	updated_at: string;
}

export interface MealPlan {
	id: string;
	household_id: string;
	week_start_date: string;
	created_at: string;
	updated_at: string;
}

export interface Meal {
	id: string;
	plan_id: string;
	day_of_week: number;
	recipe_id: string;
	status: 'suggested' | 'confirmed' | 'skipped';
	created_at: string;
}

export interface MealAssignment {
	dayIndex: number;
	dayName: string;
	recipeId: string;
	recipeName: string;
	source: RecipeSource;
	savedAt: string;
}

export interface ShoppingListItem {
	id: string;
	household_id: string;
	name: string;
	category: string;
	quantity: string;
	checked: boolean;
	source_meal_id?: string;
	is_misc: boolean;
	created_at: string;
	updated_at: string;
}

export interface DietaryPreference {
	id: string;
	household_id: string;
	preference_type: 'restriction' | 'preference';
	name: string;
	value: string;
}

export type RecipeSource = 'saved' | 'generated';

export interface RecipeSuggestion {
	id: string;
	name: string;
	description?: string;
	ingredients: Ingredient[];
	prep_time?: number;
	cook_time?: number;
	servings?: number;
	is_favorite: boolean;
	is_disliked?: boolean;
	last_planned_at?: string | null;
	times_served?: number;
	source: RecipeSource;
}

export interface RecipeSuggestionsResponse {
	dayName: string;
	promptPreview: string;
	savedRecipes: RecipeSuggestion[];
	generatedRecipes: RecipeSuggestion[];
	combinedRecipes: RecipeSuggestion[];
}

export interface SettingsPayload {
	settings: PromptSettings;
}

export interface FeedbackPayload {
	recipe: RecipeSuggestion;
	action: 'favorite' | 'dislike';
}

export interface MealSelectionPayload {
	dayIndex: number;
	dayName: string;
	recipe: RecipeSuggestion;
}
