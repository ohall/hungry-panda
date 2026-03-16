<script lang="ts">
	interface Props {
		isOpen: boolean;
		title: string;
		onClose: () => void;
		children: import('svelte').Snippet;
	}
	
	let { isOpen, title, onClose, children }: Props = $props();
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (isOpen && event.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="modal-header">
				<h2 id="modal-title">{title}</h2>
				<button class="close-btn" onclick={onClose} aria-label="Close">×</button>
			</div>
			<div class="modal-content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		padding: 1rem;
	}
	
	.modal {
		background: white;
		border-radius: 0.75rem;
		width: 100%;
		max-width: 500px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #e0e0e0;
	}
	
	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
	}
	
	.close-btn:hover {
		background: #f0f0f0;
		color: #333;
	}
	
	.modal-content {
		padding: 1rem 1.25rem;
		overflow-y: auto;
		flex: 1;
	}
</style>
