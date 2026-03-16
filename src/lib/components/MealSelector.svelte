<script lang="ts">
	import type { RecipeSuggestion } from '$lib/types';
	
	interface Props {
		savedRecipes: RecipeSuggestion[];
		generatedRecipes: RecipeSuggestion[];
		loading?: boolean;
		error?: string;
		onSelect: (recipe: RecipeSuggestion) => void;
		onFavorite: (recipe: RecipeSuggestion) => void;
		onDislike: (recipe: RecipeSuggestion) => void;
		onGenerate?: () => void;
	}
	
	let {
		savedRecipes,
		generatedRecipes,
		loading = false,
		error = '',
		onSelect,
		onFavorite,
		onDislike,
		onGenerate
	}: Props = $props();
	
	let searchQuery = $state('');
	
	const allRecipes = $derived([...savedRecipes, ...generatedRecipes]);

	const filteredRecipes = $derived(
		searchQuery.trim() === '' 
			? allRecipes 
			: allRecipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	const filteredSavedRecipes = $derived(filteredRecipes.filter((recipe) => recipe.source === 'saved'));
	const filteredGeneratedRecipes = $derived(filteredRecipes.filter((recipe) => recipe.source === 'generated'));
</script>

<div class="meal-selector">
	<div class="search-box">
		<input
			type="text"
			placeholder="Search meals..."
			bind:value={searchQuery}
		/>
	</div>
	
	{#if onGenerate}
		<button class="generate-btn" onclick={onGenerate}>
			Refresh Suggestions
		</button>
	{/if}

	{#if error}
		<p class="status error">{error}</p>
	{:else if loading}
		<p class="status">Loading suggestions...</p>
	{/if}
	
	<div class="recipe-list">
		{#if !loading && filteredRecipes.length === 0}
			<div class="empty">
				{#if searchQuery}
					<p>No meals found matching "{searchQuery}"</p>
				{:else}
					<p>No meals available</p>
				{/if}
			</div>
		{:else}
			{#if filteredSavedRecipes.length > 0}
				<div class="section-title">Saved Recipes</div>
				{#each filteredSavedRecipes as recipe}
					<div class="recipe-card">
						<button class="select-btn" onclick={() => onSelect(recipe)}>
							<div class="recipe-info">
								<div class="recipe-heading">
									<h3>{recipe.name}</h3>
									{#if recipe.is_favorite}
										<span class="favorite" aria-label="Favorite recipe">★</span>
									{/if}
								</div>
								{#if recipe.description}
									<p>{recipe.description}</p>
								{/if}
								{#if recipe.prep_time || recipe.cook_time}
									<span class="time">
										{#if recipe.prep_time}Prep: {recipe.prep_time}m{/if}
										{#if recipe.prep_time && recipe.cook_time} • {/if}
										{#if recipe.cook_time}Cook: {recipe.cook_time}m{/if}
									</span>
								{/if}
							</div>
						</button>
						<div class="actions">
							<button class="action favorite-btn" type="button" onclick={() => onFavorite(recipe)}>
								Favorite
							</button>
							<button class="action dislike-btn" type="button" onclick={() => onDislike(recipe)}>
								Dislike
							</button>
						</div>
					</div>
				{/each}
			{/if}

			{#if filteredGeneratedRecipes.length > 0}
				<div class="section-title">Fresh Ideas</div>
				{#each filteredGeneratedRecipes as recipe}
					<div class="recipe-card">
						<button class="select-btn" onclick={() => onSelect(recipe)}>
							<div class="recipe-info">
								<div class="recipe-heading">
									<h3>{recipe.name}</h3>
									<span class="source-badge">AI</span>
								</div>
								{#if recipe.description}
									<p>{recipe.description}</p>
								{/if}
								{#if recipe.prep_time || recipe.cook_time}
									<span class="time">
										{#if recipe.prep_time}Prep: {recipe.prep_time}m{/if}
										{#if recipe.prep_time && recipe.cook_time} • {/if}
										{#if recipe.cook_time}Cook: {recipe.cook_time}m{/if}
									</span>
								{/if}
							</div>
						</button>
						<div class="actions">
							<button class="action favorite-btn" type="button" onclick={() => onFavorite(recipe)}>
								Save Favorite
							</button>
							<button class="action dislike-btn" type="button" onclick={() => onDislike(recipe)}>
								Dislike
							</button>
						</div>
					</div>
				{/each}
			{/if}
		{/if}
	</div>
</div>

<style>
	.meal-selector {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.search-box input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		font-size: 1rem;
	}
	
	.search-box input:focus {
		outline: none;
		border-color: #007bff;
	}
	
	.generate-btn {
		width: 100%;
		padding: 0.75rem;
		background: #ecfdf5;
		border: 2px dashed #15803d;
		border-radius: 0.5rem;
		color: #166534;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.generate-btn:hover {
		background: #dcfce7;
	}

	.status {
		font-size: 0.9rem;
		color: #52606d;
	}

	.status.error {
		color: #b42318;
	}
	
	.recipe-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 400px;
		overflow-y: auto;
	}
	
	.section-title {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #52606d;
		margin-top: 0.5rem;
	}

	.recipe-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		background: #fff;
	}

	.select-btn {
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		cursor: pointer;
	}

	.select-btn:hover h3 {
		color: #0f766e;
	}
	
	.recipe-info h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
	}

	.recipe-info p {
		margin: 0.4rem 0 0;
		font-size: 0.9rem;
		color: #52606d;
	}

	.recipe-heading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.time {
		display: inline-block;
		margin-top: 0.45rem;
		font-size: 0.8rem;
		color: #666;
	}
	
	.favorite {
		color: #ffc107;
		font-size: 1rem;
	}

	.source-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		background: #e0f2fe;
		color: #075985;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.action {
		flex: 1;
		padding: 0.65rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.favorite-btn {
		background: #fff7ed;
		color: #9a3412;
		border-color: #fdba74;
	}

	.dislike-btn {
		background: #fef2f2;
		color: #b42318;
		border-color: #fca5a5;
	}
	
	.empty {
		text-align: center;
		padding: 2rem;
		color: #666;
	}
</style>
