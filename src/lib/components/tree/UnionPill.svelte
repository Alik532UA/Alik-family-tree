<script lang="ts">
	// src/lib/components/tree/UnionPill.svelte — Векторна плашка союзу / шлюбу
	import type { FamilyUnion } from '$lib/data/familyTree';
	import type { CardRect } from '$lib/controllers/treeLayout.svelte';

	interface Props {
		union: FamilyUnion;
		rect: CardRect;
		onclick: () => void;
	}

	let { union, rect, onclick }: Props = $props();
	let isHovered = $state<boolean>(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick();
		}
	}
</script>

<div
	class="union-pill-node"
	style="left: {rect.x}px; top: {rect.y}px; width: {rect.width}px; height: {rect.height}px;"
	role="button"
	tabindex="0"
	aria-label="Союз: {union.spouseNames.join(' та ')}"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	{onclick}
	onkeydown={handleKeydown}
>
	<!-- Interlocking wedding rings icon -->
	<svg width="22" height="14" viewBox="0 0 22 14" class="union-rings-icon">
		<circle cx="7" cy="7" r="5" fill="none" stroke="#b45309" stroke-width="1.6" />
		<circle cx="15" cy="7" r="5" fill="none" stroke="#b45309" stroke-width="1.6" />
	</svg>

	<!-- Hover Tooltip -->
	{#if isHovered}
		<div class="union-floating-tooltip">
			<div class="tooltip-title">💍 Союз: {union.spouseNames.join(' + ') || 'Шлюб'}</div>
			<div class="tooltip-children">
				{#if union.childrenNames.length > 0}
					Діти ({union.childrenNames.length}): {union.childrenNames.join(', ')}
				{:else}
					Натисніть для вибору родини
				{/if}
			</div>
			<div class="tooltip-arrow"></div>
		</div>
	{/if}
</div>

<style>
	.union-pill-node {
		position: absolute;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff2cc;
		border: 1.5px solid #d6b656;
		border-radius: 14px;
		cursor: pointer;
		user-select: none;
		outline: none !important;
		-webkit-tap-highlight-color: transparent;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
		z-index: 20;
	}

	.union-pill-node:hover {
		transform: scale(1.08);
		border-color: #ca8a04;
		box-shadow: 0 4px 12px rgba(202, 138, 4, 0.35);
		z-index: 40;
	}

	.union-pill-node:focus-visible {
		box-shadow: 0 0 0 2.5px #ca8a04;
	}

	.union-rings-icon {
		display: block;
		pointer-events: none;
	}

	/* Floating Tooltip */
	.union-floating-tooltip {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		background: #1e293b;
		color: #f8fafc;
		border: 1px solid #475569;
		border-radius: 8px;
		padding: 6px 12px;
		font-size: 11px;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
		z-index: 100;
		animation: tooltip-fade 0.15s ease;
	}

	.tooltip-title {
		font-weight: 700;
		color: #fef08a;
		margin-bottom: 2px;
	}

	.tooltip-children {
		font-size: 10px;
		color: #cbd5e1;
	}

	.tooltip-arrow {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 5px;
		border-style: solid;
		border-color: #1e293b transparent transparent transparent;
	}

	@keyframes tooltip-fade {
		from { opacity: 0; transform: translate(-50%, 4px); }
		to { opacity: 1; transform: translate(-50%, 0); }
	}
</style>

