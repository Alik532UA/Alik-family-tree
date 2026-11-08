<script lang="ts">
	// src/lib/components/toast/ToastLayer.svelte — NOTIFICATIONS § 2.4
	import { toast } from '$lib/controllers/toast.svelte';
	import ToastCard from './ToastCard.svelte';
</script>

<div class="toast-layer-container" aria-live="polite">
	{#each toast.items as item (item.id)}
		<ToastCard
			{item}
			ondismiss={(id) => toast.dismiss(id)}
			onpause={(id) => toast.pause(id)}
			onresume={(id) => toast.resume(id)}
		/>
	{/each}
</div>

<style>
	.toast-layer-container {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 10px;
		pointer-events: none;
	}

	@media (max-width: 640px) {
		.toast-layer-container {
			left: 16px;
			right: 16px;
			bottom: 16px;
		}
	}
</style>
