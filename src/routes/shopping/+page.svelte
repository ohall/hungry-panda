<script lang="ts">
	import type { ShoppingListItem } from '$lib/types';
	
	// Temporary mock data
	const items: ShoppingListItem[] = [
		{ id: '1', household_id: '1', name: 'Chicken breast', category: 'Meat', quantity: '2 lbs', checked: false, is_misc: false, created_at: '', updated_at: '' },
		{ id: '2', household_id: '1', name: 'Broccoli', category: 'Produce', quantity: '1 head', checked: false, is_misc: false, created_at: '', updated_at: '' },
	];
	
	function toggleCheck(item: ShoppingListItem) {
		item.checked = !item.checked;
	}
</script>

<svelte:head>
	<title>Shopping List | Hungry Panda</title>
</svelte:head>

<section>
	<h1>Shopping List</h1>
	
	<div class="categories">
		{#each [...new Set(items.map(i => i.category))] as category}
			<div class="category">
				<h3>{category}</h3>
				<ul>
					{#each items.filter(i => i.category === category) as item}
						<li class:checked={item.checked}>
							<label>
								<input 
									type="checkbox" 
									checked={item.checked}
									onchange={() => toggleCheck(item)}
								/>
								<span>{item.name} ({item.quantity})</span>
							</label>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	
	<button class="add-misc">+ Add Item</button>
</section>

<style>
	section {
		padding: 1rem;
	}
	
	h1 {
		margin-bottom: 1rem;
	}
	
	.category {
		margin-bottom: 1.5rem;
	}
	
	.category h3 {
		font-size: 0.875rem;
		text-transform: uppercase;
		color: #666;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid #e0e0e0;
		padding-bottom: 0.25rem;
	}
	
	ul {
		list-style: none;
		padding: 0;
	}
	
	li {
		padding: 0.5rem 0;
	}
	
	li.checked span {
		text-decoration: line-through;
		color: #999;
	}
	
	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}
	
	.add-misc {
		width: 100%;
		padding: 1rem;
		background: #f0f0f0;
		border: 2px dashed #ccc;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		color: #666;
	}
	
	.add-misc:hover {
		background: #e0e0e0;
	}
</style>
