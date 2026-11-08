<script lang="ts">
	// src/lib/components/SiteHeader.svelte
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import SearchBar from '$lib/components/tree/SearchBar.svelte';
	import ThemeMenu from '$lib/components/ThemeMenu.svelte';
	import { treeViewport } from '$lib/controllers/treeViewport.svelte';
	import { privacy } from '$lib/services/privacy.svelte';

	let isFullscreen = $state<boolean>(false);

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement
				.requestFullscreen()
				.then(() => {
					isFullscreen = true;
				})
				.catch(() => {});
		} else {
			document
				.exitFullscreen()
				.then(() => {
					isFullscreen = false;
				})
				.catch(() => {});
		}
	}
</script>

<header class="site-header">
	<div class="header-left">
		<a href="{base}/" class="logo-link">
			<span class="logo-icon">🌳</span>
			<div class="logo-text-group">
				<span class="logo-title">Alik-family-tree</span>
				<span class="logo-version">v2023.02.05</span>
			</div>
		</a>

		<nav class="nav-links" aria-label="Головна навігація">
			<a
				href="{base}/"
				class="nav-link"
				class:active={page.url.pathname === `${base}/` || page.url.pathname === base}
			>
				Древо
			</a>
			<a
				href="{base}/directory"
				class="nav-link"
				class:active={page.url.pathname === `${base}/directory`}
			>
				Каталог
			</a>
			<a href="{base}/stats" class="nav-link" class:active={page.url.pathname === `${base}/stats`}>
				Статистика
			</a>
			<a href="{base}/about" class="nav-link" class:active={page.url.pathname === `${base}/about`}>
				Про проєкт
			</a>
		</nav>
	</div>

	<div class="header-center">
		{#if page.url.pathname === `${base}/` || page.url.pathname === base}
			<SearchBar />
		{/if}
	</div>

	<div class="header-right">
		{#if page.url.pathname === `${base}/` || page.url.pathname === base}
			<!-- Zoom controls toolbar -->
			<div class="zoom-toolbar" role="toolbar" aria-label="Масштабування полотна">
				<button
					type="button"
					class="tool-btn"
					onclick={() => treeViewport.zoomOut()}
					aria-label="Зменшити масштаб"
					title="Зменшити (-)"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"><line x1="5" y1="12" x2="19" y2="12" /></svg
					>
				</button>
				<button
					type="button"
					class="tool-btn zoom-label-btn"
					onclick={() => treeViewport.resetZoom()}
					title="Скинути масштаб (100%)"
				>
					{Math.round(treeViewport.scale * 100)}%
				</button>
				<button
					type="button"
					class="tool-btn"
					onclick={() => treeViewport.zoomIn()}
					aria-label="Збільшити масштаб"
					title="Збільшити (+)"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg
					>
				</button>
				<button
					type="button"
					class="tool-btn"
					onclick={() => treeViewport.fitToScreen()}
					aria-label="Вмістити на екран"
					title="Вмістити на екран"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						><path
							d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
						/></svg
					>
				</button>
			</div>
		{/if}

		<!-- Privacy Status Indicator & Toggle -->
		<button
			type="button"
			class="privacy-status-btn"
			class:unlocked={privacy.isUnlocked}
			onclick={() => {
				if (privacy.isUnlocked) privacy.lock();
				else privacy.openUnlockModal();
			}}
			title={privacy.isUnlocked
				? 'Сімейний доступ відкрито. Натисніть для блокування.'
				: 'Дані живих родичів захищено. Натисніть для вводу коду.'}
		>
			{#if privacy.isUnlocked}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
						d="M7 11V7a5 5 0 0 1 9.9-1"
					/></svg
				>
			{:else}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
						d="M7 11V7a5 5 0 0 1 10 0v4"
					/></svg
				>
			{/if}
		</button>

		<!-- Fullscreen button per FULLSCREEN-INSTALL -->
		<button
			type="button"
			class="fullscreen-btn tool-btn"
			onclick={toggleFullscreen}
			aria-label="На весь екран"
			title="На весь екран"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><path
					d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
				/></svg
			>
		</button>

		<!-- Theme Menu -->
		<ThemeMenu />
	</div>
</header>

<style>
	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 10px 16px;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		z-index: 100;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: var(--color-text);
	}

	.logo-icon {
		font-size: 22px;
	}

	.logo-text-group {
		display: flex;
		flex-direction: column;
	}

	.logo-title {
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.logo-version {
		font-size: 10px;
		color: var(--color-text-muted);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.nav-link {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-muted);
		padding: 6px 10px;
		border-radius: 6px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
		text-decoration: none;
	}

	.nav-link.active {
		color: var(--color-accent);
		background: var(--color-surface-hover);
		font-weight: 600;
	}

	.header-center {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.zoom-toolbar {
		display: flex;
		align-items: center;
		background: var(--color-surface-hover);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2px;
	}

	.tool-btn {
		background: transparent;
		border: none;
		color: var(--color-text);
		padding: 5px 8px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.tool-btn:hover {
		background: var(--color-surface);
		color: var(--color-accent);
	}

	.zoom-label-btn {
		min-width: 44px;
	}

	.privacy-status-btn {
		background: var(--color-surface-hover);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 6px 10px;
		color: #ca8a04;
		display: flex;
		align-items: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.privacy-status-btn.unlocked {
		color: #16a34a;
		border-color: rgba(22, 163, 74, 0.4);
		background: rgba(22, 163, 74, 0.08);
	}

	@media (max-width: 860px) {
		.zoom-toolbar {
			display: none;
		}
		.nav-links {
			display: none;
		}
	}
</style>
