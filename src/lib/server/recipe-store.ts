import { hasSupabaseEnv, supabase } from '$lib/supabase';
import type {
	MealAssignment,
	MealSelectionPayload,
	PromptSettings,
	Recipe,
	RecipeSuggestion
} from '$lib/types';

const householdId = 'demo-household';

const now = () => new Date().toISOString();

let fallbackSettings: PromptSettings = {
	householdId,
	positivePrompts: ['kid-friendly dinners', 'high-protein meals'],
	avoidPrompts: ['mushrooms'],
	cuisines: ['Italian', 'Mexican'],
	pantryStaples: ['rice', 'pasta', 'eggs'],
	dietaryPreferences: ['family-style servings'],
	maxPrepMinutes: 35,
	servings: 4,
	notes: 'Keep weeknight recipes practical for two adults and two kids.',
	updatedAt: now()
};

let fallbackRecipes: Recipe[] = [];

let fallbackAssignments: MealAssignment[] = [];

function normalizeRecipe(recipe: Recipe | RecipeSuggestion): RecipeSuggestion {
	return {
		id: recipe.id,
		name: recipe.name,
		description: recipe.description,
		ingredients: recipe.ingredients ?? [],
		prep_time: recipe.prep_time,
		cook_time: recipe.cook_time,
		servings: recipe.servings,
		is_favorite: recipe.is_favorite,
		is_disliked: recipe.is_disliked ?? false,
		last_planned_at: recipe.last_planned_at ?? null,
		times_served: recipe.times_served ?? 0,
		source: recipe.source ?? 'saved'
	};
}

