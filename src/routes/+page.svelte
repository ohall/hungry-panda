<script lang="ts">
	import WeekView from '$lib/components/WeekView.svelte';
	import type { Meal } from '$lib/types';
	
	// Temporary mock data
	const meals: Meal[] = [];
</script>

<svelte:head>
	<title>Hungry Panda</title>
	<meta name="description" content="Plan your family's meals for the week" />
</svelte:head>

<section>
	<WeekView {meals} />
</section>
