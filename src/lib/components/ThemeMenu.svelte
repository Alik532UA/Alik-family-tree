<script lang="ts">
	// src/lib/components/ThemeMenu.svelte — THEME-SWITCHER § 3.2
	import { THEMES, type Theme } from '$lib/controllers/colorScheme';
	import { themeController } from '$lib/controllers/theme.svelte';

	let open = $state<boolean>(false);

	const themeLabels: Record<Theme, string> = {
		light: 'Світла',
		dark: 'Темна',
		sepia: 'Сепія',
		meadow: 'Поляна',
		sky: 'Небесна'
	};

	function toggleMenu() {
		open = !open;
		if (!open) {
			themeController.preview(null);
		}
	}

	function handlePointerEnter(theme: Theme, event: PointerEvent) {
		if (event.pointerType === 'mouse') {
			themeController.preview(theme);
		}
	}

	function handlePointerLeave(event: PointerEvent) {
		if (event.pointerType === 'mouse') {
			themeController.preview(null);
		}
	}

	function selectTheme(theme: Theme) {
		themeController.choose(theme);
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			open = false;
			themeController.preview(null);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="theme-menu-container">
	<button
		type="button"
		class="theme-trigger"
		onclick={toggleMenu}
		aria-expanded={open}
		aria-label="Вибір теми оформлення"
		title="Тема сайту"
	>
		<!-- Theme palette icon -->
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
			<circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
			<circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
			<circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
			<path
				d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"
			/>
		</svg>
		<span class="theme-current-name">{themeLabels[themeController.shown]}</span>
	</button>

	{#if open}
		<!-- Backdrop for closing -->
		<button
			type="button"
			class="theme-backdrop"
			tabindex="-1"
			aria-hidden="true"
			onclick={() => {
				open = false;
				themeController.preview(null);
			}}
		></button>

		<div class="theme-popover" role="region" aria-label="Палітра тем">
			<div class="theme-title">Тема оформлення</div>
			<div class="theme-buttons-list">
				{#each THEMES as theme}
					<button
						type="button"
						class="theme-button theme-btn-{theme}"
						class:active={themeController.choice === theme}
						aria-pressed={themeController.choice === theme}
						onpointerenter={(e) => handlePointerEnter(theme, e)}
						onpointerleave={handlePointerLeave}
						onclick={() => selectTheme(theme)}
					>
						<span class="theme-swatch swatch-{theme}"></span>
						<span class="theme-btn-label">{themeLabels[theme]}</span>
						{#if themeController.choice === theme}
							<svg
								class="check-icon"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.theme-menu-container {
		position: relative;
		display: inline-block;
	}

	.theme-trigger {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		font-size: 13px;
		font-weight: 500;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.theme-trigger:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-accent);
	}

	.theme-current-name {
		display: inline-block;
	}

	.theme-backdrop {
		position: fixed;
		inset: 0;
		z-index: 998;
		background: transparent;
		border: none;
		cursor: default;
	}

	.theme-popover {
		position: absolute;
		right: 0;
		top: calc(100% + 6px);
		z-index: 999;
		min-width: 170px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 8px;
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.25),
			0 8px 10px -6px rgba(0, 0, 0, 0.1);
	}

	.theme-title {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		padding: 4px 8px 6px;
		font-weight: 600;
	}

	.theme-buttons-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.theme-button {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 10px;
		font-size: 13px;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
		text-align: left;
		transition:
			transform 0.1s ease,
			border-color 0.15s ease;
	}

	.theme-button:hover {
		transform: translateX(2px);
	}

	.theme-btn-light {
		color: #0f172a;
		background: #ffffff;
		border-color: #e2e8f0;
	}
	.theme-btn-dark {
		color: #f8fafc;
		background: #1e293b;
		border-color: #334155;
	}
	.theme-btn-sepia {
		color: #433422;
		background: #f4eedb;
		border-color: #d5c7a9;
	}
	.theme-btn-meadow {
		color: #1b4317;
		background: #e8f5e1;
		border-color: #b9dcb2;
	}
	.theme-btn-sky {
		color: #0c3359;
		background: #e0f0fe;
		border-color: #aed5fb;
	}

	.theme-button.active {
		border-width: 2px;
		font-weight: 600;
	}

	.theme-swatch {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.15);
		flex-shrink: 0;
	}

	.swatch-light {
		background: #ffffff;
	}
	.swatch-dark {
		background: #0f172a;
	}
	.swatch-sepia {
		background: #8c531b;
	}
	.swatch-meadow {
		background: #2e7d32;
	}
	.swatch-sky {
		background: #0284c7;
	}

	.theme-btn-label {
		flex: 1;
	}

	.check-icon {
		margin-left: auto;
	}
</style>