function dedupeRecipes(recipes: RecipeSuggestion[]): RecipeSuggestion[] {
	const seen = new Set<string>();
	return recipes.filter((recipe) => {
		const key = recipe.name.trim().toLowerCase();
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

function sortSavedRecipes(recipes: RecipeSuggestion[]): RecipeSuggestion[] {
	return [...recipes].sort((left, right) => {
		const favoriteScore = Number(right.is_favorite) - Number(left.is_favorite);
		if (favoriteScore !== 0) {
			return favoriteScore;
		}

		const leftDate = left.last_planned_at ? new Date(left.last_planned_at).getTime() : 0;
		const rightDate = right.last_planned_at ? new Date(right.last_planned_at).getTime() : 0;
		return leftDate - rightDate;
	});
}

export function getDefaultHouseholdId() {
	return householdId;
}

export async function getPromptSettings(activeHouseholdId = householdId): Promise<PromptSettings> {
	if (hasSupabaseEnv && supabase) {
		const { data } = await supabase
			.from('prompt_settings')
			.select('*')
			.eq('household_id', activeHouseholdId)
			.maybeSingle();

		if (data) {
			return {
				householdId: data.household_id,
				positivePrompts: data.positive_prompts,
				avoidPrompts: data.avoid_prompts,
				cuisines: data.cuisines,
				pantryStaples: data.pantry_staples,
				dietaryPreferences: data.dietary_preferences,
				maxPrepMinutes: data.max_prep_minutes,
				servings: data.servings,
				notes: data.notes,
				updatedAt: data.updated_at
			};
		}
	}

	return fallbackSettings;
}

export async function savePromptSettings(settings: PromptSettings): Promise<PromptSettings> {
	const updatedSettings = {
		...settings,
		updatedAt: now()
	};

	if (hasSupabaseEnv && supabase) {
		await supabase.from('prompt_settings').upsert({
			household_id: updatedSettings.householdId,
			positive_prompts: updatedSettings.positivePrompts,
			avoid_prompts: updatedSettings.avoidPrompts,
			cuisines: updatedSettings.cuisines,
			pantry_staples: updatedSettings.pantryStaples,
			dietary_preferences: updatedSettings.dietaryPreferences,
			max_prep_minutes: updatedSettings.maxPrepMinutes,
			servings: updatedSettings.servings,
			notes: updatedSettings.notes,
			updated_at: updatedSettings.updatedAt
		});
	}

	fallbackSettings = updatedSettings;
	return updatedSettings;
}

export async function getSavedRecipeSuggestions(
	activeHouseholdId = householdId,
	limit = 6,
	favoriteTarget = 2
): Promise<RecipeSuggestion[]> {
	if (hasSupabaseEnv && supabase) {
		const favoriteLimit = Math.min(limit, Math.max(favoriteTarget, 0));
		const [favoriteResult, additionalResult] = await Promise.all([
			supabase
				.from('recipes')
				.select('*')
				.eq('household_id', activeHouseholdId)
				.eq('is_disliked', false)
				.eq('is_favorite', true)
				.order('last_planned_at', { ascending: true, nullsFirst: true })
				.limit(favoriteLimit),
			supabase
				.from('recipes')
				.select('*')
				.eq('household_id', activeHouseholdId)
				.eq('is_disliked', false)
				.order('is_favorite', { ascending: false })
				.order('last_planned_at', { ascending: true, nullsFirst: true })
				.limit(Math.max(limit, favoriteLimit))
		]);

		const favorites = (favoriteResult.data ?? []).map((recipe) =>
			normalizeRecipe({
				...recipe,
				ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
				source: 'saved'
			} as Recipe)
		);
		const additional = (additionalResult.data ?? []).map((recipe) =>
			normalizeRecipe({
				...recipe,
				ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
				source: 'saved'
			} as Recipe)
		);
		const combined = dedupeRecipes([...favorites, ...additional]).slice(0, limit);
		if (combined.length > 0) {
			return combined;
		}
	}

	const candidates = fallbackRecipes
		.filter((recipe) => recipe.household_id === activeHouseholdId && !recipe.is_disliked)
		.map(normalizeRecipe);

	const favorites = sortSavedRecipes(candidates.filter((recipe) => recipe.is_favorite)).slice(
		0,
		Math.min(limit, Math.max(favoriteTarget, 0))
	);
	const additional = sortSavedRecipes(candidates);
	return dedupeRecipes([...favorites, ...additional]).slice(0, limit);
}

export async function getFavoriteRecipeSuggestions(
	activeHouseholdId = householdId,
	limit = 2
): Promise<RecipeSuggestion[]> {
	if (hasSupabaseEnv && supabase) {
		const { data } = await supabase
			.from('recipes')
			.select('*')
			.eq('household_id', activeHouseholdId)
			.eq('is_disliked', false)
			.eq('is_favorite', true)
			.order('last_planned_at', { ascending: true, nullsFirst: true })
			.limit(limit);

		if (data?.length) {
			return data.map((recipe) =>
				normalizeRecipe({
					...recipe,
					ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
					source: 'saved'
				} as Recipe)
			);
		}
	}

	return sortSavedRecipes(
		fallbackRecipes
			.filter((recipe) => recipe.household_id === activeHouseholdId && !recipe.is_disliked && recipe.is_favorite)
			.map(normalizeRecipe)
	).slice(0, limit);
}

export async function saveRecipeFeedback(recipe: RecipeSuggestion, action: 'favorite' | 'dislike') {
	const timestamp = now();
	const recipeToPersist: Recipe = {
		id: recipe.id,
		household_id: householdId,
		name: recipe.name,
		description: recipe.description,
		ingredients: recipe.ingredients,
		prep_time: recipe.prep_time,
		cook_time: recipe.cook_time,
		servings: recipe.servings,
		is_favorite: action === 'favorite',
		is_disliked: action === 'dislike',
		last_planned_at: recipe.last_planned_at ?? null,
		times_served: recipe.times_served ?? 0,
		source: 'saved',
		created_at: timestamp,
		updated_at: timestamp
	};

	if (hasSupabaseEnv && supabase) {
		await supabase.from('recipes').upsert({
			id: recipeToPersist.id,
			household_id: recipeToPersist.household_id,
			name: recipeToPersist.name,
			description: recipeToPersist.description ?? null,
			ingredients: recipeToPersist.ingredients,
			prep_time: recipeToPersist.prep_time ?? null,
			cook_time: recipeToPersist.cook_time ?? null,
			servings: recipeToPersist.servings ?? null,
			is_favorite: recipeToPersist.is_favorite,
			is_disliked: recipeToPersist.is_disliked ?? false,
			last_planned_at: recipeToPersist.last_planned_at ?? null,
			times_served: recipeToPersist.times_served ?? 0,
			updated_at: timestamp
		});
	}

	const existingIndex = fallbackRecipes.findIndex((item) => item.id === recipe.id);
	if (existingIndex >= 0) {
		fallbackRecipes[existingIndex] = {
			...fallbackRecipes[existingIndex],
			...recipeToPersist,
			created_at: fallbackRecipes[existingIndex].created_at,
			updated_at: timestamp
		};
	} else if (action === 'favorite') {
		fallbackRecipes = [...fallbackRecipes, recipeToPersist];
	}

	return normalizeRecipe(recipeToPersist);
}

export async function saveMealSelection(payload: MealSelectionPayload): Promise<MealAssignment> {
	const savedAt = now();
	const assignment: MealAssignment = {
		dayIndex: payload.dayIndex,
		dayName: payload.dayName,
		recipeId: payload.recipe.id,
		recipeName: payload.recipe.name,
		source: payload.recipe.source,
		savedAt
	};

	if (hasSupabaseEnv && supabase) {
		await supabase.from('meal_assignments').upsert({
			household_id: householdId,
			day_index: payload.dayIndex,
			day_name: payload.dayName,
			recipe_id: payload.recipe.id,
			recipe_name: payload.recipe.name,
			source: payload.recipe.source,
			saved_at: savedAt
		});

		if (payload.recipe.source === 'saved') {
			await supabase
				.from('recipes')
				.update({
					last_planned_at: savedAt,
					times_served: (payload.recipe.times_served ?? 0) + 1,
					updated_at: savedAt
				})
				.eq('id', payload.recipe.id);
		}
	}

	const existingIndex = fallbackRecipes.findIndex((recipe) => recipe.id === payload.recipe.id);
	if (existingIndex >= 0) {
		fallbackRecipes[existingIndex] = {
			...fallbackRecipes[existingIndex],
			last_planned_at: savedAt,
			times_served: (fallbackRecipes[existingIndex].times_served ?? 0) + 1,
			updated_at: savedAt
		};
	}

	fallbackAssignments = [
		...fallbackAssignments.filter((item) => item.dayIndex !== payload.dayIndex),
		assignment
	];

	return assignment;
}

export async function getMealAssignments() {
	if (hasSupabaseEnv && supabase) {
		const { data } = await supabase
			.from('meal_assignments')
			.select('*')
			.eq('household_id', householdId)
			.order('day_index', { ascending: true });

		if (data) {
			return data.map((item) => ({
				dayIndex: item.day_index,
				dayName: item.day_name,
				recipeId: item.recipe_id,
				recipeName: item.recipe_name,
				source: item.source,
				savedAt: item.saved_at
			}));
		}
	}

	return [...fallbackAssignments].sort((left, right) => left.dayIndex - right.dayIndex);
}

export function mergeRecipeSuggestions(savedRecipes: RecipeSuggestion[], generatedRecipes: RecipeSuggestion[]) {
	return dedupeRecipes([...savedRecipes, ...generatedRecipes]);
}
