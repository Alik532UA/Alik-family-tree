import { sessionStore } from '$lib/services/storage';

/**
 * Recognizes system messages for missing dynamic chunks after deploy (VERSIONING-v10 § 6).
 */
export const chunkMissing = (error: unknown): boolean => {
	const text = error instanceof Error ? error.message : String(error);
	return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Unable to preload CSS/i.test(
		text
	);
};

const RELOAD_KEY = 'staleReload';

/**
 * Reloads the page bypassing browser cache.
 */
export async function freshLoad(href: string): Promise<void> {
	try {
		await fetch(href, { cache: 'reload', credentials: 'same-origin' });
	} catch {
		/* offline or network error fallback */
	}
	window.location.href = href;
}

/**
 * Reloads once per tab session to prevent infinite reload loops.
 */
export function reloadOnce(href: string): boolean {
	if (sessionStore.get(RELOAD_KEY) === href) return false;
	sessionStore.set(RELOAD_KEY, href);
	void freshLoad(href);
	return true;
}
