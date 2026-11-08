<script lang="ts">
	// src/routes/+layout.svelte — CODE-QUALITY § 1.1.1
	import '../app.css';
	import { onMount } from 'svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import ToastLayer from '$lib/components/toast/ToastLayer.svelte';
	import PrivacyModal from '$lib/components/tree/PrivacyModal.svelte';
	import PageScrollbar from '$lib/components/scrollbar/PageScrollbar.svelte';
	import ScrollbarContextMenu from '$lib/components/scrollbar/ScrollbarContextMenu.svelte';
	import { themeFirstFrame } from '$lib/controllers/colorScheme';
	import { setTheme, themeController } from '$lib/controllers/theme.svelte';
	import { scrollbar } from '$lib/controllers/scrollbar.svelte';
	import { firstFrame } from '$lib/config/scrollbarModes';
	import { STORAGE_PREFIX } from '$lib/services/storagePrefix';
	import { logService } from '$lib/services/logService.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Hydration signal
	$effect(() => {
		document.documentElement.dataset.hydrated = '';
	});

	// Theme controller in context
	setTheme(themeController);

	// Error handling safety net
	$effect(() => {
		const onRejection = (event: PromiseRejectionEvent) => {
			logService.error('unhandled-promise', 'Unhandled promise rejection', event.reason);
		};
		const onError = (event: ErrorEvent) => {
			logService.error('window-error', `${event.message} at ${event.filename}:${event.lineno}`, event.error);
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

<div class="site-app-wrapper">
	<SiteHeader />
	<main class="site-main-content">
		{@render children()}
	</main>
	<SiteFooter />
</div>

<PageScrollbar />
<ScrollbarContextMenu />
<ToastLayer />
<PrivacyModal />

<style>
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

