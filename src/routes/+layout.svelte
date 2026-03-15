<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="app">
	<nav class="nav">
		<a href="/" class="logo">Hungry Panda</a>
		<div class="nav-links">
			<a href="/">Plan</a>
			<a href="/shopping">Shopping</a>
		</div>
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #007bff;
		color: white;
	}
	
	.logo {
		font-size: 1.25rem;
		font-weight: 600;
		color: white;
		text-decoration: none;
	}
	
	.nav-links {
		display: flex;
		gap: 1rem;
	}
	
	.nav-links a {
		color: white;
		text-decoration: none;
		font-size: 0.875rem;
	}
	
	.nav-links a:hover {
		text-decoration: underline;
	}
	
	main {
		flex: 1;
		max-width: 64rem;
		width: 100%;
		margin: 0 auto;
		padding: 1rem;
	}
</style>
