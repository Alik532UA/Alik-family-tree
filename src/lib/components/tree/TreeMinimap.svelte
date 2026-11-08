<script lang="ts">
	// src/lib/components/tree/TreeMinimap.svelte — MINIMAP
	import { base } from '$app/paths';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	let isExpanded = $state<boolean>(true);
	let isMinimapDragging = $state<boolean>(false);

	// Minimap dimensions in UI
	const MINIMAP_WIDTH = 240;
	const MINIMAP_HEIGHT = Math.round((240 * treeViewport.canvasHeight) / treeViewport.canvasWidth); // ~24px height ratio or 40px

	const minimapScale = MINIMAP_WIDTH / treeViewport.canvasWidth;
	const minimapBoxHeight = Math.max(MINIMAP_HEIGHT, 50);

	// Viewport rectangle coordinates on minimap
	const viewportBox = $derived.by(() => {
		const scale = treeViewport.scale || 0.1;
		const visibleWidth = treeViewport.containerWidth / scale;
		const visibleHeight = treeViewport.containerHeight / scale;
		const visibleLeft = -treeViewport.panX / scale;
		const visibleTop = -treeViewport.panY / scale;

		const x = Math.max(0, Math.min(MINIMAP_WIDTH, visibleLeft * minimapScale));
		const y = Math.max(
			0,
			Math.min(minimapBoxHeight, (visibleTop / treeViewport.canvasHeight) * minimapBoxHeight)
		);
		const w = Math.max(10, Math.min(MINIMAP_WIDTH, visibleWidth * minimapScale));
		const h = Math.max(
			8,
			Math.min(minimapBoxHeight, (visibleHeight / treeViewport.canvasHeight) * minimapBoxHeight)
		);

		return { x, y, width: w, height: h };
	});

	function handleMinimapClick(event: MouseEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Convert click to canvas coordinate
		const canvasX = clickX / minimapScale;
		const canvasY = (clickY / minimapBoxHeight) * treeViewport.canvasHeight;

		treeViewport.centerOnCoords(canvasX, canvasY);
	}

	function handleMinimapPointerDown(event: PointerEvent) {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		isMinimapDragging = true;
		handleMinimapPointerMove(event);
	}

	function handleMinimapPointerMove(event: PointerEvent) {
		if (!isMinimapDragging) return;
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const clickX = Math.max(0, Math.min(MINIMAP_WIDTH, event.clientX - rect.left));
		const clickY = Math.max(0, Math.min(minimapBoxHeight, event.clientY - rect.top));

		const canvasX = clickX / minimapScale;
		const canvasY = (clickY / minimapBoxHeight) * treeViewport.canvasHeight;

		treeViewport.centerOnCoords(canvasX, canvasY);
	}

	function handleMinimapPointerUp(event: PointerEvent) {
		isMinimapDragging = false;
	}
</script>

<div class="tree-minimap-wrapper" class:collapsed={!isExpanded}>
	<div class="minimap-header">
		<span class="minimap-title">Мінімапа древа</span>
		<button
			type="button"
			class="minimap-toggle-btn"
			onclick={() => (isExpanded = !isExpanded)}
			aria-label={isExpanded ? 'Згорнути мінімапу' : 'Розгорнути мінімапу'}
			title={isExpanded ? 'Згорнути' : 'Розгорнути'}
		>
			{#if isExpanded}
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><polyline points="6 9 12 15 18 9" /></svg
				>
			{:else}
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><polyline points="18 15 12 9 6 15" /></svg
				>
			{/if}
		</button>
	</div>

	{#if isExpanded}
		<div
			class="minimap-screen"
			style="width: {MINIMAP_WIDTH}px; height: {minimapBoxHeight}px;"
			onpointerdown={handleMinimapPointerDown}
			onpointermove={handleMinimapPointerMove}
			onpointerup={handleMinimapPointerUp}
			role="region"
			aria-label="Навігаційна карта"
		>
			<!-- Thumbnail background -->
			<img
				src="{base}/svg/family-tree.svg"
				alt="Мініатюра дерева"
				class="minimap-thumb"
				width={MINIMAP_WIDTH}
				height={minimapBoxHeight}
				draggable="false"
			/>

			<!-- Live Viewport Box -->
			<div
				class="viewport-indicator"
				style="left: {viewportBox.x}px; top: {viewportBox.y}px; width: {viewportBox.width}px; height: {viewportBox.height}px;"
			></div>
		</div>
	{/if}
</div>

<style>
	.tree-minimap-wrapper {
		position: absolute;
		bottom: 20px;
		left: 20px;
		z-index: 50;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		transition: all 0.2s ease;
		user-select: none;
	}

	.minimap-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		background: var(--color-surface-hover);
		border-bottom: 1px solid var(--color-border);
	}

	.minimap-toggle-btn {
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		padding: 2px 4px;
		display: flex;
		align-items: center;
		border-radius: 4px;
	}
	.minimap-toggle-btn:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}

	.minimap-screen {
		position: relative;
		cursor: crosshair;
		background: var(--color-bg);
		overflow: hidden;
	}

	.minimap-thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.75;
		filter: contrast(1.1);
		pointer-events: none;
	}

	.viewport-indicator {
		position: absolute;
		border: 2px solid var(--color-accent);
		background: rgba(37, 99, 235, 0.2);
		pointer-events: none;
		border-radius: 3px;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
	}
</style>
