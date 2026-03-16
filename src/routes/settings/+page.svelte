<script lang="ts">
	import type { PromptSettings } from '$lib/types';

	const defaultSettings: PromptSettings = {
		householdId: 'demo-household',
		positivePrompts: [],
		avoidPrompts: [],
		cuisines: [],
		pantryStaples: [],
		dietaryPreferences: [],
		maxPrepMinutes: 30,
		servings: 4,
		notes: '',
		updatedAt: ''
	};

	let settings = $state<PromptSettings>(defaultSettings);
	let loading = $state(true);
	let saving = $state(false);
	let status = $state('');

	let positiveInput = $state('');
	let avoidInput = $state('');
	let cuisineInput = $state('');
	let pantryInput = $state('');
	let dietaryInput = $state('');

	function addValue(list: keyof Pick<
		PromptSettings,
		'positivePrompts' | 'avoidPrompts' | 'cuisines' | 'pantryStaples' | 'dietaryPreferences'
	>, value: string) {
		const trimmed = value.trim();
		if (!trimmed) {
			return;
		}

		if (!settings[list].includes(trimmed)) {
			settings[list] = [...settings[list], trimmed];
		}
	}

	function removeValue(
		list: keyof Pick<
			PromptSettings,
			'positivePrompts' | 'avoidPrompts' | 'cuisines' | 'pantryStaples' | 'dietaryPreferences'
		>,
		value: string
	) {
		settings[list] = settings[list].filter((item) => item !== value);
	}

	async function loadSettings() {
		loading = true;
		const response = await fetch('/api/settings');
		const payload = (await response.json()) as { settings: PromptSettings };
		settings = payload.settings;
		loading = false;
	}

	async function saveSettings() {
		saving = true;
		status = '';
		const response = await fetch('/api/settings', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ settings })
		});
		const payload = (await response.json()) as { settings: PromptSettings };
		settings = payload.settings;
		status = 'Settings saved.';
		saving = false;
	}

	$effect(() => {
		loadSettings();
	});
</script>

<svelte:head>
	<title>Settings | Hungry Panda</title>
</svelte:head>

