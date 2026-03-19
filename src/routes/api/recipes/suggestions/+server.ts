import { json } from '@sveltejs/kit';
import { generateRecipeIdeas, buildRecipePrompt } from '$lib/server/openrouter';
import {
	getPromptSettings,
	getFavoriteRecipeSuggestions,
	getSavedRecipeSuggestions,
	mergeRecipeSuggestions
} from '$lib/server/recipe-store';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const dayName = url.searchParams.get('dayName') ?? 'Tonight';
	const settings = await getPromptSettings();
	const [savedRecipes, favoriteRecipes, generatedRecipes] = await Promise.all([
		getSavedRecipeSuggestions(settings.householdId, 8, 3),
		getFavoriteRecipeSuggestions(settings.householdId, 3),
		generateRecipeIdeas(settings, dayName)
	]);
	const combinedSavedRecipes = mergeRecipeSuggestions(favoriteRecipes, savedRecipes).slice(0, 8);

	return json({
		dayName,
		promptPreview: buildRecipePrompt(settings, dayName),
		savedRecipes: combinedSavedRecipes,
		generatedRecipes,
		combinedRecipes: mergeRecipeSuggestions(combinedSavedRecipes, generatedRecipes)
	});
};
