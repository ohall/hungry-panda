import { json } from '@sveltejs/kit';
import { generateRecipeIdeas, buildRecipePrompt } from '$lib/server/openrouter';
import {
	getPromptSettings,
	getSavedRecipeSuggestions,
	mergeRecipeSuggestions
} from '$lib/server/recipe-store';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const dayName = url.searchParams.get('dayName') ?? 'Tonight';
	const settings = await getPromptSettings();
	const [savedRecipes, generatedRecipes] = await Promise.all([
		getSavedRecipeSuggestions(settings.householdId, 3),
		generateRecipeIdeas(settings, dayName)
	]);

	return json({
		dayName,
		promptPreview: buildRecipePrompt(settings, dayName),
		savedRecipes,
		generatedRecipes,
		combinedRecipes: mergeRecipeSuggestions(savedRecipes, generatedRecipes)
	});
};
