<script lang="ts">
	// src/routes/+layout.svelte — CODE-QUALITY § 1.1.1
	import '../app.css';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import ToastLayer from '$lib/components/toast/ToastLayer.svelte';
	import PrivacyModal from '$lib/components/tree/PrivacyModal.svelte';
	import PageScrollbar from '$lib/components/scrollbar/PageScrollbar.svelte';
	import ScrollbarContextMenu from '$lib/components/scrollbar/ScrollbarContextMenu.svelte';
	import ErrorFallback from '$lib/components/ErrorFallback.svelte';
	import { themeFirstFrame } from '$lib/controllers/colorScheme';
	import { setTheme, themeController } from '$lib/controllers/theme.svelte';
	import { scrollbar } from '$lib/controllers/scrollbar.svelte';
	import { firstFrame } from '$lib/config/scrollbarModes';
	import { STORAGE_PREFIX } from '$lib/services/storagePrefix';
	import { logService } from '$lib/services/logService.svelte';
	import { freshLoad } from '$lib/utils/staleBuild';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Hydration signal
	$effect(() => {
		document.documentElement.dataset.hydrated = '';
	});

	// Stale build auto-reload (VERSIONING-v10 § 6)
	beforeNavigate((navigation) => {
		if (!updated.current || navigation.willUnload || !navigation.to?.url) return;
		logService.info('app', 'new build - full navigation', { to: navigation.to.url.pathname });
		navigation.cancel();
		void freshLoad(navigation.to.url.href);
	});

	// Theme controller in context
	setTheme(themeController);

	// Error handling safety net
	$effect(() => {
		const onRejection = (event: PromiseRejectionEvent) => {
			logService.error('unhandled-promise', 'Unhandled promise rejection', event.reason);
		};
		const onError = (event: ErrorEvent) => {
			logService.error(
				'window-error',
				`${event.message} at ${event.filename}:${event.lineno}`,
				event.error
			);
		};

		window.addEventListener('unhandledrejection', onRejection);
		window.addEventListener('error', onError);
		return () => {
			window.removeEventListener('unhandledrejection', onRejection);
			window.removeEventListener('error', onError);
		};
	});

	// SCROLLBAR § 2.3
	scrollbar.init();
	$effect(() => {
		document.documentElement.classList.toggle('has-custom-scrollbar', scrollbar.hidesNative);
	});
</script>

<svelte:head>
	<meta name="theme-first-frame" content={themeFirstFrame(STORAGE_PREFIX)} />
	<meta name="scrollbar-first-frame" content={firstFrame(STORAGE_PREFIX)} />
</svelte:head>

<a href="#main-content" class="skip-link">Перейти до основного вмісту</a>

<div class="site-app-wrapper">
	<SiteHeader />
	<main id="main-content" class="site-main-content" tabindex="-1">
		<svelte:boundary
			onerror={(error) =>
				logService.error('app', 'Render boundary caught error', { error: String(error) })}
		>
			{@render children()}

			{#snippet failed(_, reset)}
				<ErrorFallback onretry={reset} />
			{/snippet}
		</svelte:boundary>
	</main>
	<SiteFooter />
</div>

<PageScrollbar />
<ScrollbarContextMenu />
<ToastLayer />
<PrivacyModal />

<style>
	.skip-link {
		position: absolute;
		top: -9999px;
		left: 16px;
		background: var(--color-primary, #3b82f6);
		color: #ffffff;
		padding: 10px 16px;
		border-radius: 8px;
		font-weight: 700;
		text-decoration: none;
		z-index: 99999;
		transition: top 0.2s ease;
	}

	.skip-link:focus {
		top: 16px;
		outline: 3px solid #f59e0b;
	}

	.site-app-wrapper {
		display: flex;
		flex-direction: column;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
	}

	.site-main-content {
		flex: 1;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
