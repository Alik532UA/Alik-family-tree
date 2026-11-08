<script lang="ts">
	// src/lib/components/tree/TreeLegend.svelte — Легенда та налаштування відображення
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';

	let isExpanded = $state<boolean>(false);
</script>

<div class="tree-legend-wrapper" class:expanded={isExpanded}>
	<button
		type="button"
		class="legend-toggle-btn"
		onclick={() => (isExpanded = !isExpanded)}
		aria-expanded={isExpanded}
		aria-label="Легенда позначень древа"
		title="Легенда та параметри перегляду"
	>
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
		>
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
		<span class="legend-btn-text">Легенда</span>
	</button>

	{#if isExpanded}
		<div class="legend-panel">
			<div class="legend-title">Легенда схеми</div>

			<div class="legend-items">
				<div class="legend-item">
					<span class="swatch swatch-male"></span>
					<span class="item-label">Чоловіча лінія</span>
				</div>
				<div class="legend-item">
					<span class="swatch swatch-female"></span>
					<span class="item-label">Жіноча лінія</span>
				</div>
				<div class="legend-item">
					<span class="swatch swatch-union"></span>
					<span class="item-label">Шлюб / Союз</span>
				</div>
				<div class="legend-divider"></div>
				<div class="legend-item">
					<span class="swatch-ring ring-selected"></span>
					<span class="item-label">Обрана персона</span>
				</div>
				<div class="legend-item">
					<span class="swatch-ring ring-parent"></span>
					<span class="item-label">Батьки</span>
				</div>
				<div class="legend-item">
					<span class="swatch-ring ring-spouse"></span>
					<span class="item-label">Подружжя</span>
				</div>
				<div class="legend-item">
					<span class="swatch-ring ring-child"></span>
					<span class="item-label">Діти</span>
				</div>
			</div>

			<div class="legend-options">
				<label class="option-checkbox">
					<input type="checkbox" bind:checked={treeViewport.dimUnrelated} />
					<span>Затемнювати інших</span>
				</label>
				<label class="option-checkbox">
					<input type="checkbox" bind:checked={treeViewport.showConnectionLines} />
					<span>Прямі лінії зв'язків</span>
				</label>
			</div>
		</div>
	{/if}
</div>

<style>
	.tree-legend-wrapper {
		position: absolute;
		bottom: 20px;
		left: 275px;
		z-index: 50;
		user-select: none;
	}

	.legend-toggle-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
		transition: all 0.15s ease;
	}

	.legend-toggle-btn:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-accent);
	}

	.legend-panel {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 12px;
		min-width: 210px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.legend-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
	}

	.swatch {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.swatch-male {
		background: #dae8fc;
		border-color: #6c8ebf;
	}

	.swatch-female {
		background: #f8cecc;
		border-color: #b85450;
	}

	.swatch-union {
		background: #fff2cc;
		border-color: #d6b656;
		border-radius: 8px;
	}

	.legend-divider {
		height: 1px;
		background: var(--color-border);
		margin: 2px 0;
	}

	.swatch-ring {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		background: transparent;
	}

	.ring-selected {
		border: 2px solid #2563eb;
		box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
	}

	.ring-parent {
		border: 2px solid #0284c7;
	}

	.ring-spouse {
		border: 2px solid #d946ef;
	}

	.ring-child {
		border: 2px solid #10b981;
	}

	.item-label {
		color: var(--color-text);
	}

	.legend-options {
		border-top: 1px solid var(--color-border);
		padding-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.option-checkbox {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: var(--color-text);
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.tree-legend-wrapper {
			left: 20px;
			bottom: 80px;
		}
	}
</style>
