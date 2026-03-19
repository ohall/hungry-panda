import type { PromptSettings, RecipeSuggestion } from '$lib/types';

const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

function stripCodeFences(value: string) {
	return value.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
}

function fallbackIdeas(): RecipeSuggestion[] {
	return [];
}

export function buildRecipePrompt(settings: PromptSettings, dayName: string) {
	return [
		`Generate 3 family dinner ideas for ${dayName}.`,
		`Return strict JSON with an array called recipes.`,
		`Use ${settings.servings} servings and keep prep under ${settings.maxPrepMinutes} minutes.`,
		`Prioritize: ${settings.positivePrompts.join(', ') || 'balanced dinners'}.`,
		`Avoid: ${settings.avoidPrompts.join(', ') || 'none'}.`,
		`Preferred cuisines: ${settings.cuisines.join(', ') || 'any'}.`,
		`Pantry staples: ${settings.pantryStaples.join(', ') || 'none provided'}.`,
		`Dietary preferences: ${settings.dietaryPreferences.join(', ') || 'none provided'}.`,
		`Additional notes: ${settings.notes || 'none'}.`,
		`Each recipe needs name, description, prep_time, cook_time, servings, and ingredients with name/amount/unit.`
	].join(' ');
}

export async function generateRecipeIdeas(settings: PromptSettings, dayName: string) {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		return fallbackIdeas();
	}

	const model = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini';
	const prompt = buildRecipePrompt(settings, dayName);

	const response = await fetch(openRouterUrl, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': process.env.OPENROUTER_APP_URL ?? 'http://localhost:5173',
			'X-Title': process.env.OPENROUTER_APP_NAME ?? 'Hungry Panda'
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: 'system',
					content:
						'You generate realistic family dinner ideas. Return only valid JSON that matches the requested schema.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			response_format: {
				type: 'json_schema',
				json_schema: {
					name: 'recipe_suggestions',
					strict: true,
					schema: {
						type: 'object',
						properties: {
							recipes: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										name: { type: 'string' },
										description: { type: 'string' },
										prep_time: { type: 'number' },
										cook_time: { type: 'number' },
										servings: { type: 'number' },
										ingredients: {
											type: 'array',
											items: {
												type: 'object',
												properties: {
													name: { type: 'string' },
													amount: { type: 'string' },
													unit: { type: 'string' }
												},
												required: ['name', 'amount', 'unit'],
												additionalProperties: false
											}
										}
									},
									required: ['name', 'description', 'prep_time', 'cook_time', 'servings', 'ingredients'],
									additionalProperties: false
								}
							}
						},
						required: ['recipes'],
						additionalProperties: false
					}
				}
			}
		})
	});

	if (!response.ok) {
		return fallbackIdeas();
	}

	const payload = await response.json();
	const rawContent = payload?.choices?.[0]?.message?.content;
	if (typeof rawContent !== 'string') {
		return fallbackIdeas();
	}

	try {
		const parsed = JSON.parse(stripCodeFences(rawContent));
		const recipes = Array.isArray(parsed?.recipes) ? parsed.recipes : [];
		return recipes.map((recipe: Record<string, unknown>, index: number) => ({
			id: `generated-${dayName.toLowerCase()}-${index + 1}-${String(recipe.name ?? 'idea')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')}`,
			name: String(recipe.name ?? 'Recipe Idea'),
			description: String(recipe.description ?? ''),
			ingredients: Array.isArray(recipe.ingredients)
				? recipe.ingredients.map((item) => ({
						name: String((item as Record<string, unknown>).name ?? ''),
						amount: String((item as Record<string, unknown>).amount ?? ''),
						unit: String((item as Record<string, unknown>).unit ?? '')
					}))
				: [],
			prep_time: Number(recipe.prep_time ?? settings.maxPrepMinutes),
			cook_time: Number(recipe.cook_time ?? 20),
			servings: Number(recipe.servings ?? settings.servings),
			is_favorite: false,
			source: 'generated' as const
		}));
	} catch {
		return fallbackIdeas();
	}
}
