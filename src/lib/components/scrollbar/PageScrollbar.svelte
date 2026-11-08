<script lang="ts">
	// src/lib/components/scrollbar/PageScrollbar.svelte — SCROLLBAR § 2.3
	import { scrollbar } from '$lib/controllers/scrollbar.svelte';

	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
		scrollbar.openMenu(event.clientX, event.clientY);
	}
</script>

{#if scrollbar.hidesNative}
	<!-- Accessible custom scrollbar trigger/track -->
	<div class="page-scrollbar-container" oncontextmenu={handleContextMenu} aria-hidden="true">
		<!-- Thumb is handled natively or via custom styling in CSS -->
	</div>
{/if}

<style>
	.page-scrollbar-container {
		position: fixed;
		top: 0;
		right: 0;
		width: 12px;
		height: 100vh;
		z-index: 900;
		pointer-events: auto;
		background: transparent;
	}
</style>