<section class="settings-page">
	<div class="page-header">
		<div>
			<p class="eyebrow">Settings</p>
			<h1>Recipe Prompt Defaults</h1>
			<p class="subtitle">
				Add the ingredients, preferences, and family rules that should be included whenever the app asks the model for new recipe ideas.
			</p>
		</div>
		<a class="back-link" href="/">Back to planner</a>
	</div>

	{#if loading}
		<p>Loading settings...</p>
	{:else}
		<div class="settings-grid">
			<div class="panel">
				<h2>Prompt Elements</h2>
				<div class="field-group">
					<label for="positive">Things to include</label>
					<div class="inline-input">
						<input id="positive" bind:value={positiveInput} placeholder="high-protein, one-pan dinners" />
						<button type="button" onclick={() => { addValue('positivePrompts', positiveInput); positiveInput = ''; }}>
							Add
						</button>
					</div>
					<div class="chips">
						{#each settings.positivePrompts as item}
							<button type="button" class="chip" onclick={() => removeValue('positivePrompts', item)}>
								{item} ×
							</button>
						{/each}
					</div>
				</div>

				<div class="field-group">
					<label for="avoid">Avoid</label>
					<div class="inline-input">
						<input id="avoid" bind:value={avoidInput} placeholder="mushrooms, spicy food" />
						<button type="button" onclick={() => { addValue('avoidPrompts', avoidInput); avoidInput = ''; }}>
							Add
						</button>
					</div>
					<div class="chips">
						{#each settings.avoidPrompts as item}
							<button type="button" class="chip danger" onclick={() => removeValue('avoidPrompts', item)}>
								{item} ×
							</button>
						{/each}
					</div>
				</div>

				<div class="field-group">
					<label for="cuisines">Preferred cuisines</label>
					<div class="inline-input">
						<input id="cuisines" bind:value={cuisineInput} placeholder="Italian, Mexican" />
						<button type="button" onclick={() => { addValue('cuisines', cuisineInput); cuisineInput = ''; }}>
							Add
						</button>
					</div>
					<div class="chips">
						{#each settings.cuisines as item}
							<button type="button" class="chip" onclick={() => removeValue('cuisines', item)}>
								{item} ×
							</button>
						{/each}
					</div>
				</div>

				<div class="field-group">
					<label for="pantry">Pantry staples</label>
					<div class="inline-input">
						<input id="pantry" bind:value={pantryInput} placeholder="rice, pasta, canned beans" />
						<button type="button" onclick={() => { addValue('pantryStaples', pantryInput); pantryInput = ''; }}>
							Add
						</button>
					</div>
					<div class="chips">
						{#each settings.pantryStaples as item}
							<button type="button" class="chip" onclick={() => removeValue('pantryStaples', item)}>
								{item} ×
							</button>
						{/each}
					</div>
				</div>

				<div class="field-group">
					<label for="dietary">Dietary notes</label>
					<div class="inline-input">
						<input id="dietary" bind:value={dietaryInput} placeholder="gluten-free, extra vegetables" />
						<button type="button" onclick={() => { addValue('dietaryPreferences', dietaryInput); dietaryInput = ''; }}>
							Add
						</button>
					</div>
					<div class="chips">
						{#each settings.dietaryPreferences as item}
							<button type="button" class="chip" onclick={() => removeValue('dietaryPreferences', item)}>
								{item} ×
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="panel">
				<h2>Default Constraints</h2>
				<div class="field-group">
					<label for="prep">Max prep minutes</label>
					<input id="prep" type="number" min="5" max="120" bind:value={settings.maxPrepMinutes} />
				</div>

				<div class="field-group">
					<label for="servings">Servings</label>
					<input id="servings" type="number" min="1" max="12" bind:value={settings.servings} />
				</div>

				<div class="field-group">
					<label for="notes">Extra notes</label>
					<textarea
						id="notes"
						rows="6"
						bind:value={settings.notes}
						placeholder="Anything else the model should know about your household."
					/>
				</div>

				<button class="save-btn" type="button" disabled={saving} onclick={saveSettings}>
					{saving ? 'Saving...' : 'Save Settings'}
				</button>
				{#if status}
					<p class="status">{status}</p>
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1rem 0 2rem;
	}

	.page-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #0f766e;
	}

	h1 {
		margin-top: 0.35rem;
		font-size: 2rem;
	}

	.subtitle {
		margin-top: 0.75rem;
		max-width: 42rem;
		color: #52606d;
	}

	.back-link {
		align-self: flex-start;
		padding: 0.7rem 1rem;
		border-radius: 999px;
		background: #fff7ed;
		color: #9a3412;
		text-decoration: none;
		font-weight: 600;
	}

	.settings-grid {
		display: grid;
		gap: 1rem;
	}

	.panel {
		padding: 1rem;
		border-radius: 1rem;
		background: #fff;
		border: 1px solid #e2e8f0;
	}

	h2 {
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	label {
		font-size: 0.9rem;
		font-weight: 600;
		color: #334155;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.75rem 0.9rem;
		border-radius: 0.75rem;
		border: 1px solid #cbd5e1;
		font: inherit;
	}

	.inline-input {
		display: flex;
		gap: 0.5rem;
	}

	.inline-input button,
	.save-btn {
		border: none;
		border-radius: 0.75rem;
		background: #0f766e;
		color: #fff;
		padding: 0.75rem 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		border: none;
		border-radius: 999px;
		padding: 0.45rem 0.75rem;
		background: #ecfeff;
		color: #155e75;
		cursor: pointer;
	}

	.chip.danger {
		background: #fef2f2;
		color: #b42318;
	}

	.status {
		margin-top: 0.75rem;
		color: #166534;
	}

	@media (min-width: 800px) {
		.page-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}

		.settings-grid {
			grid-template-columns: 1.3fr 0.9fr;
		}
	}
</style>
