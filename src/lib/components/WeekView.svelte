<script lang="ts">
	import DayCard from './DayCard.svelte';
	import Modal from './Modal.svelte';
	import MealSelector from './MealSelector.svelte';
	import type { MealAssignment, RecipeSuggestion, RecipeSuggestionsResponse } from '$lib/types';
	
	const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	
	let selectedDayIndex = $state<number | null>(null);
	let isModalOpen = $state(false);
	let selectedMeals = $state<Record<number, MealAssignment>>({});
	let savedRecipes = $state<RecipeSuggestion[]>([]);
	let generatedRecipes = $state<RecipeSuggestion[]>([]);
	let promptPreview = $state('');
	let loadingSuggestions = $state(false);
	let suggestionError = $state('');
	let suggestionCache = $state<Record<number, RecipeSuggestionsResponse>>({});
	let hasInitialized = $state(false);
	
	let selectedDayName = $derived(
		selectedDayIndex !== null ? days[selectedDayIndex] : ''
	);
	
	function getMealNameForDay(dayIndex: number): string | undefined {
		return selectedMeals[dayIndex]?.recipeName;
	}

	function applySuggestionPayload(payload: RecipeSuggestionsResponse) {
		savedRecipes = payload.savedRecipes;
		generatedRecipes = payload.generatedRecipes;
		promptPreview = payload.promptPreview;
	}

	async function fetchSuggestionPayload(dayIndex: number) {
		const response = await fetch(
			`/api/recipes/suggestions?dayName=${encodeURIComponent(days[dayIndex] ?? 'This week')}`
		);
		if (!response.ok) {
			throw new Error('Unable to load recipes');
		}

		return (await response.json()) as RecipeSuggestionsResponse;
	}

	function cachePoolForAllDays(payload: RecipeSuggestionsResponse) {
		const nextCache: Record<number, RecipeSuggestionsResponse> = {};
		for (const [dayIndex] of days.entries()) {
			nextCache[dayIndex] = payload;
		}
		suggestionCache = nextCache;
	}

	async function loadAssignments() {
		const response = await fetch('/api/meal-assignments');
		if (!response.ok) {
			return;
		}

		const payload = (await response.json()) as { assignments: MealAssignment[] };
		selectedMeals = payload.assignments.reduce(
			(map, assignment) => {
				map[assignment.dayIndex] = assignment;
				return map;
			},
			{} as Record<number, MealAssignment>
		);
	}

	async function loadSuggestions(dayIndex: number, forceRefresh = false) {
		loadingSuggestions = true;
		suggestionError = '';
		try {
			if (!forceRefresh && suggestionCache[dayIndex]) {
				applySuggestionPayload(suggestionCache[dayIndex]);
				return;
			}

			const payload = await fetchSuggestionPayload(0);
			cachePoolForAllDays(payload);
			applySuggestionPayload(payload);
		} catch (error) {
			suggestionError = error instanceof Error ? error.message : 'Unable to load suggestions';
		} finally {
			loadingSuggestions = false;
		}
	}

	async function preloadSuggestions() {
		if (suggestionCache[0]) {
			return;
		}

		try {
			const payload = await fetchSuggestionPayload(0);
			cachePoolForAllDays(payload);
		} catch {
			// Keep the background fetch silent and show errors only when selecting a day.
		}
	}

	async function handleDaySelect(dayIndex: number) {
		selectedDayIndex = dayIndex;
		isModalOpen = true;
		await loadSuggestions(dayIndex);
	}
	
	function handleCloseModal() {
		isModalOpen = false;
		selectedDayIndex = null;
		suggestionError = '';
	}
	
	async function handleRecipeSelect(recipe: RecipeSuggestion) {
		if (selectedDayIndex === null) {
			return;
		}

		const response = await fetch('/api/meal-assignments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				dayIndex: selectedDayIndex,
				dayName: days[selectedDayIndex],
				recipe
			})
		});

		if (response.ok) {
			const payload = (await response.json()) as { assignment: MealAssignment };
			selectedMeals[selectedDayIndex] = payload.assignment;
		}

		handleCloseModal();
	}
	
	async function handleFavorite(recipe: RecipeSuggestion) {
		await fetch('/api/recipes/feedback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ recipe, action: 'favorite' })
		});
		if (selectedDayIndex !== null) {
			await loadSuggestions(selectedDayIndex);
		}
	}

	async function handleDislike(recipe: RecipeSuggestion) {
		await fetch('/api/recipes/feedback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ recipe, action: 'dislike' })
		});
		if (selectedDayIndex !== null) {
			await loadSuggestions(selectedDayIndex);
		}
	}

	async function handleGenerateSuggestions() {
		if (selectedDayIndex !== null) {
			await loadSuggestions(selectedDayIndex, true);
		}
	}

	$effect(() => {
		if (hasInitialized) {
			return;
		}

		hasInitialized = true;
		loadAssignments();
		preloadSuggestions();
	});
</script>

<div class="week-view">
	<div class="heading">
		<div>
			<p class="eyebrow">Meal Planner</p>
			<h2>This Week</h2>
		</div>
		<a href="/settings" class="settings-link">Prompt Settings</a>
	</div>
	<div class="days-grid">
		{#each days as day, index}
			<DayCard 
				{day} 
				mealName={getMealNameForDay(index)}
				onSelect={() => handleDaySelect(index)}
			/>
		{/each}
	</div>
</div>

<Modal 
	isOpen={isModalOpen} 
	title={selectedDayName ? `Select Meal for ${selectedDayName}` : 'Select Meal'}
	onClose={handleCloseModal}
>
	{#if promptPreview}
		<p class="prompt-preview">{promptPreview}</p>
	{/if}
	<MealSelector 
		{savedRecipes}
		{generatedRecipes}
		loading={loadingSuggestions}
		error={suggestionError}
		onSelect={handleRecipeSelect}
		onFavorite={handleFavorite}
		onDislike={handleDislike}
		onGenerate={handleGenerateSuggestions}
	/>
</Modal>

<style>
	.week-view {
		padding: 1rem;
	}

	.heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #0f766e;
	}
	
	h2 {
		margin-top: 0.2rem;
		font-size: 1.5rem;
	}

	.settings-link {
		display: inline-flex;
		align-items: center;
		padding: 0.65rem 0.9rem;
		border-radius: 999px;
		background: #ecfeff;
		color: #155e75;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
		white-space: nowrap;
	}
	
	.days-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}
	
	@media (max-width: 640px) {
		.days-grid {
			grid-template-columns: 1fr;
		}
	}

	.prompt-preview {
		margin-bottom: 1rem;
		padding: 0.75rem;
		border-radius: 0.5rem;
		background: #f8fafc;
		color: #475569;
		font-size: 0.85rem;
	}
</style>
