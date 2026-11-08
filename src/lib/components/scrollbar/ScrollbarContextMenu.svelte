<script lang="ts">
	// src/lib/components/scrollbar/ScrollbarContextMenu.svelte — SCROLLBAR § 2.3
	import { SCROLLBAR_MODES, type ScrollbarMode } from '$lib/config/scrollbarModes';
	import { scrollbar } from '$lib/controllers/scrollbar.svelte';

	const modeLabels: Record<ScrollbarMode, string> = {
		wide: 'Автоматично (на широких екранах)',
		always: 'Завжди показувати кастомну смугу',
		native: 'Стандартна системна смуга',
		off: 'Приховати смугу'
	};

	function selectMode(mode: ScrollbarMode) {
		scrollbar.setMode(mode);
		scrollbar.closeMenu();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && scrollbar.menuOpen) {
			scrollbar.closeMenu();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if scrollbar.menuOpen}
	<button
		type="button"
		class="context-backdrop"
		tabindex="-1"
		aria-hidden="true"
		onclick={() => scrollbar.closeMenu()}
	></button>

	<div
		class="scrollbar-context-menu"
		style="left: {Math.min(scrollbar.menuPosition.x, window.innerWidth - 240)}px; top: {Math.min(
			scrollbar.menuPosition.y,
			window.innerHeight - 180
		)}px;"
		role="menu"
		aria-label="Налаштування смуги прокрутки"
	>
		<div class="menu-header">Режим скролбару</div>
		{#each SCROLLBAR_MODES as mode}
			<button
				type="button"
				class="menu-item"
				class:active={scrollbar.mode === mode}
				role="menuitem"
				onclick={() => selectMode(mode)}
			>
				<span class="mode-label">{modeLabels[mode]}</span>
				{#if scrollbar.mode === mode}
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
					>
				{/if}
			</button>
		{/each}
	</div>
{/if}

<style>
	.context-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9998;
		background: transparent;
		border: none;
	}

	.scrollbar-context-menu {
		position: fixed;
		z-index: 9999;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 6px;
		min-width: 230px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.menu-header {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-text-muted);
		padding: 4px 8px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		font-size: 13px;
		background: transparent;
		color: var(--color-text);
		border: none;
		border-radius: 4px;
		text-align: left;
		cursor: pointer;
	}

	.menu-item:hover {
		background: var(--color-surface-hover);
		color: var(--color-accent);
	}

	.menu-item.active {
		font-weight: 600;
		color: var(--color-accent);
	}
</style>
