import type { HandleClientError } from '@sveltejs/kit';
import { logService } from '$lib/services/logService.svelte';
import { chunkMissing, reloadOnce } from '$lib/utils/staleBuild';

/**
 * Client error handler for navigation, module loading, and rendering (ERROR-HANDLING-v10 § 2.2).
 */
export const handleError: HandleClientError = async ({ error, event, status, message }) => {
	if (typeof message === 'string' && message.includes('ResizeObserver loop')) return;

	const route = event.route.id ?? 'unknown';
	logService.error('app', 'Unhandled client error', { message, status, route });

	if (chunkMissing(error) && reloadOnce(event.url.href)) {
		logService.warn('app', 'stale build — reloading', { to: event.url.pathname });
		return;
	}
};
